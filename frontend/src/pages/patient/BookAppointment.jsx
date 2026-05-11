import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCheck, FaArrowRight } from "react-icons/fa";
import { useAuth } from "../../state/auth";
import axios from "axios";

const services = [
  { id: 1, name: "General Consultation", duration: "30 minutes", price: 500, specialty: "General Medicine" },
  { id: 2, name: "Pediatric Consultation", duration: "30 minutes", price: 650, specialty: "Pediatrics" },
  { id: 3, name: "ECG Screening", duration: "45 minutes", price: 850, specialty: "Cardiology" },
  { id: 4, name: "Dermatology Checkup", duration: "30 minutes", price: 700, specialty: "Dermatology" },
  { id: 5, name: "Emergency Care", duration: "60 minutes", price: 1200, specialty: "General Medicine" },
];

const doctors = [
  { id: 1, name: "Dr. Alyssa Santos", specialty: "General Medicine" },
  { id: 2, name: "Dr. Miguel Reyes", specialty: "Pediatrics" },
  { id: 3, name: "Dr. Katrina Lim", specialty: "Cardiology" },
  { id: 4, name: "Dr. Ramon Dela Cruz", specialty: "Dermatology" },
];

const times = [
  "08:00 AM","08:30 AM","09:00 AM","09:30 AM","10:00 AM",
  "10:30 AM","11:00 AM","11:30 AM","01:00 PM","01:30 PM",
  "02:00 PM","02:30 PM","03:00 PM","03:30 PM","04:00 PM","04:30 PM",
];

const steps = ["Service", "Doctor", "Date & Time", "Reason", "Confirm"];

export default function BookAppointment() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);

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
  const [selectedTime, setSelectedTime] = useState(() => {
    return sessionStorage.getItem("booking_time") || null;
  });
  const [reason, setReason] = useState(() => {
    return sessionStorage.getItem("booking_reason") || "";
  });

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
    setSelectedDoctor(null); // Reset doctor if service changes
    sessionStorage.setItem("booking_service", JSON.stringify(s));
    sessionStorage.removeItem("booking_doctor");
  };

  const handleSelectDoctor = (d) => {
    setSelectedDoctor(d);
    sessionStorage.setItem("booking_doctor", JSON.stringify(d));
  };

  const handleSetDate = (val) => {
    setSelectedDate(val);
    sessionStorage.setItem("booking_date", val);
  };

  const handleSetTime = (val) => {
    setSelectedTime(val);
    sessionStorage.setItem("booking_time", val);
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
       // Await backend API implementation, simulate for now
       // await axios.post("/api/appointments", { ... }, { headers: { Authorization: `Bearer ${token}` } });
       
       sessionStorage.removeItem("booking_step");
       sessionStorage.removeItem("booking_service");
       sessionStorage.removeItem("booking_doctor");
       sessionStorage.removeItem("booking_date");
       sessionStorage.removeItem("booking_time");
       sessionStorage.removeItem("booking_reason");
       
       alert("Appointment booked successfully!");
       navigate("/patient");
    } catch (e) {
       alert("Booking failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Book Appointment</h1>
        <p className="text-sm text-gray-500 mb-6">Follow the steps below to schedule your visit</p>

        {user?.verification_status === "Under Review" && (
          <div className="mb-6 p-4 bg-yellow-50 text-yellow-700 rounded-xl border border-yellow-200">
            <strong>Notice:</strong> Your ID is under review. You may still book while verification is pending.
          </div>
        )}
        
        {(user?.verification_status === "Pending" || user?.verification_status === "Rejected") && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex justify-between items-center">
            <span><strong>Action Required:</strong> You must upload a valid ID to book an appointment.</span>
            <button onClick={() => navigate("/patient/profile")} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm">Upload ID Now</button>
          </div>
        )}

        {/* Step Progress */}
        <div className="flex items-center justify-between mb-10">
          {steps.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full grid place-items-center text-sm font-bold transition-colors ${
                i + 1 < step ? "bg-green-500 text-white" :
                i + 1 === step ? "bg-primary text-white" :
                "bg-gray-200 text-gray-500"
              }`}>
                {i + 1 < step ? <FaCheck className="text-xs" /> : i + 1}
              </div>
              <span className={`hidden sm:inline text-xs font-medium ${i + 1 === step ? "text-gray-900" : "text-gray-400"}`}>{label}</span>
              {i < steps.length - 1 && <div className={`hidden sm:block w-8 h-0.5 ${i + 1 < step ? "bg-green-500" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-8">
          {/* STEP 1: Service */}
          {step === 1 && (
            <>
              <h2 className="font-semibold text-lg mb-4">Choose a Service</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {services.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => handleSelectService(s)}
                    className={`border-2 rounded-xl p-5 cursor-pointer transition-all ${
                      selectedService?.id === s.id
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <h3 className="font-semibold text-gray-900">{s.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{s.duration}</p>
                    <p className="text-primary font-bold mt-2">₱{s.price}</p>
                  </div>
                ))}
              </div>
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
              <h2 className="font-semibold text-lg mb-4">Choose a Doctor</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {doctors.filter(d => !selectedService || d.specialty === selectedService.specialty).map((d) => (
                  <div
                    key={d.id}
                    onClick={() => handleSelectDoctor(d)}
                    className={`border-2 rounded-xl p-5 cursor-pointer transition-all ${
                      selectedDoctor?.id === d.id
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <h3 className="font-semibold text-gray-900">{d.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{d.specialty}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex justify-between">
                <button onClick={back} className="inline-flex items-center gap-2 px-5 py-3 border rounded-xl text-gray-700 hover:bg-gray-50 transition">
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
              <h2 className="font-semibold text-lg mb-4">Choose Date & Time</h2>
              <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleSetDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full border rounded-xl px-4 py-3 mb-6 outline-none focus:ring-2 focus:ring-primary/30"
              />
              <label className="block text-sm font-medium text-gray-700 mb-2">Available Time Slots</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {times.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => handleSetTime(t)}
                    className={`border-2 rounded-xl p-3 text-sm font-medium transition-all ${
                      selectedTime === t
                        ? "bg-primary text-white border-primary"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="mt-8 flex justify-between">
                <button onClick={back} className="inline-flex items-center gap-2 px-5 py-3 border rounded-xl text-gray-700 hover:bg-gray-50 transition">
                  <FaArrowLeft /> Back
                </button>
                <button
                  disabled={!selectedTime || !selectedDate}
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
              <h2 className="font-semibold text-lg mb-4">Reason for Visit</h2>
              <textarea
                value={reason}
                onChange={(e) => handleSetReason(e.target.value)}
                placeholder="Describe your symptoms or reason for visit..."
                className="w-full border rounded-xl p-4 h-36 outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
              <div className="mt-8 flex justify-between">
                <button onClick={back} className="inline-flex items-center gap-2 px-5 py-3 border rounded-xl text-gray-700 hover:bg-gray-50 transition">
                  <FaArrowLeft /> Back
                </button>
                <button
                  disabled={!reason}
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
              <h2 className="font-semibold text-lg mb-4">Booking Summary</h2>
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service</span>
                  <span className="font-semibold text-gray-900">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Doctor</span>
                  <span className="font-semibold text-gray-900">{selectedDoctor?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date</span>
                  <span className="font-semibold text-gray-900">{selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time</span>
                  <span className="font-semibold text-gray-900">{selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Reason</span>
                  <span className="font-semibold text-gray-900 text-right max-w-xs">{reason}</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="text-gray-600 font-medium">Total Fee</span>
                  <span className="font-bold text-primary text-lg">₱{selectedService?.price}</span>
                </div>
              </div>
              <div className="mt-8 flex justify-between">
                <button onClick={back} className="inline-flex items-center gap-2 px-5 py-3 border rounded-xl text-gray-700 hover:bg-gray-50 transition">
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
