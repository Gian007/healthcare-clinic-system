import { FaCalendarAlt, FaExclamationTriangle, FaUser } from "react-icons/fa";

export default function DoctorCard({ doctor, onViewAvailability }) {
  const isDocActive = doctor.status === "Available" || doctor.status === "Active";
  const isAvailableToday = doctor.isAvailableToday !== false; // handle null/undefined as true

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden flex flex-col hover:border-primary/50 transition-colors">
      <div className="relative h-44 bg-gray-100 dark:bg-slate-800">
        <img
          src={doctor.image}
          alt={doctor.name}
          className="w-full h-full object-cover"
        />
        <span
          className={`absolute top-3 right-3 text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest shadow-sm ${
            (isDocActive && isAvailableToday)
              ? "bg-emerald-500 text-white"
              : "bg-rose-500 text-white"
          }`}
        >
          {(isDocActive && isAvailableToday) ? "Active" : "Away Today"}
        </span>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-bold text-gray-900 dark:text-white leading-tight">{doctor.name}</h3>
        <p className="text-xs font-bold text-primary mt-1 uppercase tracking-widest">{doctor.specialty}</p>

        <div className="mt-auto pt-4">
          {!isAvailableToday ? (
             <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 p-3 rounded-lg text-[10px] font-bold flex items-center gap-2 mb-3">
                <FaExclamationTriangle/> Away (Holiday/Day-off)
             </div>
          ) : null}

          {isDocActive ? (
            <button 
              onClick={() => onViewAvailability && onViewAvailability(doctor)}
              className="w-full bg-primary text-white py-2.5 rounded-lg text-sm font-bold inline-flex items-center justify-center gap-2 hover:opacity-90 transition shadow-lg shadow-primary/20"
            >
              <FaUser className="text-sm" />
              View Doctor Info
            </button>
          ) : (
            <div className="w-full bg-slate-100 dark:bg-slate-800 text-slate-400 py-2.5 rounded-lg text-sm font-bold text-center">
              Currently Unavailable
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
