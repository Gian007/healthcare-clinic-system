import { useEffect, useState } from "react";
import ServiceCard from "../components/ServiceCard";
import * as publicApi from "../api/publicApi";
import { useAuth } from "../state/auth";
import { useNavigate } from "react-router-dom";
import { 
  FaClock, 
  FaTimes, 
  FaCalendarAlt, 
  FaFileAlt, 
  FaUserMd, 
  FaCheck, 
  FaLock, 
  FaStethoscope, 
  FaSearch, 
  FaSort 
} from "react-icons/fa";

// Helper for category badge
const getServiceCategory = (service) => {
  const nameLower = service.name.toLowerCase();
  
  if (service.service_type === 'consultation' || nameLower.includes('consultation') || nameLower.includes('checkup')) {
    return {
      label: 'Consultation',
      emoji: '👨‍⚕️',
      class: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50'
    };
  }
  
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
  
  return {
    label: 'Medical Requirement',
    emoji: '📋',
    class: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50'
  };
};

const formatTime12h = (timeStr) => {
  if (!timeStr) return '';
  const [hoursStr, minutesStr] = timeStr.split(':');
  let hours = parseInt(hoursStr, 10);
  const minutes = minutesStr;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
};

export default function Services() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('az');
  const [category, setCategory] = useState('All');

  // Modal States
  const [selectedService, setSelectedService] = useState(null);
  const [nextSchedule, setNextSchedule] = useState(null);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      publicApi.getServices(),
      publicApi.getDoctors().catch(() => [])
    ])
      .then(([resServices, resDoctors]) => {
        const mapped = resServices.map(s => ({
          id: s.id || s.service_id,
          name: s.name || s.service_name,
          desc: s.description || 'No description provided.',
          status: s.is_active ? 'Available' : 'Unavailable',
          durationMin: s.estimated_duration || s.durationMin || 30,
          price: s.price || s.base_fee || 0,
          service_type: s.service_type || 'consultation',
          requires_doctor: s.requires_doctor ?? true,
          requirements_notes: s.requirements_notes || '',
          required_specialization: s.required_specialization || s.required_specialization_id
        }));
        setServices(mapped);
        setDoctors(resDoctors);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Fetch Next Available Slot when service detail modal opens
  useEffect(() => {
    if (!selectedService) {
      setNextSchedule(null);
      return;
    }

    const service = selectedService;
    setLoadingSchedule(true);
    setNextSchedule(null);

    const fetchNextSchedule = async () => {
      try {
        const today = new Date();
        const daysToCheck = 7;
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        let matchingDoctors = [];
        if (service.requires_doctor) {
          const specId = service.required_specialization;
          matchingDoctors = doctors.filter(d => 
            d.status === 'Active' && (
              (d.specialization_id && d.specialization_id === specId) ||
              (d.specialization && (d.specialization.id === specId || d.specialization.specialization_id === specId)) ||
              (d.services && d.services.some(s => s.id === service.id || s.service_id === service.id))
            )
          );
        }

        // Loop through the next 7 days starting today
        for (let i = 0; i < daysToCheck; i++) {
          const checkDate = new Date();
          checkDate.setDate(today.getDate() + i);
          const dateStr = checkDate.toISOString().split('T')[0];
          const dayName = daysOfWeek[checkDate.getDay()];

          if (dayName === 'Sunday') continue; // Clinic is closed on Sundays

          if (!service.requires_doctor) {
            // Direct clinic services
            const res = await publicApi.getAvailableSlots(null, dateStr, service.id);
            const firstAvailableSlot = res.slots?.find(slot => slot.is_available);
            if (firstAvailableSlot) {
              const formattedDate = checkDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });
              const formattedTime = formatTime12h(firstAvailableSlot.time);
              setNextSchedule(`${formattedDate} at ${formattedTime}`);
              setLoadingSchedule(false);
              return;
            }
          } else {
            // Doctor consultations
            for (const doc of matchingDoctors) {
              const hasScheduleOnDay = doc.schedules?.some(s => s.day_of_week === dayName && s.schedule_status === 'Active');
              if (!hasScheduleOnDay) continue;

              const res = await publicApi.getAvailableSlots(doc.doctor_id, dateStr, service.id);
              const firstAvailableSlot = res.slots?.find(slot => slot.is_available);
              if (firstAvailableSlot) {
                const formattedDate = checkDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });
                const formattedTime = formatTime12h(firstAvailableSlot.time);
                setNextSchedule(`${formattedDate} at ${formattedTime} (with Dr. ${doc.first_name} ${doc.last_name})`);
                setLoadingSchedule(false);
                return;
              }
            }
          }
        }

        setNextSchedule("No slots available in the next 7 days");
      } catch (err) {
        console.error("Error finding next schedule:", err);
        setNextSchedule("Unavailable");
      } finally {
        setLoadingSchedule(false);
      }
    };

    fetchNextSchedule();
  }, [selectedService, doctors]);

  const handleBook = (srv) => {
    // Save selected service information into sessionStorage for BookAppointment.jsx flow
    const bookingSrv = {
      service_id: srv.id,
      service_name: srv.name,
      base_fee: srv.price,
      estimated_duration: srv.durationMin,
      requires_doctor: srv.requires_doctor,
      service_type: srv.service_type
    };
    sessionStorage.setItem("booking_services", JSON.stringify([bookingSrv]));
    sessionStorage.setItem("booking_step", "1");
    sessionStorage.removeItem("booking_doctor");
    sessionStorage.removeItem("booking_schedule");
    sessionStorage.removeItem("booking_date");
    sessionStorage.removeItem("booking_reason");
    
    // Direct patient to booking flow wizard
    navigate("/patient/book");
  };

  const filteredServices = services
    .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.desc.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(s => {
      // Hide doctor requested (non-public) services for normal users
      if (!isAdmin && s.service_type === 'doctor_requested') return false;

      if (category === 'All') {
        return s.service_type === 'consultation' || s.service_type === 'direct_service';
      }
      if (category === 'Doctor Requested Only') {
        return s.service_type === 'doctor_requested';
      }

      const sCat = getServiceCategory(s).label;
      if (category === 'Consultation') return sCat === 'Consultation';
      if (category === 'Laboratory') return sCat === 'Laboratory';
      if (category === 'Medical Requirement') return sCat === 'Medical Requirement';

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'az') return a.name.localeCompare(b.name);
      if (sortBy === 'za') return b.name.localeCompare(a.name);
      if (sortBy === 'price_low') return a.price - b.price;
      if (sortBy === 'price_high') return b.price - a.price;
      return 0;
    });

  const categoriesList = [
    { id: 'All', label: 'All Services', emoji: '✨' },
    { id: 'Consultation', label: 'Consultations', emoji: '👨‍⚕️' },
    { id: 'Laboratory', label: 'Laboratory', emoji: '🧪' },
    { id: 'Medical Requirement', label: 'Medical Requirements', emoji: '📋' }
  ];

  if (isAdmin) {
    categoriesList.push({ id: 'Doctor Requested Only', label: 'Doctor Requested (Admin)', emoji: '🩺' });
  }

  // Only patients or guests (which will redirect to login) see booking CTAs
  const canBook = !user || user.role === 'patient';

  return (
    <div className="bg-neutralbg dark:bg-slate-950 min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="text-center md:text-left mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Clinic Services Catalog
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-2xl">
            Explore our comprehensive range of clinical services, diagnostic lab tests, and medical requirements. Find detailed service info and next availability slots.
          </p>
        </div>

        {/* Filter Section */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-800/80 mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <FaSearch size={14} />
              </span>
              <input 
                type="text" 
                placeholder="Search by service name or description..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:focus:border-primary transition-all text-slate-900 dark:text-slate-100"
              />
            </div>

            {/* Sorting */}
            <div className="relative w-full md:w-56">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <FaSort size={14} />
              </span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary cursor-pointer text-slate-800 dark:text-slate-205"
              >
                <option value="az">Sort: A to Z</option>
                <option value="za">Sort: Z to A</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Elegant Filter Chips */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
            {categoriesList.map((cat) => {
              const isActive = category === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 border ${
                    isActive 
                      ? 'bg-primary text-white border-primary shadow-sm ring-1 ring-primary/20' 
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200/60 dark:bg-slate-850 dark:hover:bg-slate-800 dark:text-slate-300 dark:border-slate-805'
                  }`}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Catalog Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div 
                key={i} 
                className="bg-white dark:bg-slate-900 rounded-2xl h-56 animate-pulse border border-slate-100 dark:border-slate-800/80 p-6 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded-full" />
                  <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded" />
                </div>
                <div className="h-10 w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-12 text-center shadow-sm">
            <p className="text-slate-500 dark:text-slate-400 font-medium">No services found matching your criteria.</p>
            <button 
              onClick={() => { setCategory('All'); setSearchTerm(''); }}
              className="mt-4 text-xs font-bold text-primary hover:underline"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredServices.map((s) => (
              <ServiceCard 
                key={s.id} 
                service={s} 
                onViewDetails={(service) => setSelectedService(service)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modern Details Modal */}
      {selectedService && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop Closer */}
          <div className="absolute inset-0 cursor-default" onClick={() => setSelectedService(null)} />

          {/* Modal Card Container */}
          <div className="relative bg-white dark:bg-slate-950 rounded-3xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-105 dark:border-slate-800/80 animate-in fade-in zoom-in-95 duration-200 z-10 my-8">
            
            {/* Close Button */}
            <button 
              onClick={() => setSelectedService(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 p-2 rounded-full transition-all duration-200"
            >
              <FaTimes size={14} />
            </button>

            {/* Modal Content */}
            <div className="p-6 md:p-8 space-y-6">
              
              {/* Category & Badge */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getServiceCategory(selectedService).class}`}>
                  <span>{getServiceCategory(selectedService).emoji}</span>
                  <span>{getServiceCategory(selectedService).label}</span>
                </span>
                
                {/* Doctor Consult/Direct badge */}
                {selectedService.requires_doctor ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-semibold bg-red-50 text-red-700 border border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/40">
                    <FaUserMd size={10} />
                    <span>Doctor Required</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-semibold bg-teal-50 text-teal-700 border border-teal-100 dark:bg-teal-950/20 dark:text-teal-400 dark:border-teal-900/40">
                    <FaCheck size={10} />
                    <span>Direct Booking</span>
                  </span>
                )}
              </div>

              {/* Service Title */}
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
                  {selectedService.name}
                </h2>
              </div>

              {/* Price & Duration Stats */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-850">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-wider text-left">Duration</span>
                  <span className="inline-flex items-center gap-1.5 mt-1 font-bold text-slate-800 dark:text-slate-200">
                    <FaClock className="text-primary" size={14} />
                    <span>{selectedService.durationMin} mins</span>
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-wider text-left">Base Price</span>
                  <span className="mt-1 font-black text-slate-950 dark:text-white text-lg">
                    ₱{Number(selectedService.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Full Description */}
              <div className="space-y-2">
                <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 dark:text-slate-500 text-left">Service Description</h4>
                <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed font-medium text-left">
                  {selectedService.desc}
                </p>
              </div>

              {/* Requirements Section */}
              <div className="space-y-2">
                <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 dark:text-slate-500 text-left">Special Requirements / Notes</h4>
                {selectedService.requirements_notes ? (
                  <div className="flex items-start gap-2 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100/50 dark:border-amber-900/30 p-3 rounded-xl text-left">
                    <FaFileAlt className="text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" size={13} />
                    <p className="text-xs text-amber-800 dark:text-amber-400 font-medium">
                      {selectedService.requirements_notes}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-450 font-medium text-left">
                    No special preparation or documents required prior to this visit.
                  </p>
                )}
              </div>

              {/* Next Available Schedule */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-900">
                <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 dark:text-slate-500 text-left">Next Available Schedule</h4>
                <div className="flex items-center gap-3 bg-teal-50/30 dark:bg-teal-950/10 border border-teal-100/40 dark:border-teal-900/20 p-4 rounded-xl text-left">
                  <FaCalendarAlt className="text-primary flex-shrink-0" size={16} />
                  
                  {loadingSchedule ? (
                    <div className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Probing clinic schedules...</span>
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {nextSchedule}
                    </span>
                  )}
                </div>
              </div>

              {/* Footer CTA */}
              {canBook && (
                <div className="pt-2">
                  {selectedService.service_type === 'consultation' ? (
                    <button
                      onClick={() => handleBook(selectedService)}
                      className="w-full bg-primary hover:bg-primary/95 text-white font-extrabold py-3.5 px-6 rounded-xl shadow-md hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2 active:scale-[0.99]"
                    >
                      <FaUserMd size={14} />
                      <span>Book Appointment</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBook(selectedService)}
                      className="w-full bg-primary hover:bg-primary/95 text-white font-extrabold py-3.5 px-6 rounded-xl shadow-md hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2 active:scale-[0.99]"
                    >
                      <FaStethoscope size={14} />
                      <span>Schedule Service</span>
                    </button>
                  )}
                </div>
              )}

              {/* Non-patient fallback notice */}
              {!canBook && (
                <div className="flex items-center justify-center gap-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800 text-center">
                  <FaLock size={12} className="text-slate-400" />
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Logged in as {user.role}. Booking only available for patients.
                  </span>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
