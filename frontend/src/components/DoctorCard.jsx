import { FaCalendarAlt } from "react-icons/fa";

export default function DoctorCard({ doctor }) {
  const available = doctor.status === "Available";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="relative h-44 bg-gray-100">
        <img
          src={doctor.image}
          alt={doctor.name}
          className="w-full h-full object-cover"
        />
        <span
          className={`absolute top-3 right-3 text-xs px-2 py-1 rounded-full font-medium ${
            available
              ? "bg-green-100 text-green-700"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          {available ? "Available" : "Unavailable"}
        </span>
      </div>

      <div className="p-5">
        <h3 className="font-semibold text-gray-900">{doctor.name}</h3>
        <p className="text-sm text-primary mt-1">{doctor.specialty}</p>

        {available ? (
          <button className="mt-4 w-full bg-primary text-white py-2 rounded-md text-sm inline-flex items-center justify-center gap-2">
            <FaCalendarAlt className="text-sm" />
            View Availability
          </button>
        ) : (
          <div className="mt-4 w-full bg-gray-100 text-gray-400 py-2 rounded-md text-sm text-center">
            Currently Unavailable
          </div>
        )}
      </div>
    </div>
  );
}
