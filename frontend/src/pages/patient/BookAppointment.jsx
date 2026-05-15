import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCheck, FaArrowRight } from "react-icons/fa";
import { useAuth } from "../../state/auth";
import * as publicApi from "../../api/publicApi";
import * as patientApi from "../../api/patientApi";

const steps = ["Service", "Doctor", "Date & Time", "Reason", "Confirm"];

export default function BookAppointment() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  const [services, setServices] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [step, setStep] = useState(() => {
    const saved = sessionStorage.getItem("booking_step");
    return saved ? parseInt(saved, 10) : 1;
  });
  const [selectedService, setSelectedService] = useState(() => {
    const saved = sessionStorage.getItem("booking_service");
    return saved ? JSON.parse(saved) : null;
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

  useEffect(() => {
    Promise.all([publicApi.getServices(), publicApi.getDoctors()])
      .then(([s, d]) => {
        setServices(s.filter(srv => srv.status !== "Inactive"));
        setDoctors(d);
      })
      .catch(console.error)
      .finally(() => setDataLoading(false));
  }, []);

  const next = () => {
    setStep(step + 1);
    sessionStorage.setItem("booking_step", step + 1);
  };
  const back = () => {
    setStep(step - 1);
    sessionStorage.setItem("booking_step", step - 1);
  };

  const handleSelectService = (s) => {
    setSelectedService(s);
    setSelectedDoctor(null); 
    setSelectedSchedule(null);
    sessionStorage.setItem("booking_service", JSON.stringify(s));
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
    setSelectedSchedule(null); // Reset schedule when date changes
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

  const submitBooking = async () => {
    if (user?.verification_status === "Pending" || user?.verification_status === "Rejected") {
       alert("You must upload a valid ID in your profile before booking.");
       navigate("/patient/profile");
       return;
    }
    
    setLoading(true);
    try {
       await patientApi.bookAppointment({
         doctor_id: selectedDoctor.doctor_id,
         service_id: selectedService.service_id,
         schedule_id: selectedSchedule.schedule_id,
         appointment_date: selectedDate,
         start_time: selectedSchedule.start_time,
         end_time: selectedSchedule.end_time,
         reason_for_visit: reason
       });
       
       sessionStorage.removeItem("booking_step");
       sessionStorage.removeItem("booking_service");
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

  // Filter available schedules based on selected date
  const getDayOfWeek = (dateString) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const d = new Date(dateString);
    return days[d.getDay()];
  };

  const isDayOff = selectedDoctor && selectedDate 
    ? selectedDoctor.dayOffs?.some(dOff => dOff.date === selectedDate)
    : false;

  const availableSchedules = selectedDoctor && selectedDate && !isDayOff
    ? selectedDoctor.schedules.filter(sch => sch.day_of_week === getDayOfWeek(selectedDate))
    : [];

  if (dataLoading) return <div className="text-center p-10 text-gray-500">Loading booking form...</div>;

  return (
    <div>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Book Appointment</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Follow the steps below to schedule your visit</p>

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
          {steps.map((label, i) => (
            <div key={label} className="flex items-center gap-2 shrink-0">
              <div className={`w-8 h-8 rounded-full grid place-items-center text-sm font-bold transition-colors ${
                i + 1 < step ? "bg-green-500 text-white" :
                i + 1 === step ? "bg-primary text-white" :
                "bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-gray-400"
              }`}>
                {i + 1 < step ? <FaCheck className="text-xs" /> : i + 1}
              </div>
              <span className={`hidden sm:inline text-xs font-medium ${i + 1 === step ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500"}`}>{label}</span>
              {i < steps.length - 1 && <div className={`hidden sm:block w-8 h-0.5 mx-2 ${i + 1 < step ? "bg-green-500" : "bg-gray-200 dark:bg-slate-700"}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 sm:p-8">
          {/* STEP 1: Service */}
          {step === 1 && (
            <>
              <h2 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">Choose a Service</h2>
              {services.length === 0 ? <p className="text-gray-500">No services available.</p> : (
                <div className="grid md:grid-cols-2 gap-4">
                  {services.map((s) => (
                    <div
                      key={s.service_id}
                      onClick={() => handleSelectService(s)}
                      className={`border-2 rounded-xl p-5 cursor-pointer transition-all ${
                        selectedService?.service_id === s.service_id
                          ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-sm"
                          : "border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600"
                      }`}
                    >
                      <h3 className="font-semibold text-gray-900 dark:text-white">{s.service_name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{s.estimated_duration} mins</p>
                      <p className="text-primary font-bold mt-2">₱{s.base_fee}</p>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-8 text-right">
                <button
                  disabled={!selectedService}
                  onClick={next}
                  className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-medium disabled:opacity-40 hover:opacity-90 transition"
                >
                  Next <FaArrowRight />
                </button>
              </div>
            </>
          )}

          {/* STEP 2: Doctor */}
          {step === 2 && (
            <>
              <h2 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">Choose a Doctor</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {doctors.filter(d => d.specialization?.specialization_id === selectedService?.specialization_id || !selectedService?.specialization_id).map((d) => (
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
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{d.specialization?.name || 'General'}</p>
                  </div>
                ))}
                {doctors.length === 0 && <p className="text-gray-500">No doctors available for this service.</p>}
              </div>
              <div className="mt-8 flex justify-between">
                <button onClick={back} className="inline-flex items-center gap-2 px-5 py-3 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition">
                  <FaArrowLeft /> Back
                </button>
                <button
                  disabled={!selectedDoctor}
                  onClick={next}
                  className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-medium disabled:opacity-40 hover:opacity-90 transition"
                >
                  Next <FaArrowRight />
                </button>
              </div>
            </>
          )}

          {/* STEP 3: Date & Time */}
          {step === 3 && (
            <>
              <h2 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">Choose Date & Time</h2>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Appointment Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleSetDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl px-4 py-3 mb-6 outline-none focus:ring-2 focus:ring-primary/30"
              />
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Available Time Slots</label>
              
              {!selectedDate ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">Please select a date first.</p>
              ) : isDayOff ? (
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded-xl border border-orange-200 dark:border-orange-800">
                  Doctor is on leave on this date. Please select another date.
                </div>
              ) : availableSchedules.length === 0 ? (
                <p className="text-sm text-red-500">Doctor has no schedules on this day.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {availableSchedules.map((sch) => (
                    <button
                      key={sch.schedule_id}
                      onClick={() => handleSetSchedule(sch)}
                      className={`border-2 rounded-xl p-3 text-sm font-medium transition-all ${
                        selectedSchedule?.schedule_id === sch.schedule_id
                          ? "bg-primary text-white border-primary"
                          : "border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-slate-600"
                      }`}
                    >
                      {sch.start_time} - {sch.end_time}
                    </button>
                  ))}
                </div>
              )}
              
              <div className="mt-8 flex justify-between">
                <button onClick={back} className="inline-flex items-center gap-2 px-5 py-3 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition">
                  <FaArrowLeft /> Back
                </button>
                <button
                  disabled={!selectedSchedule || !selectedDate}
                  onClick={next}
                  className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-medium disabled:opacity-40 hover:opacity-90 transition"
                >
                  Next <FaArrowRight />
                </button>
              </div>
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
              <div className="mt-8 flex justify-between">
                <button onClick={back} className="inline-flex items-center gap-2 px-5 py-3 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition">
                  <FaArrowLeft /> Back
                </button>
                <button
                  disabled={!reason.trim()}
                  onClick={next}
                  className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-medium disabled:opacity-40 hover:opacity-90 transition"
                >
                  Next <FaArrowRight />
                </button>
              </div>
            </>
          )}

          {/* STEP 5: Confirm */}
          {step === 5 && (
            <>
              <h2 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">Booking Summary</h2>
              <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-6 space-y-3 text-sm sm:text-base">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600 dark:text-gray-400 shrink-0">Service</span>
                  <span className="font-semibold text-gray-900 dark:text-white text-right">{selectedService?.service_name}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600 dark:text-gray-400 shrink-0">Doctor</span>
                  <span className="font-semibold text-gray-900 dark:text-white text-right">Dr. {selectedDoctor?.first_name} {selectedDoctor?.last_name}</span>
                </div>
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
                <div className="border-t dark:border-slate-700 pt-3 flex justify-between gap-4 mt-2">
                  <span className="text-gray-600 dark:text-gray-400 font-medium shrink-0">Total Fee</span>
                  <span className="font-bold text-primary text-lg">₱{selectedService?.base_fee}</span>
                </div>
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
      </div>
    </div>
  );
}
