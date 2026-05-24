import { useEffect, useState } from "react";
import DoctorCard from "../components/DoctorCard";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../state/auth";
import { FaTimes, FaEnvelope, FaPhone, FaIdCard, FaClock, FaUsers, FaStar, FaMoneyBillWave, FaCalendarCheck, FaStethoscope, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import * as publicApi from "../api/publicApi";

export default function Doctors() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    publicApi.getDoctors()
      .then(res => {
        // Map DB fields to DoctorCard props format
        const mapped = res.map(d => ({
          id: d.doctor_id,
          name: `Dr. ${d.first_name} ${d.last_name}`,
          specialty: d.specialization?.name || "General Medicine",
          status: d.status,
          isAvailableToday: d.is_available_today,
          image: d.profile_picture 
            ? `${import.meta.env.VITE_BACKEND_URL}/storage/${d.profile_picture}` 
            : `https://ui-avatars.com/api/?name=${d.first_name}+${d.last_name}&background=0D8BFF&color=fff`,
          email: d.email,
          contact: d.contact_number,
          license: d.license_number,
          years_of_experience: d.years_of_experience,
          consultation_fee: d.consultation_fee,
          today_schedule: d.today_schedule,
          current_queue_count: d.current_queue_count,
          estimated_wait_time: d.estimated_wait_time,
          services: d.services || [],
        }));
        setDoctors(mapped);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleViewAvailability = (doctor) => {
    setSelectedDoctor(doctor);
  };

  return (
    <div className="bg-neutralbg dark:bg-slate-950 min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Our Doctors</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Meet our team of experienced healthcare professionals
        </p>

        {loading ? (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-xl h-80 animate-pulse border border-slate-100 dark:border-slate-800" />
            ))}
          </div>
        ) : doctors.length === 0 ? (
          <div className="mt-10 text-center text-gray-500 dark:text-gray-400">
            <p>No active doctors available at the moment.</p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {doctors.map((d) => (
              <DoctorCard 
                key={d.id} 
                doctor={d} 
                onViewAvailability={handleViewAvailability}
              />
            ))}
          </div>
        )}

        {/* Doctor Info Modal */}
        {selectedDoctor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
              <div className="relative h-32 bg-primary/10 flex items-center justify-center">
                <button onClick={() => setSelectedDoctor(null)} className="absolute top-4 right-4 p-2 bg-white/50 hover:bg-white rounded-full transition-colors text-gray-800">
                  <FaTimes />
                </button>
                <img src={selectedDoctor.image} alt={selectedDoctor.name} className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-800 object-cover absolute -bottom-12 shadow-lg" />
              </div>
              <div className="pt-16 pb-8 px-6 text-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedDoctor.name}</h3>
                <p className="text-sm font-semibold text-primary uppercase tracking-wider mt-1 mb-3">{selectedDoctor.specialty}</p>
                
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-4 ${selectedDoctor.isAvailableToday ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                  {selectedDoctor.isAvailableToday ? <><FaCheckCircle /> Available Today</> : <><FaTimesCircle /> Away Today</>}
                </div>

                <div className="grid grid-cols-2 gap-3 text-left mb-6">
                  <div className="bg-gray-50 dark:bg-slate-800/50 p-3 rounded-xl">
                    <FaStar className="text-yellow-500 mb-1" />
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase">Experience</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedDoctor.years_of_experience ? `${selectedDoctor.years_of_experience} Years` : 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-800/50 p-3 rounded-xl">
                    <FaMoneyBillWave className="text-green-500 mb-1" />
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase">Consult Fee</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedDoctor.consultation_fee ? `$${Number(selectedDoctor.consultation_fee).toFixed(2)}` : 'N/A'}</p>
                  </div>
                </div>

                <div className="text-left space-y-3 mb-6">
                  <div className="flex items-center gap-3">
                    <FaStethoscope className="text-primary" />
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">Services Offered:</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedDoctor.services && selectedDoctor.services.length > 0 ? (
                      selectedDoctor.services.map(s => (
                        <span key={s.service_id} className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1 rounded-md font-medium border border-slate-200 dark:border-slate-700">
                          {s.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-500 italic">No specific services listed</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-slate-800/80 border-t border-gray-100 dark:border-slate-800 text-center">
                <p className="text-xs text-gray-550 dark:text-gray-400 font-medium px-4">
                  Appointments must be booked directly through the scheduling system inside the <span className="font-bold text-primary">Patient Dashboard</span>.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
