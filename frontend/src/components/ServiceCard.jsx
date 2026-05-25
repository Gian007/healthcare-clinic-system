import { FaClock } from "react-icons/fa";

export default function ServiceCard({ service, onViewDetails }) {
  // Helper for category badge
  const getCategoryInfo = () => {
    const nameLower = service.name.toLowerCase();
    
    // Consultation Services: 👨‍⚕️ Consultation
    if (service.service_type === 'consultation' || nameLower.includes('consultation') || nameLower.includes('checkup')) {
      return {
        label: 'Consultation',
        emoji: '👨‍⚕️',
        class: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50'
      };
    }
    
    // Laboratory Services: 🧪 Laboratory
    const isLab = nameLower.includes('test') || 
                  nameLower.includes('blood') || 
                  nameLower.includes('urinalysis') || 
                  nameLower.includes('x-ray') || 
                  nameLower.includes('ecg') || 
                  nameLower.includes('laboratory') ||
                  nameLower.includes('diagnostic') ||
                  nameLower.includes('cbc');
    
    if (isLab) {
      return {
        label: 'Laboratory',
        emoji: '🧪',
        class: 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900/50'
      };
    }
    
    // Medical Requirement Services: 📋 Medical Requirement
    return {
      label: 'Medical Requirement',
      emoji: '📋',
      class: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50'
    };
  };

  const category = getCategoryInfo();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-6 flex flex-col justify-between h-full hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
      <div className="space-y-4">
        {/* Category Badge */}
        <div className="flex items-center">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${category.class}`}>
            <span>{category.emoji}</span>
            <span>{category.label}</span>
          </span>
        </div>

        {/* Service Name & Description */}
        <div className="space-y-2">
          <h3 className="font-bold text-slate-900 dark:text-white text-lg tracking-tight group-hover:text-primary transition-colors duration-200 leading-snug">
            {service.name}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {service.desc}
          </p>
        </div>
      </div>

      {/* Duration, Price and CTA */}
      <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/60 space-y-4">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            <FaClock className="text-primary/70" size={13} />
            <span>{service.durationMin} mins</span>
          </span>
          <span className="font-extrabold text-slate-900 dark:text-white text-lg">
            ₱{Number(service.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <button
          onClick={() => onViewDetails(service)}
          className="w-full bg-slate-50 dark:bg-slate-800/40 hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white text-slate-700 dark:text-slate-250 text-xs font-bold py-2.5 px-4 rounded-xl border border-slate-200/80 dark:border-slate-800 transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          View Details
        </button>
      </div>
    </div>
  );
}
