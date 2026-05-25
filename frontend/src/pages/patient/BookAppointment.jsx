import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCheck, FaArrowRight, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useAuth } from "../../state/auth";
import * as publicApi from "../../api/publicApi";
import * as patientApi from "../../api/patientApi";

const steps = ["Type of Concern", "Doctor", "Date & Time", "Reason", "Confirm"];

const CONCERN_MAPPING = {
  "General Consultation": "General Illness / Wellness Checkup",
  "Cardiology Diagnostic": "Heart or Chest Pain / Cardiovascular Check",
  "Pediatric Checkup": "Child Health / Pediatric Care",
  "Dental Cleaning & Exam": "Teeth & Gum / Dental Care",
  "Standard Eye Assessment": "Eye Health / Vision Check",
  "Comprehensive Blood Panel": "Lab Tests / Blood Work Screening",
  "Physical Therapy Rehab": "Physical Recovery / Therapy & Muscle Care",
  "Dermatology Consult": "Skin or Allergy Concern",
  "Nutritional Guidance": "Diet, Nutrition & Weight Management",
  "Flu Immunization Shot": "Vaccination & Flu Shots"
};

export default function BookAppointment() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  const [services, setServices] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [patientAppointments, setPatientAppointments] = useState([]);

  // Doctor name search state
  const [searchTerm, setSearchTerm] = useState("");

  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const [step, setStep] = useState(() => {
    const saved = sessionStorage.getItem("booking_step");
    return saved ? parseInt(saved, 10) : 1;
  });
  const [selectedServices, setSelectedServices] = useState(() => {
    const saved = sessionStorage.getItem("booking_services");
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedDoctor, setSelectedDoctor] = useState(() => {
    const saved = sessionStorage.getItem("booking_doctor");
    return saved ? JSON.parse(saved) : null;
  });
  const [selectedDate, setSelectedDate] = useState(() => {
    return sessionStorage.getItem("booking_date") || "";
  });
  const [selectedSchedule, setSelectedSchedule] = useState(() => {
    const saved = sessionStorage.getItem("booking_schedule");
    return saved ? JSON.parse(saved) : null;
  });
  const [reason, setReason] = useState(() => {
    return sessionStorage.getItem("booking_reason") || "";
  });
  
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotMessage, setSlotMessage] = useState("");

  useEffect(() => {
    Promise.all([
      publicApi.getServices(),
      publicApi.getDoctors(),
      publicApi.getAnnouncements(),
      patientApi.getDashboard().catch(() => ({ appointments: [] }))
    ])
      .then(([s, d, a, dash]) => {
        setServices(s.filter(srv => srv.status !== "Inactive"));
        setDoctors(d);
        setAnnouncements(a || []);
        setPatientAppointments(dash?.appointments || []);
      })
      .catch(console.error)
      .finally(() => setDataLoading(false));
  }, []);

  useEffect(() => {
    if (doctors.length > 0 && selectedDoctor) {
      const freshDoc = doctors.find(d => d.doctor_id === selectedDoctor.doctor_id);
      if (freshDoc) {
        setSelectedDoctor(freshDoc);
        sessionStorage.setItem("booking_doctor", JSON.stringify(freshDoc));
      } else {
        setSelectedDoctor(null);
        sessionStorage.removeItem("booking_doctor");
      }
    }
  }, [doctors]);

  // Reset search when service changes
  useEffect(() => {
    setSearchTerm("");
  }, [selectedServices]);

  // Filtered doctors: only show doctors matching the selected concerns (if any have specialization mapping)
  const filteredDoctors = useMemo(() => {
    return doctors.filter(d => {
      const matchesSearch = searchTerm.trim() === "" ||
        `${d.first_name} ${d.last_name}`.toLowerCase().includes(searchTerm.trim().toLowerCase());
      return matchesSearch;
    });
  }, [doctors, selectedServices, searchTerm]);


  const primaryService = selectedServices[0];
  const requiresDoctor = primaryService ? (Boolean(Number(primaryService.requires_doctor ?? 1))) : true;

  const stepsList = useMemo(() => {
    if (!requiresDoctor) {
      return [
        { label: "Type of Concern", stepNum: 1 },
        { label: "Date & Time", stepNum: 3 },
        { label: "Reason", stepNum: 4 },
        { label: "Confirm", stepNum: 5 }
      ];
    }
    return [
      { label: "Type of Concern", stepNum: 1 },
      { label: "Doctor", stepNum: 2 },
      { label: "Date & Time", stepNum: 3 },
      { label: "Reason", stepNum: 4 },
      { label: "Confirm", stepNum: 5 }
    ];
  }, [requiresDoctor]);

  const next = () => {
    let targetStep = step + 1;
    if (step === 1 && !requiresDoctor) {
      targetStep = 3;
    }
    setStep(targetStep);
    sessionStorage.setItem("booking_step", targetStep);
  };
  const back = () => {
    let targetStep = step - 1;
    if (step === 3 && !requiresDoctor) {
      targetStep = 1;
    }
    setStep(targetStep);
    sessionStorage.setItem("booking_step", targetStep);
  };

  const handleToggleService = (s) => {
    // Single select to prevent selecting mixed types (Consultation vs Direct Service)
    const newServices = [s];
    setSelectedServices(newServices);
    setSelectedDoctor(null); 
    setSelectedSchedule(null);
    sessionStorage.setItem("booking_services", JSON.stringify(newServices));
    sessionStorage.removeItem("booking_doctor");
    sessionStorage.removeItem("booking_schedule");
  };

  const handleSelectDoctor = (d) => {
    setSelectedDoctor(d);
    setSelectedSchedule(null);
    sessionStorage.setItem("booking_doctor", JSON.stringify(d));
    sessionStorage.removeItem("booking_schedule");
  };

  const handleSetDate = (val) => {
    setSelectedDate(val);
    setSelectedSchedule(null); 
    sessionStorage.setItem("booking_date", val);
    sessionStorage.removeItem("booking_schedule");
  };

  const handleSetSchedule = (sch) => {
    setSelectedSchedule(sch);
    sessionStorage.setItem("booking_schedule", JSON.stringify(sch));
  };

  const handleSetReason = (val) => {
    setReason(val);
    sessionStorage.setItem("booking_reason", val);
  };

  useEffect(() => {
    if (selectedDate && selectedServices.length > 0) {
      if (requiresDoctor && !selectedDoctor) {
        setSlots([]);
        return;
      }
      setSlotsLoading(true);
      setSlotMessage("");
      publicApi.getAvailableSlots(requiresDoctor ? selectedDoctor.doctor_id : null, selectedDate, selectedServices[0].id || selectedServices[0].service_id)
        .then(res => {
          setSlots(res.slots || []);
          if (res.message) setSlotMessage(res.message);
        })
        .catch(err => {
          console.error(err);
          setSlotMessage("Error loading available slots.");
        })
        .finally(() => setSlotsLoading(false));
    } else {
      setSlots([]);
    }
  }, [selectedDoctor, selectedDate, selectedServices, requiresDoctor]);

  const submitBooking = async () => {
    if (user?.verification_status === "Pending" || user?.verification_status === "Rejected") {
       alert("You must upload a valid ID in your profile before booking.");
       navigate("/patient/profile");
       return;
    }
    
    setLoading(true);
    try {
       const concernsText = selectedServices.map(s => s.name || s.service_name).join(', ');
       const finalReason = `Concerns: ${concernsText}. ${reason}`;
       await patientApi.bookAppointment({
         doctor_id: requiresDoctor ? selectedDoctor.doctor_id : null,
         service_id: selectedServices[0].id || selectedServices[0].service_id,
         schedule_id: requiresDoctor ? selectedSchedule.schedule_id : null,
         appointment_date: selectedDate,
         start_time: selectedSchedule.start_time,
         end_time: selectedSchedule.end_time,
         reason_for_visit: finalReason
       });
       
       sessionStorage.removeItem("booking_step");
       sessionStorage.removeItem("booking_services");
       sessionStorage.removeItem("booking_doctor");
       sessionStorage.removeItem("booking_date");
       sessionStorage.removeItem("booking_schedule");
       sessionStorage.removeItem("booking_reason");
       
       alert("Appointment booked successfully!");
       navigate("/patient");
    } catch (e) {
       alert(e.response?.data?.message || "Booking failed. Please try again.");
    } finally {
       setLoading(false);
    }
  };

  const getDayOfWeek = (dateString) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const [year, month, day] = dateString.split("-").map(Number);
    const d = new Date(year, month - 1, day);
    return days[d.getDay()];
  };

  const checkDateBookability = (dateStr) => {
    const hasPatientAppt = patientAppointments.some(a => a.appointment_date === dateStr && a.booking_status !== 'Cancelled');
    if (hasPatientAppt) return { disabled: false, reason: "You have an appointment on this day", status: "yellow", isFull: false };

    const todayStr = new Date().toISOString().split("T")[0];
    if (dateStr < todayStr) return { disabled: true, reason: "Past date", status: "unavailable", isFull: false };

    const holiday = announcements.find(a => 
      a.date === dateStr && 
      a.applies_to_type === "Whole Clinic" && 
      (a.type === "Clinic Closed" || a.type === "Holiday" || a.type === "Emergency")
    );
    if (holiday) return { disabled: true, reason: `Clinic Holiday: ${holiday.title}`, status: "unavailable", isFull: false };

    let isFull = false;
    if (selectedDoctor) {
      const dOff = selectedDoctor.dayOffs?.find(d => d.dayoff_date === dateStr && d.status === "Approved");
      if (dOff) return { disabled: true, reason: `Doctor Leave: ${dOff.reason || "Day off"}`, status: "unavailable", isFull: false };

      const dayOfWeek = getDayOfWeek(dateStr);
      const hasSchedule = selectedDoctor.schedules?.some(sch => sch.day_of_week === dayOfWeek && sch.schedule_status === "Active");
      if (!hasSchedule) return { disabled: true, reason: "Doctor not scheduled on this weekday", status: "unavailable", isFull: false };

      const specialDoc = announcements.find(a => 
        a.date === dateStr && 
        a.applies_to_type === "Specific Doctor" && 
        parseInt(a.applies_to_id, 10) === selectedDoctor.doctor_id &&
        (a.type === "Clinic Closed" || a.type === "Emergency")
      );
      if (specialDoc) return { disabled: true, reason: `Doctor Unavailable: ${specialDoc.title}`, status: "unavailable", isFull: false };

      const bookedCount = selectedDoctor.appointments?.filter(a => a.appointment_date === dateStr && a.booking_status !== 'Cancelled').length || 0;
      const sch = selectedDoctor.schedules?.find(s => s.day_of_week === dayOfWeek && s.schedule_status === "Active");
      let totalSlots = 8;
      if (sch) {
        const [sh, sm] = sch.start_time.split(':').map(Number);
        const [eh, em] = sch.end_time.split(':').map(Number);
        const totalMinutes = (eh * 60 + em) - (sh * 60 + sm);
        const duration = selectedServices.length > 0 && selectedServices[0].estimated_duration ? selectedServices[0].estimated_duration : 30;
        totalSlots = Math.floor(totalMinutes / duration) || 8;
      }

      if (bookedCount >= totalSlots) {
        return { disabled: true, reason: "Doctor is fully booked for this day", status: "full", isFull: true };
      }
    }

    return { disabled: false, reason: "Available", status: "green", isFull: false };
  };
  useEffect(() => {
    if (step === 3 && !dataLoading) {
      const currentAvail = checkDateBookability(selectedDate || new Date().toISOString().split("T")[0]);
      if (currentAvail.disabled && currentAvail.status !== "yellow") {
        let checkDate = new Date();
        for (let i = 0; i < 60; i++) {
          const dStr = checkDate.toISOString().split("T")[0];
          const avail = checkDateBookability(dStr);
          if (!avail.disabled || avail.status === "yellow") {
            handleSetDate(dStr);
            setCurrentMonth(new Date(checkDate.getFullYear(), checkDate.getMonth(), 1));
            break;
          }
          checkDate.setDate(checkDate.getDate() + 1);
        }
      }
    }
  }, [step, selectedDoctor, selectedServices, dataLoading, requiresDoctor]);

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const lastDay = new Date(year, month + 1, 0).getDate();
    const prevLastDay = new Date(year, month, 0).getDate();

    const cells = [];
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    // Previous month padding days
    for (let i = firstDayIndex; i > 0; i--) {
      const dayNum = prevLastDay - i + 1;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
      cells.push({
        dayNum,
        dateStr,
        isPadding: true,
        disabled: true,
        reason: "Previous month",
        status: "unavailable"
      });
    }

    // Current month days
    for (let dayNum = 1; dayNum <= lastDay; dayNum++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
      
      const { disabled, reason, status } = checkDateBookability(dateStr);

      cells.push({
        dayNum,
        dateStr,
        isPadding: false,
        disabled,
        reason,
        status
      });
    }

    // Next month padding days to complete 6 rows
    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      cells.push({
        dayNum: i,
        dateStr,
        isPadding: true,
        disabled: true,
        reason: "Next month",
        status: "unavailable"
      });
    }

    return cells;
  };

  const isDayOff = selectedDoctor && selectedDate 
    ? selectedDoctor.dayOffs?.some(dOff => dOff.dayoff_date === selectedDate && dOff.status === "Approved")
    : false;

  const existingAppt = selectedDate 
    ? patientAppointments.find(a => a.appointment_date === selectedDate && a.booking_status !== 'Cancelled')
    : null;

  if (dataLoading) return <div className="text-center p-10 text-gray-500">Loading booking form...</div>;

  return (
    <div>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Book Appointment</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Follow the steps below to schedule your visit</p>

        <div className="mb-6 p-4 bg-teal-500/10 dark:bg-teal-500/5 text-teal-850 dark:text-teal-300 rounded-xl border border-teal-500/20 dark:border-teal-800/30 text-xs flex items-center gap-2 shadow-sm font-semibold">
          🛡️ <span className="font-bold text-teal-950 dark:text-teal-200">Anti-Spam Policy:</span> To ensure genuine patient bookings, an appointment fee is required. The fee is applied to your consultation visit.
        </div>

        {user?.verification_status === "Under Review" && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 rounded-xl border border-yellow-200 dark:border-yellow-800">
            <strong>Notice:</strong> Your ID is under review. You may still book while verification is pending.
          </div>
        )}
        
        {(user?.verification_status === "Pending" || user?.verification_status === "Rejected") && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-800 flex justify-between items-center">
            <span><strong>Action Required:</strong> You must upload a valid ID to book an appointment.</span>
            <button onClick={() => navigate("/patient/profile")} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm shrink-0 ml-4">Upload ID</button>
          </div>
        )}

        {/* Step Progress */}
        <div className="flex items-center justify-between mb-10 overflow-x-auto pb-2">
          {stepsList.map((s, idx) => (
            <div key={s.label} className="flex items-center gap-2 shrink-0">
              <div className={`w-8 h-8 rounded-full grid place-items-center text-sm font-bold transition-colors ${
                s.stepNum < step ? "bg-green-500 text-white" :
                s.stepNum === step ? "bg-primary text-white" :
                "bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-gray-400"
              }`}>
                {s.stepNum < step ? <FaCheck className="text-xs" /> : idx + 1}
              </div>
              <span className={`hidden sm:inline text-xs font-medium ${s.stepNum === step ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500"}`}>{s.label}</span>
              {idx < stepsList.length - 1 && <div className={`hidden sm:block w-8 h-0.5 mx-2 ${s.stepNum < step ? "bg-green-500" : "bg-gray-200 dark:bg-slate-700"}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 sm:p-8">
          {/* STEP 1: Type of Concern */}
          {step === 1 && (
            <>
              <h2 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">Type of Concern</h2>
              <p className="text-sm text-gray-500 mb-6">Select one or more concerns. A doctor will provide a complete diagnostic during your visit.</p>
              {services.length === 0 ? <p className="text-gray-500">No concerns available.</p> : (
                <div className="grid md:grid-cols-2 gap-4">
                  {services.map((s) => {
                    const isSelected = selectedServices.some(srv => srv.service_id === s.service_id);
                    return (
                      <div
                        key={s.service_id}
                        onClick={() => handleToggleService(s)}
                        className={`border-2 rounded-xl p-5 cursor-pointer transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-sm scale-[1.01]"
                            : "border-gray-200 dark:border-slate-800 hover:border-primary/50 bg-white dark:bg-slate-800"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2 gap-4">
                          <div>
                            <h3 className={`font-bold text-base ${isSelected ? "text-primary" : "text-gray-900 dark:text-white"}`}>
                              {CONCERN_MAPPING[s.service_name] || s.service_name}
                            </h3>
                            <span className="inline-block mt-2 text-[10px] font-bold bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 px-2.5 py-1 rounded-lg border border-teal-100 dark:border-teal-900/30">
                              Booking Fee: ₱{Number(s.base_fee).toFixed(2)}
                            </span>
                          </div>
                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected ? "bg-primary border-primary text-white" : "border-gray-300 dark:border-gray-600"
                          }`}>
                            {isSelected && <FaCheck className="text-xs" />}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">{s.description || "Consultation for this concern"}</p>
                      </div>
                    );
                  })}
                </div>
              )}

            </>
          )}

          {/* STEP 2: Doctor */}
          {step === 2 && (
            <>
              <h2 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">Choose a Doctor</h2>

              {/* Name search */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">Search by Name</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Type a doctor's name..."
                  className="w-full border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition"
                />
              </div>

              {filteredDoctors.length === 0 ? (
                <div className="p-6 text-center border-2 border-dashed border-gray-100 dark:border-slate-800 rounded-xl text-gray-500 dark:text-gray-400">
                  No doctors are available for the selected service.
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {filteredDoctors.map((d) => (
                    <div
                      key={d.doctor_id}
                      onClick={() => handleSelectDoctor(d)}
                      className={`border-2 rounded-xl p-5 cursor-pointer transition-all ${
                        selectedDoctor?.doctor_id === d.doctor_id
                          ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-sm"
                          : "border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600"
                      }`}
                    >
                      <h3 className="font-semibold text-gray-900 dark:text-white">Dr. {d.first_name} {d.last_name}</h3>
                      <span className="inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary dark:bg-primary/20">
                        {d.specialization?.name || d.specialization?.specialization_name || 'General'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* STEP 3: Date & Time */}
          {step === 3 && (
            <>
              <h2 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">Choose Date & Time</h2>
              
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Appointment Date</label>
              
              {/* Premium Themed Calendar Grid */}
              <div className="border border-gray-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-900/50 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900 dark:text-white capitalize">
                    {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={prevMonth}
                      className="p-2 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-400 transition"
                    >
                      <FaChevronLeft size={10} />
                    </button>
                    <button
                      type="button"
                      onClick={nextMonth}
                      className="p-2 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-400 transition"
                    >
                      <FaChevronRight size={10} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2 text-center text-xs font-black text-gray-400 dark:text-slate-500 mb-2">
                  <span>SU</span>
                  <span>MO</span>
                  <span>TU</span>
                  <span>WE</span>
                  <span>TH</span>
                  <span>FR</span>
                  <span>SA</span>
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {renderCalendar().map((cell, idx) => {
                    const isSelected = selectedDate === cell.dateStr;
                    
                    let cellClasses = "";
                    if (!cell.isPadding) {
                      if (isSelected) {
                        cellClasses = "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.05]";
                      } else if (cell.status === "yellow") {
                        // Yellow - you have an appointment
                        cellClasses = "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700/50 hover:bg-amber-200 dark:hover:bg-amber-900/40 ring-2 ring-amber-400 dark:ring-amber-500/50 font-black";
                      } else if (cell.status === "full") {
                        // Gray - fully booked
                        cellClasses = "bg-slate-100 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700/60 cursor-not-allowed opacity-60";
                      } else if (cell.status === "unavailable") {
                        // Gray - closed / past / holiday / day-off
                        cellClasses = "bg-slate-100/30 dark:bg-slate-800/10 text-slate-300 dark:text-slate-700 border-slate-100 dark:border-slate-800/30 cursor-not-allowed opacity-40 line-through";
                      } else {
                        // Green - free slot available
                        cellClasses = "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/30 hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-emerald-100 dark:hover:bg-emerald-900/30";
                      }
                    } else {
                      cellClasses = "text-gray-300 dark:text-slate-800 pointer-events-none opacity-20";
                    }

                    return (
                      <button
                        type="button"
                        key={idx}
                        disabled={cell.disabled}
                        onClick={() => handleSetDate(cell.dateStr)}
                        title={cell.reason || `${cell.dateStr}`}
                        className={`aspect-square w-full rounded-xl text-xs sm:text-sm font-bold flex flex-col items-center justify-center transition-all border ${cellClasses}`}
                      >
                        <span>{cell.dayNum}</span>
                        {cell.status === "full" && (
                          <span className="text-[7px] sm:text-[8px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-tighter mt-0.5 leading-none">Full</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Collapsible Expandable Slots Section */}
              {selectedDate && (
                <div className="transition-all duration-300 ease-in-out border border-gray-100 dark:border-slate-800 rounded-2xl p-5 bg-white dark:bg-slate-900 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="flex justify-between items-center border-b dark:border-slate-800 pb-3 mb-4">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                      Available Time Slots for {new Date(selectedDate + "T00:00:00").toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </label>
                    {isDayOff && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">Doctor Leave</span>
                    )}
                  </div>
                  
                  {existingAppt && (
                    <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 rounded-xl border border-amber-200 dark:border-amber-800">
                      <p className="font-bold mb-1">You already have an appointment on this date:</p>
                      <p className="text-sm">Time: {existingAppt.start_time}</p>
                      <p className="text-sm">Status: {existingAppt.booking_status}</p>
                      <p className="text-sm mt-2">You can view full details in your Patient Dashboard.</p>
                    </div>
                  )}
                  
                  {isDayOff ? (
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded-xl border border-orange-200 dark:border-orange-800">
                      Doctor is on leave on this date. Please select another date on the calendar.
                    </div>
                  ) : slotsLoading ? (
                    <div className="flex items-center gap-3 text-sm text-slate-500 animate-pulse py-4">
                       <div className="h-4 w-4 rounded-full border-2 border-teal-500 border-t-transparent animate-spin"/>
                       Checking available slots...
                    </div>
                  ) : slots.length === 0 ? (
                    <div className="p-6 text-center border-2 border-dashed border-gray-100 dark:border-slate-800 rounded-xl text-gray-500">
                      {slotMessage || "Doctor has no available slots for this date."}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {slots.map((sch, i) => {
                        const formatTime = (t) => {
                          if (!t) return '';
                          const [h, m] = t.split(':').map(Number);
                          const p = h >= 12 ? 'PM' : 'AM';
                          const dh = h % 12 || 12;
                          return `${dh}:${m.toString().padStart(2, '0')} ${p}`;
                        };
                        return (
                          <button
                            type="button"
                            key={i}
                            disabled={!sch.is_available}
                            onClick={() => handleSetSchedule(sch)}
                            className={`border-2 rounded-xl p-3 text-sm font-bold transition-all flex flex-col items-center ${
                              selectedSchedule?.start_time === sch.start_time
                                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-[1.02]"
                                : !sch.is_available
                                ? "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-60 line-through"
                                : "border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-teal-400 hover:text-teal-600"
                            }`}
                          >
                            <span>{formatTime(sch.start_time)}</span>
                            {!sch.is_available && (
                              <span className="text-[10px] font-black uppercase mt-1">
                                {sch.is_past ? "Passed" : "Occupied"}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* STEP 4: Reason */}
          {step === 4 && (
            <>
              <h2 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">Reason for Visit</h2>
              <textarea
                value={reason}
                onChange={(e) => handleSetReason(e.target.value)}
                placeholder="Describe your symptoms or reason for visit..."
                className="w-full border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl p-4 h-36 outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
            </>
          )}

          {/* STEP 5: Confirm */}
          {step === 5 && (
            <>
              <h2 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">Booking Summary</h2>
              <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-6 space-y-3 text-sm sm:text-base">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600 dark:text-gray-400 shrink-0">Concerns</span>
                  <span className="font-semibold text-gray-900 dark:text-white text-right">{selectedServices.map(s => CONCERN_MAPPING[s.service_name] || s.name || s.service_name).join(', ')}</span>
                </div>
                {requiresDoctor && (
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600 dark:text-gray-400 shrink-0">Doctor</span>
                    <span className="font-semibold text-gray-900 dark:text-white text-right">Dr. {selectedDoctor?.first_name} {selectedDoctor?.last_name}</span>
                  </div>
                )}
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600 dark:text-gray-400 shrink-0">Date</span>
                  <span className="font-semibold text-gray-900 dark:text-white text-right">{selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600 dark:text-gray-400 shrink-0">Time</span>
                  <span className="font-semibold text-gray-900 dark:text-white text-right">{selectedSchedule?.start_time} - {selectedSchedule?.end_time}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600 dark:text-gray-400 shrink-0">Reason</span>
                  <span className="font-semibold text-gray-900 dark:text-white text-right break-words">{reason}</span>
                </div>
                <div className="border-t border-primary/20 pt-3 mt-3 flex justify-between gap-4 items-center">
                  <span className="font-bold text-gray-800 dark:text-gray-200">Appointment Fee</span>
                  <span className="font-black text-lg text-primary">₱{selectedServices.length > 0 ? selectedServices[0].base_fee : 0}</span>
                </div>
                <p className="text-xs text-primary/80 mt-2 font-medium">
                  * Note: An appointment fee is required to prevent spam bookings. You will be redirected to the payment gateway after confirmation.
                </p>
              </div>
              <div className="mt-8 flex justify-between">
                <button onClick={back} className="inline-flex items-center gap-2 px-5 py-3 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition">
                  <FaArrowLeft /> Back
                </button>
                <button
                  disabled={loading || user?.verification_status === "Pending" || user?.verification_status === "Rejected"}
                  onClick={submitBooking}
                  className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-medium disabled:opacity-40 hover:opacity-90 transition"
                >
                  <FaCheck /> {loading ? "Processing..." : "Confirm Booking"}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Floating Action Bar */}
        <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-50 flex items-center gap-3 animate-in slide-in-from-bottom-8">
          {step > 1 && step < 5 && (
            <button onClick={back} className="shadow-[0_8px_30px_rgb(0,0,0,0.12)] bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 w-14 h-14 rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all border border-gray-100 dark:border-slate-700">
              <FaArrowLeft />
            </button>
          )}
          {step < 5 && (
            <button
              onClick={next}
              disabled={
                (step === 1 && selectedServices.length === 0) ||
                (step === 2 && !selectedDoctor) ||
                (step === 3 && (!selectedDate || !selectedSchedule)) ||
                (step === 4 && !reason.trim())
              }
              className="shadow-[0_8px_30px_rgb(0,0,0,0.2)] bg-primary text-white px-8 h-14 rounded-full flex items-center gap-3 font-black tracking-wide hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
              NEXT <FaArrowRight />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
