import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import * as publicApi from "../api/publicApi";
import {
  FaChevronLeft, FaChevronRight, FaCalendarAlt, FaClock, FaUser, FaInfoCircle, FaClipboardList, FaCheckCircle, FaExclamationCircle
} from "react-icons/fa";

export default function Schedule() {
  const navigate = useNavigate();

  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const [doctors, setDoctors] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  useEffect(() => {
    setLoading(true);
    Promise.all([
      publicApi.getDoctors().catch(() => []),
      publicApi.getAnnouncements().catch(() => [])
    ])
      .then(([docs, anns]) => {
        setDoctors(docs || []);
        setAnnouncements(anns || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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

  // Determine if clinic has active doctor shifts scheduled on date
  const isClinicOpenOnDate = (dateStr) => {
    const dayOfWeek = getDayOfWeek(dateStr);
    const activeDocs = doctors.filter(doc => {
      const hasSchedule = doc.schedules?.some(sch => sch.day_of_week === dayOfWeek && sch.schedule_status === "Active");
      if (!hasSchedule) return false;

      const isOff = doc.dayOffs?.some(off => off.dayoff_date === dateStr && off.status === "Approved");
      if (isOff) return false;

      return true;
    });

    return activeDocs.length > 0;
  };

  // Generate calendar cells (6-row grid, 42 days)
  const days = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const lastDay = new Date(year, month + 1, 0).getDate();
    const prevLastDay = new Date(year, month, 0).getDate();

    const cells = [];

    // Previous month padding
    for (let i = firstDayIndex; i > 0; i--) {
      const dayNum = prevLastDay - i + 1;
      const prevMonthNum = month === 0 ? 11 : month - 1;
      const prevYearNum = month === 0 ? year - 1 : year;
      const dateStr = `${prevYearNum}-${String(prevMonthNum + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
      cells.push({ dayNum, dateStr, isPadding: true });
    }

    // Current month days
    for (let dayNum = 1; dayNum <= lastDay; dayNum++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
      cells.push({ dayNum, dateStr, isPadding: false });
    }

    // Next month padding
    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i++) {
      const nextMonthNum = month === 11 ? 0 : month + 1;
      const nextYearNum = month === 11 ? year + 1 : year;
      const dateStr = `${nextYearNum}-${String(nextMonthNum + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      cells.push({ dayNum: i, dateStr, isPadding: true });
    }

    return cells;
  }, [currentMonth]);

  const getAnnouncementOnDate = (dateStr) => {
    return announcements.find(a => a.date === dateStr);
  };

  // Compute shifts and slot availability for selected date
  const selectedDateShifts = useMemo(() => {
    const dayOfWeek = getDayOfWeek(selectedDate);
    const shiftsList = [];

    doctors.forEach(doc => {
      // Find doctor schedules for today's weekday
      doc.schedules?.forEach(sch => {
        if (sch.day_of_week === dayOfWeek && sch.schedule_status === "Active") {
          // Check if doctor is on leave
          const isOnLeave = doc.dayOffs?.some(off => off.dayoff_date === selectedDate && off.status === "Approved");
          if (isOnLeave) return;

          // Count active booked appointments for this doctor on this specific selected date
          const bookedAppointmentsCount = doc.appointments?.filter(appt => 
            appt.appointment_date === selectedDate && 
            appt.booking_status !== "Cancelled" && 
            appt.booking_status !== "Rejected"
          ).length || 0;

          const limit = sch.slot_limit || 8;
          const availableSlots = Math.max(0, limit - bookedAppointmentsCount);

          shiftsList.push({
            schedule_id: sch.schedule_id,
            doctor_id: doc.doctor_id,
            doctorName: `Dr. ${doc.first_name} ${doc.last_name}`,
            specialization: doc.specialization?.specialization_name || "General Practice",
            start_time: sch.start_time,
            end_time: sch.end_time,
            lunch_start: sch.lunch_start,
            lunch_end: sch.lunch_end,
            room: sch.room || "Consultation Room",
            slot_limit: limit,
            booked_count: bookedAppointmentsCount,
            available_slots: availableSlots
          });
        }
      });
    });

    return shiftsList.sort((a, b) => a.start_time.localeCompare(b.start_time));
  }, [selectedDate, doctors]);

  const selectedDateAnnouncement = getAnnouncementOnDate(selectedDate);

  // Quick booking redirection
  const handleBookNow = (date, docId) => {
    navigate(`/login?redirect=/patient&date=${date}&doctor_id=${docId}`);
  };

  return (
    <div className="bg-neutralbg dark:bg-slate-950 min-h-[calc(100vh-72px)] transition-colors">
      <div className="max-w-6xl mx-auto px-6 py-10">
        
        {/* Header banner */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 rounded-2xl mb-3 border border-teal-100 dark:border-teal-900/30">
            <FaCalendarAlt className="text-2xl" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Clinic Schedule & Availability</h1>
          <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">Check scheduled doctor shifts and available time slots in real-time before booking.</p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 items-center bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-slate-800 rounded-2xl p-4 text-xs font-bold shadow-sm mb-6">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-900/50" />
            <span className="text-gray-600 dark:text-gray-400">Available Slots</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-lg bg-rose-100 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900/50" />
            <span className="text-gray-600 dark:text-gray-400">Fully Booked / Closed / Past</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar View */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            {/* Header controls */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-gray-900 dark:text-white capitalize">
                {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={prevMonth}
                  className="p-2.5 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-400 transition"
                >
                  <FaChevronLeft size={10} />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-2.5 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-400 transition"
                >
                  <FaChevronRight size={10} />
                </button>
              </div>
            </div>

            {/* Week labels */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-black text-gray-400 dark:text-slate-500 mb-3 uppercase tracking-wider">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {days.map((cell, idx) => {
                const isSelected = selectedDate === cell.dateStr;
                const todayStr = new Date().toISOString().split("T")[0];
                const dateAnnouncement = getAnnouncementOnDate(cell.dateStr);
                const isHoliday = dateAnnouncement && (dateAnnouncement.type === "Clinic Closed" || dateAnnouncement.type === "Holiday" || dateAnnouncement.type === "Emergency");

                // Availability calculation
                let isAvailable = true;
                if (cell.dateStr < todayStr || isHoliday || !isClinicOpenOnDate(cell.dateStr)) {
                  isAvailable = false;
                } else {
                  // Check if all doctors scheduled on this date are fully booked
                  const dayOfWeek = getDayOfWeek(cell.dateStr);
                  const scheduledShifts = [];
                  doctors.forEach(doc => {
                    doc.schedules?.forEach(sch => {
                      if (sch.day_of_week === dayOfWeek && sch.schedule_status === "Active") {
                        const isOnLeave = doc.dayOffs?.some(off => off.dayoff_date === cell.dateStr && off.status === "Approved");
                        if (!isOnLeave) {
                          const bookedCount = doc.appointments?.filter(appt => 
                            appt.appointment_date === cell.dateStr && 
                            appt.booking_status !== "Cancelled" && 
                            appt.booking_status !== "Rejected"
                          ).length || 0;
                          scheduledShifts.push({ limit: sch.slot_limit || 8, booked: bookedCount });
                        }
                      }
                    });
                  });

                  if (scheduledShifts.length > 0) {
                    const totalLimit = scheduledShifts.reduce((acc, s) => acc + s.limit, 0);
                    const totalBooked = scheduledShifts.reduce((acc, s) => acc + s.booked, 0);
                    if (totalBooked >= totalLimit) {
                      isAvailable = false;
                    }
                  } else {
                    isAvailable = false; // No doctors working means closed
                  }
                }

                let cellClasses = "";
                if (!cell.isPadding) {
                  if (isSelected) {
                    cellClasses = "bg-teal-600 border-teal-600 text-white shadow-lg shadow-teal-600/20 scale-[1.03] z-10 font-bold";
                  } else if (isAvailable) {
                    cellClasses = "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/30 hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 font-semibold";
                  } else {
                    cellClasses = "bg-rose-50/50 dark:bg-rose-950/10 text-rose-300 dark:text-rose-700 border-rose-100 dark:border-rose-950/20 opacity-50 line-through cursor-not-allowed";
                  }
                } else {
                  cellClasses = "text-gray-300 dark:text-slate-800 border-transparent bg-transparent cursor-default pointer-events-none opacity-20";
                }

                // Count active indicators
                const dateShifts = cell.isPadding ? [] : doctors.flatMap(doc => 
                  (doc.schedules || []).filter(sch => sch.day_of_week === getDayOfWeek(cell.dateStr) && sch.schedule_status === "Active")
                );

                return (
                  <button
                    key={idx}
                    disabled={cell.isPadding}
                    onClick={() => setSelectedDate(cell.dateStr)}
                    className={`aspect-square w-full rounded-2xl p-1 flex flex-col justify-between items-center relative transition-all border outline-none ${cellClasses}`}
                  >
                    <span className="text-xs sm:text-sm font-black self-start p-1">{cell.dayNum}</span>

                    {/* Indicators */}
                    {!cell.isPadding && (
                      <div className="flex gap-1 items-center justify-center pb-1">
                        {isHoliday && (
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" title="Clinic Closed" />
                        )}
                        {!isHoliday && dateShifts.slice(0, 3).map((_, dotIdx) => (
                          <span 
                            key={dotIdx} 
                            className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : (isAvailable ? "bg-emerald-500" : "bg-rose-400")}`}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Availability Side Details */}
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col">
            <div className="border-b border-gray-100 dark:border-slate-800 pb-4 mb-4 shrink-0">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Selected Date Availability</p>
              <h3 className="text-base font-black text-gray-900 dark:text-white mt-1">
                {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-hide">
              {/* Holiday Alert */}
              {selectedDateAnnouncement && (
                <div className={`p-4 rounded-2xl border flex gap-3 ${
                  selectedDateAnnouncement.type === "Clinic Closed" || selectedDateAnnouncement.type === "Holiday"
                    ? "bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/30 text-rose-800 dark:text-rose-300"
                    : "bg-teal-50 dark:bg-teal-950/20 border-teal-200 dark:border-teal-900/30 text-teal-800 dark:text-teal-300"
                }`}>
                  <FaInfoCircle size={18} className="shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-xs leading-snug">{selectedDateAnnouncement.title}</h4>
                    <p className="text-[11px] mt-1 leading-relaxed">{selectedDateAnnouncement.reason || selectedDateAnnouncement.body}</p>
                    <span className="inline-block mt-2 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-black/5 dark:bg-white/10">
                      {selectedDateAnnouncement.type}
                    </span>
                  </div>
                </div>
              )}

              {/* Scheduled Shifts Title */}
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                Active Shifts ({selectedDateShifts.length})
              </div>

              {loading ? (
                <div className="text-center py-10 text-xs text-gray-500 dark:text-gray-400 animate-pulse">Loading daily schedules...</div>
              ) : selectedDateShifts.length === 0 ? (
                <div className="p-6 text-center border-2 border-dashed border-gray-100 dark:border-slate-800/80 rounded-2xl text-gray-400">
                  <FaExclamationCircle size={24} className="mx-auto mb-2 text-gray-300 dark:text-slate-600" />
                  <p className="text-xs">No doctors scheduled on this date.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedDateShifts.map((shift) => {
                    const isFuture = selectedDate >= new Date().toISOString().split("T")[0];
                    const isFull = shift.available_slots <= 0;
                    
                    return (
                      <div 
                        key={shift.schedule_id} 
                        className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/50 rounded-2xl p-4 space-y-3"
                      >
                        {/* Time & Room header */}
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-black text-teal-600 dark:text-teal-400 flex items-center gap-1">
                            <FaClock size={10} /> {shift.start_time.slice(0,5)} - {shift.end_time.slice(0,5)}
                          </span>
                          <span className="bg-slate-200/60 dark:bg-slate-800 px-2 py-0.5 rounded-lg font-bold text-[10px] text-slate-600 dark:text-slate-400">
                            📍 {shift.room}
                          </span>
                        </div>

                        {/* Doctor info */}
                        <div className="text-xs space-y-1">
                          <p className="font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5">
                            <FaUser className="text-teal-600 shrink-0" size={10} />
                            {shift.doctorName}
                          </p>
                          <p className="text-gray-500 dark:text-slate-400 flex items-center gap-1.5">
                            <FaClipboardList className="shrink-0" size={10} />
                            {shift.specialization}
                          </p>
                        </div>

                        {/* Slots indicator */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 space-y-1.5">
                          <div className="flex justify-between items-center text-[10px] font-bold">
                            <span className="text-slate-400 uppercase tracking-widest">Shift Occupancy</span>
                            {isFull ? (
                              <span className="text-rose-600 font-extrabold uppercase">🚨 Fully Booked</span>
                            ) : (
                              <span className="text-emerald-600 font-extrabold uppercase">
                                ✅ {shift.available_slots} of {shift.slot_limit} slots free
                              </span>
                            )}
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-300 ${isFull ? 'bg-rose-500' : 'bg-emerald-500'}`}
                              style={{ width: `${(shift.booked_count / shift.slot_limit) * 100}%` }}
                            />
                          </div>
                        </div>

                        {/* Guest Booking Call to Action */}
                        {isFuture && (
                          <button
                            disabled={isFull}
                            onClick={() => handleBookNow(selectedDate, shift.doctor_id)}
                            className={`w-full py-2.5 rounded-xl font-bold text-xs transition active:scale-[0.98] ${
                              isFull 
                                ? 'bg-slate-100 dark:bg-slate-800/30 text-slate-400 cursor-not-allowed'
                                : 'bg-teal-600 text-white shadow-md hover:bg-teal-500'
                            }`}
                          >
                            {isFull ? 'Shift Fully Booked' : 'Book This Shift'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
