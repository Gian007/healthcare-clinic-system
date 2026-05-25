import { FaClock, FaDollarSign, FaUserMd, FaCheck } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function ServiceCard({ service }) {
  const navigate = useNavigate();
  const available = service.status === "Available";

  const handleBook = () => {
    // Map service fields back to backend expected format for BookAppointment
    const bookingSrv = {
      service_id: service.id,
      service_name: service.name,
      base_fee: service.price,
      estimated_duration: service.durationMin,
      requires_doctor: service.requires_doctor,
      service_type: service.service_type
    };
    sessionStorage.setItem("booking_services", JSON.stringify([bookingSrv]));
    sessionStorage.setItem("booking_step", "1");
    sessionStorage.removeItem("booking_doctor");
    sessionStorage.removeItem("booking_schedule");
    sessionStorage.removeItem("booking_date");
    sessionStorage.removeItem("booking_reason");
    navigate("/patient/book");
  };

  const getTypeText = () => {
    if (service.service_type === 'consultation') return 'Consultation';
    if (service.service_type === 'direct_service') return 'Direct Service';
    return 'Doctor Requested Only';
  };

  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-xl shadow-sm border p-5 flex flex-col justify-between h-full ${
        available ? "border-gray-200 dark:border-slate-800" : "border-gray-200 dark:border-slate-800 opacity-70"
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base leading-snug">{service.name}</h3>
            <span className="inline-block mt-1 text-[10px] uppercase font-black px-2 py-0.5 rounded bg-teal-50 dark:bg-slate-850 text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-slate-800">
              {getTypeText()}
            </span>
          </div>

          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
              available
                ? "bg-green-150 text-green-700"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {available ? "Available" : "Unavailable"}
          </span>
        </div>

        <p className="text-xs text-gray-600 dark:text-gray-400 mt-3 leading-relaxed">{service.desc}</p>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1.5 font-medium">
            <FaClock size={12} className="text-teal-500" />
            {service.durationMin} mins
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium">
            <FaUserMd size={12} className="text-teal-500" />
            Doc Consultation: <strong className="text-slate-700 dark:text-slate-350">{service.requires_doctor ? 'Yes' : 'No'}</strong>
          </span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <span className="font-black text-slate-900 dark:text-white text-lg">
            ₱{Number(service.price).toFixed(2)}
          </span>
          {available && service.service_type !== 'doctor_requested' && (
            <button
              onClick={handleBook}
              className="bg-primary hover:bg-primary/95 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-all"
            >
              {service.service_type === 'consultation' ? 'Book Consultation' : 'Book Service'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
