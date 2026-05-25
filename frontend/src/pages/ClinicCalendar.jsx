import { useState, useEffect } from "react";
import { useAuth } from "../state/auth";
import * as publicApi from "../api/publicApi";
import * as patientApi from "../api/patientApi";
import * as doctorApi from "../api/doctorApi";
import * as staffApi from "../api/staffApi";
import {
  FaChevronLeft, FaChevronRight, FaCalendarAlt, FaClock, FaUser, FaClipboardList, FaInfoCircle, FaCheckCircle, FaTimesCircle
} from "react-icons/fa";

const STATUS_BADGES = {
  Confirmed:   { bg: 'bg-green-100 dark:bg-green-950/30',  text: 'text-green-700 dark:text-green-400'  },
  Pending:     { bg: 'bg-yellow-100 dark:bg-yellow-950/30', text: 'text-yellow-700 dark:text-yellow-400' },
  Cancelled:   { bg: 'bg-red-100 dark:bg-red-950/30',     text: 'text-red-700 dark:text-red-400'     },
  Completed:   { bg: 'bg-blue-100 dark:bg-blue-950/30',   text: 'text-blue-700 dark:text-blue-400'   },
  'No Show':   { bg: 'bg-gray-100 dark:bg-gray-950/30',   text: 'text-gray-600 dark:text-gray-400'   },
  Rescheduled: { bg: 'bg-purple-100 dark:bg-purple-950/30',text: 'text-purple-700 dark:text-purple-400'},
};

export default function ClinicCalendar() {
  const { user } = useAuth();
  const role = user?.role || "patient";

  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const [appointments, setAppointments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Manila"}));
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  
  // Detail card expand/collapse status
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetchPromises = [
      publicApi.getAnnouncements(),
      publicApi.getDoctors().catch(() => [])
    ];

    if (role === "patient") {
      fetchPromises.push(patientApi.getDashboard().then(d => d.appointments || []));
    } else if (role === "doctor") {
      fetchPromises.push(doctorApi.getAppointments());
    } else if (role === "staff" || role === "admin") {
      fetchPromises.push(staffApi.getAppointments());
    }

    Promise.all(fetchPromises)
      .then(([ann, docs, appts]) => {
        setAnnouncements(ann || []);
        setDoctors(docs || []);
        setAppointments(appts || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [role]);

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const getDayOfWeek = (dateStr) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const [year, month, day] = dateStr.split("-").map(Number);
    const d = new Date(year, month - 1, day);
    return days[d.getDay()];
  };

  const isClinicOpenOnDate = (dateStr) => {
    const dayOfWeek = getDayOfWeek(dateStr);

    // If role is doctor, check if this specific doctor has schedule and is not on leave
    if (role === "doctor" && user?.doctor_id) {
      const doc = doctors.find(d => d.doctor_id === user.doctor_id);
      if (!doc) return true; // fallback if data hasn't loaded

      const hasSchedule = doc.schedules?.some(sch => sch.day_of_week === dayOfWeek && sch.schedule_status === "Active");
      if (!hasSchedule) return false;

      const isOff = doc.dayOffs?.some(off => off.dayoff_date === dateStr && off.status === "Approved");
      if (isOff) return false;

      return true;
    }

    // For patients, admin, staff: check if ANY active doctor is scheduled and not on approved day off
    const activeDocs = doctors.filter(doc => {
      const hasSchedule = doc.schedules?.some(sch => sch.day_of_week === dayOfWeek && sch.schedule_status === "Active");
      if (!hasSchedule) return false;

      const isOff = doc.dayOffs?.some(off => off.dayoff_date === dateStr && off.status === "Approved");
      if (isOff) return false;

      return true;
    });

    return activeDocs.length > 0;
  };

  // Generate calendar days for currentMonth
  const renderCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const lastDay = new Date(year, month + 1, 0).getDate();
    const prevLastDay = new Date(year, month, 0).getDate();

    const cells = [];

    // Previous month padding days
    for (let i = firstDayIndex; i > 0; i--) {
      const dayNum = prevLastDay - i + 1;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
      cells.push({ dayNum, dateStr, isPadding: true });
    }

    // Current month days
    for (let dayNum = 1; dayNum <= lastDay; dayNum++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
      cells.push({ dayNum, dateStr, isPadding: false });
    }

    // Next month padding days to complete 6-row grid (42 cells)
    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      cells.push({ dayNum: i, dateStr, isPadding: true });
    }

    return cells;
  };

  const days = renderCalendarDays();

  // Find announcements or closures on a date
  const getAnnouncementOnDate = (dateStr) => {
    return announcements.find(a => a.date === dateStr);
  };

  // Find appointments on a date
  const getAppointmentsOnDate = (dateStr) => {
    return appointments.filter(a => a.appointment_date === dateStr);
  };

  const selectedDateAppointments = getAppointmentsOnDate(selectedDate);
  const selectedDateAnnouncement = getAnnouncementOnDate(selectedDate);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-primary to-teal-500 rounded-2xl p-6 text-white shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
            <FaCalendarAlt />
          </div>
          <div>
            <h1 className="text-2xl font-bold capitalize">{role} Clinic Calendar</h1>
            <p className="text-white/80 text-sm mt-1">View schedules, active appointments, and clinic operating holidays at a glance.</p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 items-center bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl p-4 text-xs font-bold shadow-sm">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-900/50" />
          <span className="text-gray-600 dark:text-gray-400">Available Slots</span>
        </div>
        {(role === "patient" || role === "doctor") && (
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-amber-100 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/50" />
            <span className="text-gray-600 dark:text-gray-400">Your Appointment / Active Visits</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded bg-rose-100 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900/50" />
          <span className="text-gray-600 dark:text-gray-400">Fully Booked / Closed / Past</span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left 2 columns: Calendar Grid */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          {/* Controls */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white capitalize">
              {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={prevMonth}
                className="p-2 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-400 transition"
              >
                <FaChevronLeft size={12} />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-400 transition"
              >
                <FaChevronRight size={12} />
              </button>
            </div>
          </div>

          {/* Week headers */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-black text-gray-400 dark:text-slate-500 mb-3 uppercase tracking-wider">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((cell, idx) => {
              const isSelected = selectedDate === cell.dateStr;
              const dateAppointments = getAppointmentsOnDate(cell.dateStr);
              const dateAnnouncement = getAnnouncementOnDate(cell.dateStr);
              const isHoliday = dateAnnouncement && (dateAnnouncement.type === "Clinic Closed" || dateAnnouncement.type === "Holiday" || dateAnnouncement.type === "Emergency");
              const dNow = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Manila"}));
              const todayStr = `${dNow.getFullYear()}-${String(dNow.getMonth() + 1).padStart(2, "0")}-${String(dNow.getDate()).padStart(2, "0")}`;

              // Priority Color Scheme logic:
              // 1. Yellow if user has appointment on this date (Patient & Doctor only)
              // 2. Red if past / holiday / fully booked (count >= 8)
              // 3. Green if free slots are available
              let hasUserAppt = false;
              if (role === "patient" && user?.patient_id) {
                hasUserAppt = dateAppointments.some(a => a.patient_id === user.patient_id && a.booking_status !== 'Cancelled');
              } else if (role === "doctor" && user?.doctor_id) {
                hasUserAppt = dateAppointments.some(a => a.doctor_id === user.doctor_id && a.booking_status !== 'Cancelled');
              }

              let cellStatus = "green";
              if (cell.dateStr < todayStr || isHoliday || !isClinicOpenOnDate(cell.dateStr)) {
                cellStatus = "unavailable";
              } else if ((role === "patient" || role === "doctor") && hasUserAppt) {
                cellStatus = "yellow";
              } else if (dateAppointments.length >= 8) {
                cellStatus = "full";
              }

              let cellClasses = "";
              if (!cell.isPadding) {
                if (isSelected) {
                  cellClasses = "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-[1.03] z-10";
                } else if (cellStatus === "yellow") {
                  cellClasses = "bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700/50 hover:bg-amber-200 dark:hover:bg-amber-900/30 ring-2 ring-amber-400 dark:ring-amber-500/50 font-black";
                } else if (cellStatus === "full") {
                  cellClasses = "bg-rose-100 dark:bg-rose-950/20 text-rose-800 dark:text-rose-400 border-rose-300 dark:border-rose-900/30 opacity-70 line-through cursor-not-allowed";
                } else if (cellStatus === "unavailable") {
                  cellClasses = "bg-rose-50/50 dark:bg-rose-950/10 text-rose-300 dark:text-rose-700 border-rose-100 dark:border-rose-950/20 opacity-40 line-through cursor-not-allowed";
                } else {
                  cellClasses = "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/30 hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-emerald-100 dark:hover:bg-emerald-900/30";
                }
              } else {
                cellClasses = "text-gray-300 dark:text-slate-800 border-transparent bg-transparent cursor-default pointer-events-none opacity-20";
              }

              return (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedDate(cell.dateStr);
                    setExpanded(true);
                  }}
                  className={`aspect-square w-full rounded-2xl p-1 flex flex-col justify-between items-center relative transition-all border outline-none ${cellClasses}`}
                >
                  <span className="text-xs sm:text-sm font-extrabold self-start p-1">{cell.dayNum}</span>

                  {/* Dynamic Indicators */}
                  {!cell.isPadding && (
                    <div className="flex gap-1 items-center justify-center pb-1">
                      {isHoliday && (
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" title="Clinic Closed" />
                      )}
                      {dateAppointments.slice(0, 3).map((a, dotIdx) => {
                        let dotColor = "bg-yellow-500";
                        if (a.booking_status === "Confirmed") dotColor = "bg-green-500";
                        else if (a.booking_status === "Completed") dotColor = "bg-blue-500";
                        else if (a.booking_status === "Cancelled") dotColor = "bg-red-400";

                        return (
                          <span 
                            key={dotIdx} 
                            className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : dotColor}`}
                          />
                        );
                      })}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 1 column: Expandable Date Details & Appointments */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col">
          {/* Header */}
          <div className="border-b border-gray-100 dark:border-slate-800 pb-4 mb-4 shrink-0">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Selected Date</p>
            <h3 className="text-base font-bold text-gray-900 dark:text-white mt-1">
              {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </h3>
          </div>

          {/* Content panel */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-hide">
            {/* Announcement Section */}
            {selectedDateAnnouncement && (
              <div className={`p-4 rounded-xl border flex gap-3 ${
                selectedDateAnnouncement.type === "Clinic Closed" || selectedDateAnnouncement.type === "Holiday"
                  ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30 text-red-800 dark:text-red-300"
                  : "bg-teal-50 dark:bg-teal-950/20 border-teal-200 dark:border-teal-900/30 text-teal-800 dark:text-teal-300"
              }`}>
                <FaInfoCircle size={20} className="shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm leading-snug">{selectedDateAnnouncement.title}</h4>
                  <p className="text-xs mt-1 leading-relaxed">{selectedDateAnnouncement.reason || selectedDateAnnouncement.body}</p>
                  <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-black/5 dark:bg-white/10">
                    {selectedDateAnnouncement.type}
                  </span>
                </div>
              </div>
            )}

            {/* Title */}
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Schedule ({selectedDateAppointments.length})
              </span>
              <button 
                onClick={() => setExpanded(!expanded)} 
                className="text-xs text-primary font-bold hover:underline"
              >
                {expanded ? "Collapse" : "Expand"}
              </button>
            </div>

            {expanded && (
              <div className="space-y-3">
                {loading ? (
                  <div className="text-center py-6 text-xs text-gray-500 dark:text-gray-400 animate-pulse">Loading daily schedules...</div>
                ) : selectedDateAppointments.length === 0 ? (
                  <div className="p-6 text-center border-2 border-dashed border-gray-100 dark:border-slate-800 rounded-xl text-gray-400">
                    <FaCalendarAlt size={24} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-xs">No appointments booked for this date.</p>
                  </div>
                ) : (
                  selectedDateAppointments.map(appt => {
                    const badge = STATUS_BADGES[appt.booking_status] || STATUS_BADGES.Pending;

                    return (
                      <div 
                        key={appt.appointment_id} 
                        className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/50 rounded-xl p-4 space-y-2 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex justify-between items-center">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase ${badge.bg} ${badge.text}`}>
                            {appt.booking_status}
                          </span>
                          <span className="text-xs font-black text-slate-500 flex items-center gap-1">
                            <FaClock size={10} /> {appt.start_time}
                          </span>
                        </div>

                        {role === "patient" ? (
                          <div className="text-xs space-y-1">
                            <p className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                              <FaUser className="text-primary shrink-0" size={10} />
                              Dr. {appt.doctor?.first_name} {appt.doctor?.last_name}
                            </p>
                            <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                              <FaClipboardList className="shrink-0" size={10} />
                              {appt.service?.service_name}
                            </p>
                          </div>
                        ) : (
                          <div className="text-xs space-y-1">
                            <p className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                              <FaUser className="text-primary shrink-0" size={10} />
                              Patient: {appt.patient?.first_name} {appt.patient?.last_name}
                            </p>
                            <p className="text-gray-500 dark:text-gray-400">
                              <strong>Doctor:</strong> Dr. {appt.doctor?.first_name} {appt.doctor?.last_name}
                            </p>
                            <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                              <FaClipboardList className="shrink-0" size={10} />
                              {appt.service?.service_name}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
