import DoctorCard from "../components/DoctorCard";
import { doctors } from "../data/doctors";

export default function Doctors() {
  return (
    <div className="bg-neutralbg min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold text-gray-900">Our Doctors</h1>
        <p className="text-sm text-gray-600 mt-1">
          Meet our team of experienced healthcare professionals
        </p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {doctors.map((d) => (
            <DoctorCard key={d.id} doctor={d} />
          ))}
        </div>
      </div>
    </div>
  );
}
