import { useState } from "react";
import { useNavigate } from "react-router-dom";

const services = [
  { id: 1, name: "General Checkup", duration: "30 minutes", price: 80 },
  { id: 2, name: "Teeth Whitening", duration: "60 minutes", price: 200 },
  { id: 3, name: "Root Canal", duration: "90 minutes", price: 500 },
  { id: 4, name: "Braces Consultation", duration: "45 minutes", price: 150 },
  { id: 5, name: "Emergency Care", duration: "60 minutes", price: 250 },
];

const doctors = [
  { id: 1, name: "Dr. Sarah Johnson", specialty: "General Dentistry" },
  { id: 2, name: "Dr. Michael Chen", specialty: "Orthodontics" },
  { id: 3, name: "Dr. Emily Rodriguez", specialty: "Oral Surgery" },
];

const times = [
  "08:00 AM","08:30 AM","09:30 AM","10:00 AM",
  "11:00 AM","11:30 AM","01:00 PM","01:30 PM",
  "02:30 PM","03:00 PM","03:30 PM","04:30 PM",
];

export default function BookAppointment() {
  const nav = useNavigate();

  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [reason, setReason] = useState("");

  const next = () => setStep(step + 1);
  const back = () => setStep(step - 1);

  return (
    <div className="bg-neutralbg min-h-screen py-10 px-6">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-8">
        <h1 className="text-2xl font-semibold mb-6">Book Appointment</h1>

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <h2 className="font-semibold mb-4">1. Choose Service</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {services.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setSelectedService(s)}
                  className={`border rounded-lg p-4 cursor-pointer ${
                    selectedService?.id === s.id
                      ? "border-primary bg-primary/5"
                      : "border-gray-200"
                  }`}
                >
                  <h3 className="font-semibold">{s.name}</h3>
                  <p className="text-sm text-gray-500">{s.duration}</p>
                  <p className="text-primary font-semibold mt-2">${s.price}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-between">
              <button
                onClick={() => nav('/patient')}
                className="px-4 py-2 border rounded"
              >
                Back
              </button>
              <button
                disabled={!selectedService}
                onClick={next}
                className="bg-primary text-white px-6 py-2 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <h2 className="font-semibold mb-4">2. Choose Doctor</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {doctors.map((d) => (
                <div
                  key={d.id}
                  onClick={() => setSelectedDoctor(d)}
                  className={`border rounded-lg p-4 cursor-pointer ${
                    selectedDoctor?.id === d.id
                      ? "border-primary bg-primary/5"
                      : "border-gray-200"
                  }`}
                >
                  <h3 className="font-semibold">{d.name}</h3>
                  <p className="text-sm text-gray-500">{d.specialty}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-between">
              <button onClick={back} className="px-4 py-2 border rounded">
                Back
              </button>
              <button
                disabled={!selectedDoctor}
                onClick={next}
                className="bg-primary text-white px-6 py-2 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <>
            <h2 className="font-semibold mb-4">3. Choose Time</h2>
            <div className="grid grid-cols-3 gap-3">
              {times.map((t, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedTime(t)}
                  className={`border rounded p-2 ${
                    selectedTime === t
                      ? "bg-primary text-white"
                      : "border-gray-200"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="mt-6 flex justify-between">
              <button onClick={back} className="px-4 py-2 border rounded">
                Back
              </button>
              <button
                disabled={!selectedTime}
                onClick={next}
                className="bg-primary text-white px-6 py-2 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <>
            <h2 className="font-semibold mb-4">4. Reason for Visit</h2>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe your reason..."
              className="w-full border rounded p-3 h-32"
            />

            <div className="mt-6 flex justify-between">
              <button onClick={back} className="px-4 py-2 border rounded">
                Back
              </button>
              <button
                disabled={!reason}
                onClick={next}
                className="bg-primary text-white px-6 py-2 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* STEP 5 */}
        {step === 5 && (
          <>
            <h2 className="font-semibold mb-4">5. Booking Summary</h2>

            <div className="bg-primary/10 rounded p-4 space-y-2">
              <p><strong>Service:</strong> {selectedService?.name}</p>
              <p><strong>Doctor:</strong> {selectedDoctor?.name}</p>
              <p><strong>Time:</strong> {selectedTime}</p>
              <p><strong>Reason:</strong> {reason}</p>
            </div>

            <div className="mt-6 flex justify-between">
              <button onClick={back} className="bg-crimson cursor-pointer text-white px-6 py-2 rounded">
                Back
              </button>
              <button
                onClick={() => nav("/patient/reservation-payment")}
                className="bg-primary text-white px-6 py-2 rounded"
              >
                Confirm Booking
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}