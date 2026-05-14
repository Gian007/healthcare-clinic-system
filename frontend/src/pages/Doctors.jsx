import { useEffect, useState } from "react";
import DoctorCard from "../components/DoctorCard";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../state/auth";
import * as publicApi from "../api/publicApi";

export default function Doctors() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi.getDoctors()
      .then(res => {
        // Map DB fields to DoctorCard props format
        const mapped = res.map(d => ({
          id: d.doctor_id,
          name: `Dr. ${d.first_name} ${d.last_name}`,
          specialty: d.specialization?.name || "General Medicine",
          status: d.status,
          image: d.profile_picture 
            ? (d.profile_picture.startsWith('http') ? d.profile_picture : `${import.meta.env.VITE_BACKEND_URL}/storage/${d.profile_picture}`)
            : `https://ui-avatars.com/api/?name=${d.first_name}+${d.last_name}&background=0D8BFF&color=fff`,
        }));
        setDoctors(mapped);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleViewAvailability = () => {
    if (!user) return nav("/login?next=/patient/book");
    return nav("/patient/book");
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
            <p className="text-4xl mb-3">👨‍⚕️</p>
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
      </div>
    </div>
  );
}
