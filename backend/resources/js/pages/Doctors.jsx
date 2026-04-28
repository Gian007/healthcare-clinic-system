import { useEffect, useState } from "react";
import DoctorCard from "../components/DoctorCard";

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/doctors")
      .then((res) => res.json())
      .then((data) => {
        setDoctors(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);
  
  return (
    <div className="bg-neutralbg min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold text-gray-900">Our Doctors</h1>
        <p className="text-sm text-gray-600 mt-1">
          Meet our team of experienced healthcare professionals
        </p>

        {loading ? (
          <div className="mt-10 text-center text-gray-500">Loading doctors...</div>
        ) : (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {doctors.map((d, index) => (
        <DoctorCard key={d.doctor_id} doctor={d} index={index} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}