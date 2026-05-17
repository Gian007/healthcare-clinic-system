import { FaClock, FaDollarSign } from "react-icons/fa";

export default function ServiceCard({ service }) {
  const available = service.status === "Available";

  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-xl shadow-sm border p-5 ${
        available ? "border-gray-200 dark:border-slate-800" : "border-gray-200 dark:border-slate-800 opacity-70"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{service.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{service.desc}</p>
        </div>

        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${
            available
              ? "bg-green-100 text-green-700"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          {available ? "Available" : "Unavailable"}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-6 text-sm text-primary">
        <span className="inline-flex items-center gap-2">
          <FaClock className="text-xs" />
          {service.durationMin} minutes
        </span>
        <span className="inline-flex items-center gap-2">
          ₱{service.price}
        </span>
      </div>
    </div>
  );
}
