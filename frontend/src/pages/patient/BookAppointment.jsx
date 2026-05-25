import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCheck, FaArrowRight, FaChevronLeft, FaChevronRight, FaClinicMedical, FaStethoscope, FaBolt, FaShieldAlt, FaExclamationTriangle, FaCreditCard, FaWallet, FaReceipt, FaDownload, FaHome, FaSpinner, FaMobileAlt } from "react-icons/fa";
import { useAuth } from "../../state/auth";
import * as publicApi from "../../api/publicApi";
import * as patientApi from "../../api/patientApi";
import confetti from "canvas-confetti";

const steps = ["Select Service", "Doctor", "Date & Time", "Reason", "Confirm"];

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

const getLocalDateString = (date = new Date()) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export default function BookAppointment() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("gcash");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState(null); // 'connecting', 'verifying', 'processing'
  const [successData, setSuccessData] = useState(null);

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

  // Concern search, sorting & category filtering states
  const [concernSearchTerm, setConcernSearchTerm] = useState("");
  const [concernSortBy, setConcernSortBy] = useState("az");
  const [concernCategory, setConcernCategory] = useState("All");

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
      if (!matchesSearch) return false;

      if (selectedServices.length > 0) {
        const service = selectedServices[0];
        const serviceId = service.id || service.service_id;
        const specId = service.required_specialization || service.required_specialization_id;

        const matchesSpec = specId && (
          Number(d.specialization_id) === Number(specId) || 
          (d.specialization && Number(d.specialization.id || d.specialization.specialization_id) === Number(specId))
        );
        
        const matchesServiceLink = d.services && d.services.some(srv => Number(srv.id || srv.service_id) === Number(serviceId));

        return matchesSpec || matchesServiceLink;
      }
      return true;
    });
  }, [doctors, selectedServices, searchTerm]);

  // Filtered and sorted concern services for step 1
  const filteredAndSortedServices = useMemo(() => {
    return services
      .filter(s => {
        const name = CONCERN_MAPPING[s.service_name] || s.service_name || s.name || "";
        const matchesSearch = name.toLowerCase().includes(concernSearchTerm.toLowerCase()) || 
          (s.description && s.description.toLowerCase().includes(concernSearchTerm.toLowerCase()));
        
        if (!matchesSearch) return false;

        // If the service requires doctor prescription, only show it when searched
        if (s.service_type === 'doctor_requested' && concernSearchTerm.trim() === "") {
          return false;
        }
        
        if (concernCategory === 'All') {
          return true;
        }
        if (concernCategory === 'Consultation') {
          return s.service_type === 'consultation';
        }
        if (concernCategory === 'Direct Services') {
          return s.service_type === 'direct_service';
        }
        return true;
      })
      .sort((a, b) => {
        const nameA = CONCERN_MAPPING[a.service_name] || a.service_name || a.name || "";
        const nameB = CONCERN_MAPPING[b.service_name] || b.service_name || b.name || "";
        const priceA = Number(a.base_fee || a.price || 0);
        const priceB = Number(b.base_fee || b.price || 0);
        
        if (concernSortBy === 'az') return nameA.localeCompare(nameB);
        if (concernSortBy === 'za') return nameB.localeCompare(nameA);
        if (concernSortBy === 'price_low') return priceA - priceB;
        if (concernSortBy === 'price_high') return priceB - priceA;
        return 0;
      });
  }, [services, concernSearchTerm, concernSortBy, concernCategory]);


  const primaryService = selectedServices[0];
  const requiresDoctor = primaryService ? (Boolean(Number(primaryService.requires_doctor ?? 1))) : true;

  const stepsList = useMemo(() => {
    if (!requiresDoctor) {
      return [
        { label: "Select Service", stepNum: 1 },
        { label: "Date & Time", stepNum: 3 },
        { label: "Reason", stepNum: 4 },
        { label: "Confirm", stepNum: 5 }
      ];
    }
    return [
      { label: "Select Service", stepNum: 1 },
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

  const [consultationConflictMsg, setConsultationConflictMsg] = useState("");

  const handleToggleService = (s) => {
    if (s.service_type === 'doctor_requested') return;

    const isConsultation = s.service_type === 'consultation';
    const isDirectService = s.service_type === 'direct_service';

    const alreadySelected = selectedServices.some(srv => (srv.id || srv.service_id) === (s.id || s.service_id));

    if (alreadySelected) {
      // Deselect
      const newServices = selectedServices.filter(srv => (srv.id || srv.service_id) !== (s.id || s.service_id));
      setSelectedServices(newServices);
      setConsultationConflictMsg("");
      sessionStorage.setItem("booking_services", JSON.stringify(newServices));
      // If deselected and now nothing requires doctor, reset
      if (newServices.length === 0 || !newServices[0].requires_doctor) {
        setSelectedDoctor(null);
        setSelectedSchedule(null);
        sessionStorage.removeItem("booking_doctor");
        sessionStorage.removeItem("booking_schedule");
      }
      return;
    }

    if (isConsultation) {
      // Consultations: single select only
      const hasOtherConsultation = selectedServices.some(srv => srv.service_type === 'consultation');
      if (hasOtherConsultation) {
        setConsultationConflictMsg("Only one consultation service can be booked per appointment. Additional consultations must be booked separately.");
        return;
      }
      const hasDirectService = selectedServices.some(srv => srv.service_type === 'direct_service');
      if (hasDirectService) {
        setConsultationConflictMsg("Consultation services cannot be combined with direct services. Please book them separately.");
        return;
      }
      // Replace with only this consultation
      const newServices = [s];
      setSelectedServices(newServices);
      setConsultationConflictMsg("");
      setSelectedDoctor(null);
      setSelectedSchedule(null);
      sessionStorage.setItem("booking_services", JSON.stringify(newServices));
      sessionStorage.removeItem("booking_doctor");
      sessionStorage.removeItem("booking_schedule");
      return;
    }

    if (isDirectService) {
      // Cannot mix with consultations
      const hasConsultation = selectedServices.some(srv => srv.service_type === 'consultation');
      if (hasConsultation) {
        setConsultationConflictMsg("Direct services cannot be combined with a consultation. Please book them separately.");
        return;
      }
      // Multi-select: add to the list
      const newServices = [...selectedServices, s];
      setSelectedServices(newServices);
      setConsultationConflictMsg("");
      setSelectedDoctor(null);
      setSelectedSchedule(null);
      sessionStorage.setItem("booking_services", JSON.stringify(newServices));
      sessionStorage.removeItem("booking_doctor");
      sessionStorage.removeItem("booking_schedule");
      return;
    }
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
    
    setPaymentLoading(true);
    setPaymentStep("connecting");

    // Helper sleep function for simulating payment gateway states
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    try {
       // Step 1: Connecting (1000ms)
       await sleep(1000);
       setPaymentStep("verifying");

       // Step 2: Verifying details (1000ms)
       await sleep(1000);
       setPaymentStep("processing");

       // Step 3: Processing payment (1000ms)
       await sleep(1000);

       const totalFee = selectedServices.reduce((sum, s) => sum + Number(s.base_fee || s.price || 0), 0);
       const concernsText = selectedServices.map(s => s.name || s.service_name).join(', ');
       const finalReason = `Concerns: ${concernsText}. ${reason}`;
       
       const nicePaymentMethodName = paymentMethod === "gcash" ? "GCash" : paymentMethod === "maya" ? "Maya" : "Credit/Debit Card";

       const serviceIds = selectedServices.map(s => s.id || s.service_id);

       const response = await patientApi.bookAppointment({
         doctor_id: requiresDoctor ? selectedDoctor.doctor_id : null,
         service_ids: serviceIds,
         schedule_id: requiresDoctor ? selectedSchedule.schedule_id : null,
         appointment_date: selectedDate,
         start_time: selectedSchedule.start_time,
         end_time: selectedSchedule.end_time,
         reason_for_visit: finalReason,
         payment_method: nicePaymentMethodName,
         payment_status: "Paid",
         amount_paid: totalFee
       });

       const createdAppt = response.appointment;

       // Session storage cleanup
       sessionStorage.removeItem("booking_step");
       sessionStorage.removeItem("booking_services");
       sessionStorage.removeItem("booking_doctor");
       sessionStorage.removeItem("booking_date");
       sessionStorage.removeItem("booking_schedule");
       sessionStorage.removeItem("booking_reason");

       const finalDateTime = `${new Date(selectedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} at ${formatTime(selectedSchedule.start_time)}`;

       const successObj = {
         appointment_id: createdAppt?.appointment_id || createdAppt?.id || "N/A",
         service_name: selectedServices.map(s => CONCERN_MAPPING[s.service_name] || s.name || s.service_name).join(', '),
         doctor_name: requiresDoctor ? `Dr. ${selectedDoctor?.first_name} ${selectedDoctor?.last_name}` : "Clinic Staff (Direct Service)",
         date_time: finalDateTime,
         fee: totalFee,
         payment_method: nicePaymentMethodName,
         payment_reference: createdAppt?.payment_reference || "TXN-SIMULATED"
       };

       setSuccessData(successObj);

       // Confetti celebration!
       confetti({
         particleCount: 150,
         spread: 85,
         origin: { y: 0.6 }
       });

       // Trigger browser notification
       if ("Notification" in window) {
         if (Notification.permission === "granted") {
           new Notification("Appointment Booked Successfully!", {
             body: `Your appointment for ${successObj.service_name} on ${successObj.date_time} is confirmed and paid.`,
           });
         } else if (Notification.permission !== "denied") {
           Notification.requestPermission().then((permission) => {
             if (permission === "granted") {
               new Notification("Appointment Booked Successfully!", {
                 body: `Your appointment for ${successObj.service_name} on ${successObj.date_time} is confirmed and paid.`,
               });
             }
           });
         }
       }

    } catch (e) {
       alert(e.response?.data?.message || "Payment or Booking failed. Please check details and try again.");
    } finally {
       setPaymentLoading(false);
       setPaymentStep(null);
    }
  };

  const formatTime = (t) => {
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    const p = h >= 12 ? 'PM' : 'AM';
    const dh = h % 12 || 12;
    return `${dh}:${m.toString().padStart(2, '0')} ${p}`;
  };

  const downloadReceipt = () => {
    if (!successData) return;
    const receiptContent = `================================================
                 MEDIQUEUE CLINIC
                 OFFICIAL RECEIPT
================================================
Receipt No: MQ-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${successData.appointment_id}
Date Issued: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
------------------------------------------------
Patient Name: ${user ? `${user.first_name} ${user.last_name}` : 'Valued Patient'}
Service: ${successData.service_name}
Doctor: ${successData.doctor_name}
Schedule: ${successData.date_time}
------------------------------------------------
Consultation Fee: ₱${Number(successData.fee).toFixed(2)}
Payment Method: ${successData.payment_method}
Payment Status: PAID
Reference No: ${successData.payment_reference}
================================================
           Thank you for your payment!
     Please present this receipt at the clinic.
================================================
`;

    const blob = new Blob([receiptContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `MediQueue-Receipt-${successData.appointment_id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getDayOfWeek = (dateString) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const [year, month, day] = dateString.split("-").map(Number);
    const d = new Date(year, month - 1, day);
    return days[d.getDay()];
  };

  const checkDateBookability = (dateStr) => {
    const todayStr = getLocalDateString();
    if (dateStr < todayStr) return { disabled: true, reason: "Past date", status: "unavailable", isFull: false };

    const hasPatientAppt = patientAppointments.some(a => a.appointment_date === dateStr && a.booking_status !== 'Cancelled');
    if (hasPatientAppt) return { disabled: true, reason: "You have an appointment on this day", status: "yellow", isFull: false };

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
      const currentAvail = checkDateBookability(selectedDate || getLocalDateString());
      if (currentAvail.disabled) {
        let checkDate = new Date();
        for (let i = 0; i < 60; i++) {
          const dStr = getLocalDateString(checkDate);
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
    const todayStr = getLocalDateString(today);

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

  if (paymentLoading) {
    const paymentMethodLabel = paymentMethod === "gcash" ? "GCash" : paymentMethod === "maya" ? "Maya" : "Credit/Debit Card";
    return (
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300 animate-in fade-in">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-sm w-full text-center border border-slate-100 dark:border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary/20">
            <div className="h-full bg-primary" style={{ width: paymentStep === 'connecting' ? '33%' : paymentStep === 'verifying' ? '66%' : '100%', transition: 'width 1s ease-in-out' }} />
          </div>

          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary animate-spin">
              <FaSpinner className="text-3xl" />
            </div>
          </div>

          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Simulating Payment</h3>
          <p className="text-xs text-slate-400 mb-6 uppercase tracking-widest font-black">Method: {paymentMethodLabel}</p>

          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 mb-2">
            {paymentStep === "connecting" && (
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-355 animate-pulse">
                Connecting to {paymentMethodLabel} secure gateway...
              </p>
            )}
            {paymentStep === "verifying" && (
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-355 animate-pulse">
                Verifying account & simulating OTP check...
              </p>
            )}
            {paymentStep === "processing" && (
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-355 animate-pulse">
                Processing payment of ₱{selectedServices.reduce((sum, s) => sum + Number(s.base_fee || s.price || 0), 0).toFixed(2)}...
              </p>
            )}
          </div>
          
          <p className="text-[10px] text-slate-400 mt-4 italic">
            This is a simulated secure sandbox environment.
          </p>
        </div>
      </div>
    );
  }

  if (successData) {
    return (
      <div className="max-w-xl mx-auto px-4 py-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-800 p-8 text-center relative overflow-hidden">
          {/* Top Decorative Confetti Accent */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500" />
          
          {/* Animated Big Green Checkmark */}
          <div className="mx-auto w-24 h-24 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border-4 border-emerald-500 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/10 animate-bounce">
            <FaCheck className="text-4xl text-emerald-500" />
          </div>

          <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">✓ Appointment Successfully Booked</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            An email confirmation and official receipt have been sent to your email address.
          </p>

          {/* Receipt / Details Card */}
          <div className="bg-slate-50 dark:bg-slate-850 border border-gray-150 dark:border-slate-800 rounded-2xl p-6 text-left space-y-4 mb-8">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-200/50 dark:border-slate-800">
              <FaReceipt className="text-primary text-lg" />
              <span className="font-bold text-xs uppercase text-gray-450 dark:text-slate-500 tracking-wider">Booking Details</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Appointment Number</span>
              <span className="font-bold text-gray-800 dark:text-gray-205">#{successData.appointment_id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Service Name</span>
              <span className="font-bold text-gray-800 dark:text-gray-205">{successData.service_name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Doctor Name</span>
              <span className="font-bold text-gray-800 dark:text-gray-205">{successData.doctor_name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Date & Time</span>
              <span className="font-bold text-gray-800 dark:text-gray-205">{successData.date_time}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Consultation Fee</span>
              <span className="font-black text-emerald-600 dark:text-emerald-450">₱{Number(successData.fee).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm items-center">
              <span className="text-gray-500">Payment Status</span>
              <span className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-black">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                PAID
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Payment Method</span>
              <span className="font-semibold text-gray-850 dark:text-gray-205">{successData.payment_method}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Reference Number</span>
              <span className="font-mono text-xs text-gray-650 dark:text-gray-400 select-all font-semibold">{successData.payment_reference}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid gap-3">
            <button
              onClick={() => navigate("/patient")}
              className="w-full bg-primary text-white py-3.5 rounded-xl font-bold hover:scale-[1.01] active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            >
              <FaHome /> Return to Dashboard
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate("/patient")}
                className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-3.5 rounded-xl font-semibold transition flex items-center justify-center gap-2 border border-gray-200/40 dark:border-slate-700"
              >
                View Appointment
              </button>
              <button
                onClick={downloadReceipt}
                className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-3.5 rounded-xl font-semibold transition flex items-center justify-center gap-2 border border-gray-200/40 dark:border-slate-700"
              >
                <FaDownload /> Download Receipt
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Book Appointment</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Follow the steps below to schedule your visit</p>

        <div className="mb-6 p-4 bg-teal-500/10 dark:bg-teal-500/5 text-teal-850 dark:text-teal-300 rounded-xl border border-teal-500/20 dark:border-teal-800/30 text-xs flex items-start gap-2 shadow-sm font-semibold">
          <FaShieldAlt className="text-teal-600 dark:text-teal-400 mt-0.5 shrink-0 text-sm" /> <span><span className="font-bold text-teal-950 dark:text-teal-200">Anti-Spam Policy:</span> To ensure genuine patient bookings, an appointment fee is required. The fee is applied to your consultation visit.</span>
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
              <h2 className="font-semibold text-lg mb-1 text-gray-900 dark:text-white">Select Service Category</h2>
              <p className="text-sm text-gray-500 mb-4">Choose your service type. <span className="font-semibold text-primary">Consultations</span> are single-select only. <span className="font-semibold text-blue-600">Direct Services</span> can be multi-selected in one booking.</p>
              {/* Search, Sort, and Category Controls */}
              <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 mb-6 space-y-3.5">
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                  {/* Search Concern */}
                  <div className="relative w-full sm:w-80">
                    <input 
                      type="text" 
                      placeholder="Search concern or symptom..." 
                      value={concernSearchTerm}
                      onChange={(e) => setConcernSearchTerm(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 dark:text-white rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>

                  {/* Sort Dropdown */}
                  <div className="relative w-full sm:w-48">
                    <select 
                      value={concernSortBy}
                      onChange={(e) => setConcernSortBy(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 dark:text-white rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
                    >
                      <option value="az">Sort: A to Z</option>
                      <option value="za">Sort: Z to A</option>
                      <option value="price_low">Price: Low to High</option>
                      <option value="price_high">Price: High to Low</option>
                    </select>
                  </div>
                </div>

                {/* Category Selection Chips */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-250/20 dark:border-slate-800/60">
                  {[
                    { id: 'All', label: 'All Concerns', Icon: FaClinicMedical },
                    { id: 'Consultation', label: 'Consultations', Icon: FaStethoscope },
                    { id: 'Direct Services', label: 'Direct Services', Icon: FaBolt }
                  ].map((cat) => {
                    const isActive = concernCategory === cat.id;
                    const ChipIcon = cat.Icon;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setConcernCategory(cat.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all border ${
                          isActive 
                            ? 'bg-primary text-white border-primary shadow-sm' 
                            : 'bg-white hover:bg-slate-100 text-slate-600 border-gray-300 dark:bg-slate-800 dark:text-slate-350 dark:border-slate-700'
                        }`}
                      >
                        <ChipIcon size={11} className={isActive ? "text-white" : "text-gray-400"} />
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            {consultationConflictMsg && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm font-semibold flex items-start gap-2">
                <FaExclamationTriangle className="shrink-0 mt-0.5" />
                {consultationConflictMsg}
              </div>
            )}

            {/* Selected service summary bar */}
            {selectedServices.length > 0 && (
              <div className="mb-4 p-3 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl flex flex-wrap gap-2 items-center">
                <span className="text-xs font-bold text-primary uppercase tracking-wide">Selected ({selectedServices.length}):</span>
                {selectedServices.map(s => (
                  <span key={s.id || s.service_id} className="flex items-center gap-1 bg-primary text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                    {s.service_type === 'consultation' ? '👨‍⚕️' : '⚡'} {s.service_name || s.name}
                    <button onClick={(e) => { e.stopPropagation(); handleToggleService(s); }} className="ml-1 opacity-70 hover:opacity-100">✕</button>
                  </span>
                ))}
                <span className="ml-auto text-xs font-black text-primary">Total: ₱{selectedServices.reduce((sum, s) => sum + Number(s.base_fee || s.price || 0), 0).toFixed(2)}</span>
              </div>
            )}

            {filteredAndSortedServices.length === 0 ? (
              <div className="p-10 text-center border border-dashed border-gray-200 dark:border-slate-800 rounded-2xl text-gray-500">
                No services match your query or filters.
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {filteredAndSortedServices.map((s) => {
                  const isSelected = selectedServices.some(srv => (srv.id || srv.service_id) === (s.id || s.service_id));
                  const isDoctorRequested = s.service_type === 'doctor_requested';
                  const isConsultation = s.service_type === 'consultation';
                  const isDirectService = s.service_type === 'direct_service';

                  // Determine if this card is disabled due to conflict
                  const hasConsultationSelected = selectedServices.some(srv => srv.service_type === 'consultation');
                  const hasDirectSelected = selectedServices.some(srv => srv.service_type === 'direct_service');
                  const isConflicted = !isSelected && !isDoctorRequested && (
                    (isConsultation && (hasConsultationSelected || hasDirectSelected)) ||
                    (isDirectService && hasConsultationSelected)
                  );

                  return (
                    <div
                      key={s.service_id || s.id}
                      onClick={() => !isConflicted && handleToggleService(s)}
                      title={isDoctorRequested ? "Doctor recommendation required. Please schedule a consultation first." : isConflicted ? "Cannot combine with currently selected services." : undefined}
                      className={`border-2 rounded-xl p-5 transition-all relative ${
                        isDoctorRequested
                          ? "border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/30 opacity-60 cursor-not-allowed"
                          : isConflicted
                          ? "border-gray-200 dark:border-slate-800 bg-gray-50/30 dark:bg-slate-800/20 opacity-40 cursor-not-allowed"
                          : isSelected
                          ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-sm scale-[1.01] cursor-pointer"
                          : "border-gray-200 dark:border-slate-800 hover:border-primary/50 bg-white dark:bg-slate-800 cursor-pointer"
                      }`}
                    >
                      {/* Type Badge */}
                      <div className="absolute top-3 right-3">
                        {isDoctorRequested && (
                          <span className="text-[9px] font-black bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">🧪 Doctor Recommended</span>
                        )}
                        {isConsultation && (
                          <span className="text-[9px] font-black bg-teal-100 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">👨‍⚕️ Consultation</span>
                        )}
                        {isDirectService && (
                          <span className="text-[9px] font-black bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">⚡ Direct Service</span>
                        )}
                      </div>

                      <div className="flex justify-between items-start mb-2 gap-4 pr-24">
                        <div>
                          <h3 className={`font-bold text-base ${isDoctorRequested ? "text-gray-400 dark:text-slate-500 line-through" : isSelected ? "text-primary" : "text-gray-900 dark:text-white"}`}>
                            {CONCERN_MAPPING[s.service_name] || s.service_name}
                          </h3>
                          <span className="inline-block mt-2 text-[10px] font-bold bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 px-2.5 py-1 rounded-lg border border-teal-100 dark:border-teal-900/30">
                            {isConsultation ? 'Consultation Fee' : 'Service Fee'}: ₱{Number(s.base_fee || s.price || 0).toFixed(2)}
                          </span>
                          {isDoctorRequested && (
                            <span className="mt-1 text-[9px] font-black text-red-500 dark:text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                              <FaExclamationTriangle className="shrink-0" /> Doctor recommendation required.
                            </span>
                          )}
                          {isConsultation && !isDoctorRequested && (
                            <span className="mt-1 text-[9px] font-semibold text-teal-500 dark:text-teal-400 flex items-center gap-1">Single select only</span>
                          )}
                          {isDirectService && (
                            <span className="mt-1 text-[9px] font-semibold text-blue-500 dark:text-blue-400 flex items-center gap-1">Can be combined with other direct services</span>
                          )}
                        </div>
                        {!isDoctorRequested && (
                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected ? "bg-primary border-primary text-white" : "border-gray-300 dark:border-gray-600"
                          } ${isConsultation ? "rounded-full" : ""}`}>
                            {isSelected && <FaCheck className="text-xs" />}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">{s.description || "Service available at the clinic"}</p>
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
              
              {/* Summary Details */}
              <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-3.5 text-sm mb-6">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Services</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200 text-right">{selectedServices.map(s => CONCERN_MAPPING[s.service_name] || s.name || s.service_name).join(', ')}</span>
                </div>
                {requiresDoctor && (
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">Doctor</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200 text-right">Dr. {selectedDoctor?.first_name} {selectedDoctor?.last_name}</span>
                  </div>
                )}
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Date</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200 text-right">{selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Time Slot</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200 text-right">{selectedSchedule?.start_time} - {selectedSchedule?.end_time}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Reason</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200 text-right break-words max-w-[70%]">{reason}</span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">Select Payment Method</h3>
              <div className="grid sm:grid-cols-3 gap-3 mb-6">
                {/* GCash */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("gcash")}
                  className={`flex items-center gap-3 border-2 rounded-xl p-4 text-left transition-all ${
                    paymentMethod === "gcash"
                      ? "border-sky-500 bg-sky-500/5 dark:bg-sky-500/10 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 bg-white dark:bg-slate-900"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg grid place-items-center ${paymentMethod === "gcash" ? "bg-sky-500 text-white" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"}`}>
                    <FaWallet size={16} />
                  </div>
                  <div>
                    <span className="font-bold text-xs block text-slate-900 dark:text-white">GCash</span>
                    <span className="text-[10px] text-slate-400">Mobile Wallet</span>
                  </div>
                </button>

                {/* Maya */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("maya")}
                  className={`flex items-center gap-3 border-2 rounded-xl p-4 text-left transition-all ${
                    paymentMethod === "maya"
                      ? "border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 bg-white dark:bg-slate-900"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg grid place-items-center ${paymentMethod === "maya" ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"}`}>
                    <FaMobileAlt size={16} />
                  </div>
                  <div>
                    <span className="font-bold text-xs block text-slate-900 dark:text-white">Maya</span>
                    <span className="text-[10px] text-slate-400">PayMaya Wallet</span>
                  </div>
                </button>

                {/* Credit Card */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`flex items-center gap-3 border-2 rounded-xl p-4 text-left transition-all ${
                    paymentMethod === "card"
                      ? "border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 bg-white dark:bg-slate-900"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg grid place-items-center ${paymentMethod === "card" ? "bg-indigo-500 text-white" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"}`}>
                    <FaCreditCard size={16} />
                  </div>
                  <div>
                    <span className="font-bold text-xs block text-slate-900 dark:text-white">Card</span>
                    <span className="text-[10px] text-slate-400">Credit / Debit</span>
                  </div>
                </button>
              </div>

              {/* Payment Details */}
              <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-2xl p-5 mb-8 space-y-3">
                {selectedServices.map((s, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <span className="text-slate-600 dark:text-slate-400 truncate max-w-[60%]">
                      {s.service_type === 'consultation' ? '👨‍⚕️' : '⚡'} {s.service_name || s.name}
                    </span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">₱{Number(s.base_fee || s.price || 0).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center text-sm border-t border-primary/20 pt-3">
                  <span className="font-black text-slate-700 dark:text-slate-300">{selectedServices[0]?.service_type === 'consultation' ? 'Consultation Fee' : 'Total Service Fee'}</span>
                  <span className="font-black text-lg text-primary">₱{selectedServices.reduce((sum, s) => sum + Number(s.base_fee || s.price || 0), 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-t border-primary/10 pt-3">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Payment Status</span>
                  <span className="inline-flex items-center gap-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-3 py-1 rounded-full text-xs font-black">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    PENDING
                  </span>
                </div>
                <p className="text-[11px] text-primary/80 mt-1 leading-normal font-semibold">
                  * Note: An anti-spam reservation fee is required to confirm your schedule. Payment is non-refundable but fully deductible from your clinic bill.
                </p>
              </div>

              {/* Back / Proceed Buttons */}
              <div className="mt-8 flex justify-between gap-4">
                <button
                  type="button"
                  onClick={back}
                  className="inline-flex items-center gap-2 px-5 py-3 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition font-bold text-xs uppercase"
                >
                  <FaArrowLeft /> Back
                </button>
                <button
                  type="button"
                  disabled={paymentLoading || user?.verification_status === "Pending" || user?.verification_status === "Rejected"}
                  onClick={submitBooking}
                  className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:scale-[1.01] active:scale-95 transition-all text-xs uppercase shadow-md shadow-primary/10 disabled:opacity-40"
                >
                  <FaCheck /> {paymentLoading ? "Processing..." : "Proceed to Payment"}
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
