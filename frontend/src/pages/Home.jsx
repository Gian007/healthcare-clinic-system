import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaClock, FaEnvelope, FaExclamationTriangle, FaFacebook, FaInstagram,
  FaMapMarkerAlt, FaPhoneAlt, FaArrowRight, FaUsers, FaCalendarAlt,
  FaDesktop, FaShieldAlt, FaBell, FaHeartbeat, FaStethoscope, FaChartLine, FaCheck
} from "react-icons/fa";
import Logo from "../components/Logo";
import * as publicApi from "../api/publicApi";
import { useAuth } from "../state/auth";
import { useAdminSettings } from "../state/adminSettings";
import { resolveLogoUrl } from "../config/adminSettings";

const SECTION_DEFAULTS = {
  hero: {
    button_text: "Book Appointment",
    button_link: "/patient/book",
  },
  about: {
    title: "Smart Healthcare, Smarter Queues",
    subtitle: "MediQueue is a comprehensive clinic management platform that brings real-time visibility to healthcare availability, appointment scheduling, and patient queue management.",
    button_text: "Learn More",
    button_link: "#",
    image_url: null,
  },
  features: {
    title: "Platform Features",
    subtitle: "Everything your clinic needs in one place",
    content: JSON.stringify([
      { icon: "clock",    title: "Real-Time Availability",    desc: "See which doctors are available right now and book instantly." },
      { icon: "calendar", title: "Smart Scheduling",           desc: "Manage appointments, walk-ins, and follow-ups effortlessly." },
      { icon: "users",    title: "Live Queue Management",      desc: "Monitor and manage patient queues in real time across all rooms." },
      { icon: "bell",     title: "Announcements",              desc: "Keep patients informed with clinic-wide announcements and updates." },
      { icon: "shield",   title: "Secure Access",              desc: "Role-based access for admin, doctors, staff, and patients." },
      { icon: "desktop",  title: "Centralized Dashboard",      desc: "One platform for all your clinic management needs." },
    ]),
  },
  how_it_works: {
    title: "How It Works",
    subtitle: "Three simple steps to better healthcare management",
    content: JSON.stringify([
      { label: "Step One",   title: "Register & Log In",       desc: "Create your patient account and verify your identity to get started." },
      { label: "Step Two",   title: "Book an Appointment",     desc: "Choose your service, select a doctor, and pick your preferred date and time." },
      { label: "Step Three", title: "Attend & Get Care",       desc: "Show up, track your queue position in real time, and receive quality care." },
    ]),
  },
  professionals: {
    title: "Our Medical Professionals",
    subtitle: "Meet our team of certified doctors and specialists dedicated to your health.",
    image_url: null,
  },
  benefits: {
    title: "Real Results for Real Clinics",
    subtitle: "MediQueue helps clinics operate more efficiently while improving the patient experience.",
    content: JSON.stringify([
      { stat: "80%", title: "Reduced Wait Times",            desc: "Patients spend less time waiting with smart queue management." },
      { stat: "95%", title: "Patient Satisfaction",          desc: "Higher satisfaction scores through transparency and efficiency." },
      { stat: "3×",  title: "More Appointments Handled",     desc: "Clinics can manage more patients without adding staff." },
    ]),
  },
  cta: {
    title: "Ready to Get Started?",
    subtitle: "Join MediQueue today and experience smarter, faster healthcare.",
    button_text: "Book Appointment",
    button_link: "/patient/book",
  },
};


export default function Home() {
  const nav = useNavigate();
  const { user } = useAuth();
  const { settings } = useAdminSettings();
  const logoUrl = resolveLogoUrl(settings.branding.logoPath);
  
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [landingSettings, setLandingSettings] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);
  const [queueCount, setQueueCount] = useState(0);
  const [servicesCount, setServicesCount] = useState(0);
  const [avgWaitTime, setAvgWaitTime] = useState(0);

  useEffect(() => {
    Promise.all([
      publicApi.getClinicStatus(),
      publicApi.getLandingPageSettings(),
      publicApi.getDoctors(),
      publicApi.getQueue(),
      publicApi.getServices()
    ])
    .then(([statusData, landingData, doctorsData, queueData, servicesData]) => {
      setStatus(statusData);
      setLandingSettings(landingData);
      
      const activeDocs = doctorsData.filter(d => d.status === 'Active' || d.status === 'Available');
      const mappedDocs = activeDocs.map(d => ({
        name: `Dr. ${d.first_name} ${d.last_name}`,
        specialty: d.specialization?.name || "General Medicine",
        image: d.profile_picture 
          ? `${import.meta.env.VITE_BACKEND_URL}/storage/${d.profile_picture}` 
          : `https://ui-avatars.com/api/?name=${d.first_name}+${d.last_name}&background=0D8BFF&color=fff`,
      }));
      setDoctorsList(mappedDocs);
      
      const waiting = queueData.filter(q => q.status === 'Waiting');
      setQueueCount(waiting.length);
      setAvgWaitTime(waiting.length * 15); // mock avg wait calc based on queue length for the preview widget
      setServicesCount(servicesData?.length || 0);
    })
    .catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  const getSection = (key) => {
    const found = landingSettings.find(s => s.section_key === key);
    return found ?? SECTION_DEFAULTS[key] ?? null;
  };
  const isVisible = (key) => {
    if (landingSettings.length === 0) return true; // show all sections when DB has no data
    const s = landingSettings.find(s => s.section_key === key);
    return s && s.is_visible;
  };
  const parseJson = (content) => {
    try { return JSON.parse(content) || []; }
    catch { return []; }
  };

  const goBook = (link = "/patient/book") => {
    if (!user) return nav(`/login?next=${link}`);
    return nav(link);
  };

  const hero = getSection('hero');
  const about = getSection('about');
  const features = getSection('features');
  const how = getSection('how_it_works');
  const professionals = getSection('professionals');
  const benefits = getSection('benefits');
  const cta = getSection('cta');

  if (loading) {
    return <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
      <div className="animate-spin text-teal-500 w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full" />
    </div>;
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-200 font-sans selection:bg-teal-500/30 transition-colors duration-300">
      
      {/* 2-Column SaaS Hero Section */}
      {isVisible('hero') && (
        <section className="relative pt-32 pb-20 px-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-teal-500/10 to-transparent dark:from-teal-900/20 dark:to-slate-950/0 pointer-events-none" />
          <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[80%] rounded-full bg-teal-400/20 dark:bg-teal-500/10 blur-[120px] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto relative z-10 grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side Content */}
            <div className="text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 backdrop-blur-md mb-8 shadow-sm">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase">System Live & Online</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1] mb-6">
                Real-Time Healthcare <br />
                Availability & <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500 dark:from-teal-400 dark:to-emerald-400">Queue Management</span> System
              </h1>
              
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-xl leading-relaxed font-medium">
                MediQueue helps clinics manage doctor schedules, appointments, patient queues, and healthcare availability through one centralized platform.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 mb-12">
                <button
                  onClick={() => goBook(hero?.button_link)}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-white dark:text-slate-950 font-bold tracking-wide transition-all shadow-[0_0_30px_-10px_rgba(20,184,166,0.5)] flex items-center justify-center gap-3"
                >
                  {hero?.button_text || "Book Appointment"}
                  <FaArrowRight size={14} />
                </button>
                <button
                  onClick={() => nav('/doctors')}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-bold tracking-wide transition-all border border-slate-200 dark:border-slate-800 shadow-sm"
                >
                  View Doctors
                </button>
              </div>

              {/* Promises / Trust Indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2"><FaCheck className="text-teal-500" /> Real-Time Doctor Availability</div>
                <div className="flex items-center gap-2"><FaCheck className="text-teal-500" /> Smart Appointment Scheduling</div>
                <div className="flex items-center gap-2"><FaCheck className="text-teal-500" /> Live Queue Monitoring</div>
                <div className="flex items-center gap-2"><FaCheck className="text-teal-500" /> Clinic Announcements</div>
              </div>
            </div>

            {/* Right side - System Preview Widgets */}
            <div className="relative h-[600px] w-full hidden lg:block perspective-1000">
               {/* Decorative background blob */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-teal-400/20 dark:bg-teal-500/10 blur-[80px] rounded-full" />
               
               {/* Main Dashboard Abstract Backdrop */}
               <div className="absolute inset-4 rounded-3xl bg-slate-100/50 dark:bg-slate-800/20 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm shadow-2xl rotate-y-[-10deg] rotate-x-[5deg] scale-95 overflow-hidden">
                 <div className="h-12 border-b border-slate-200/50 dark:border-slate-700/50 flex items-center px-4 gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-400/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
                 </div>
                 <div className="p-8 grid grid-cols-3 gap-4 opacity-50">
                    <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                    <div className="col-span-2 h-20 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                    <div className="col-span-3 h-40 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                 </div>
               </div>

               {/* Widget 2: Available Doctors (Float 2) */}
               <div className="absolute bottom-24 -left-8 w-72 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700 shadow-xl rounded-2xl p-5 animate-float-delayed z-30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-100">Available Doctors</div>
                    <div className="text-xs font-bold bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 px-2 py-1 rounded-md">{doctorsList.length} Online</div>
                  </div>
                  <div className="space-y-3">
                     {doctorsList.slice(0, 2).map((d, i) => (
                        <div key={i} className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-white dark:border-slate-700 overflow-hidden shadow-sm">
                              <img src={d.image} alt={d.name} className="w-full h-full object-cover" />
                           </div>
                           <div className="flex-1">
                              <div className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{d.name}</div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{d.specialty}</div>
                           </div>
                        </div>
                     ))}
                     {doctorsList.length === 0 && (
                        <div className="text-xs text-slate-500 italic">No doctors currently available.</div>
                     )}
                  </div>
               </div>

               {/* Widget 3: Clinic Open Status (Float 3) */}
               <div className="absolute top-[40%] -left-12 w-56 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-700 shadow-xl rounded-2xl p-4 animate-float-slow z-20">
                  <div className="flex items-center gap-3 mb-2">
                     <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400">
                        <FaClock size={14} />
                     </div>
                     <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Clinic Status</div>
                  </div>
                  <div className="text-lg font-black text-slate-900 dark:text-white mt-1">
                     {status?.hours ? "Open Now" : "Closed"}
                  </div>
                  <div className="text-xs font-semibold text-slate-500 mt-1">
                     {servicesCount > 0 ? `${servicesCount} Services Available` : "Checking services..."}
                  </div>
               </div>
            </div>
          </div>
        </section>
      )}

      {/* About Section */}
      {isVisible('about') && (
        <section id="about" className="py-24 px-6 relative bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-900">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-sm font-black text-teal-500 uppercase tracking-widest mb-3">About The Platform</h2>
                <h3 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                  {about?.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-8">
                  {about?.subtitle}
                </p>
                <a href={about?.button_link} className="inline-flex items-center gap-2 text-teal-600 dark:text-teal-400 font-bold hover:text-teal-700 dark:hover:text-teal-300 transition-colors">
                  {about?.button_text} <FaArrowRight size={14} />
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-3xl blur-3xl opacity-10 dark:opacity-20" />
                {about?.image_url ? (
                  <img src={about.image_url} alt="About MediQueue" className="relative rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full object-cover aspect-video" />
                ) : (
                  <img src="/Poster.png" alt="About MediQueue" className="relative rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full object-cover aspect-video" />
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      {isVisible('features') && (
        <section id="features" className="py-24 px-6 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-sm font-black text-teal-500 uppercase tracking-widest mb-3">{features?.title}</h2>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">{features?.subtitle}</h3>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {parseJson(features?.content).map((feat, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl hover:border-teal-500/30 transition-colors group shadow-sm">
                  <div className="h-12 w-12 rounded-xl bg-teal-50 dark:bg-slate-800 text-teal-600 dark:text-teal-400 flex items-center justify-center text-xl mb-6 group-hover:scale-110 transition-transform">
                    {feat.icon === 'clock' && <FaClock />}
                    {feat.icon === 'users' && <FaUsers />}
                    {feat.icon === 'calendar' && <FaCalendarAlt />}
                    {feat.icon === 'shield' && <FaShieldAlt />}
                    {feat.icon === 'desktop' && <FaDesktop />}
                    {feat.icon === 'bell' && <FaBell />}
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{feat.title}</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How It Works - Our Journey Timeline */}
      {isVisible('how_it_works') && (
        <section className="py-32 px-6 relative bg-white dark:bg-slate-950 overflow-hidden">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-24">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">{how?.title}</h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">{how?.subtitle}</p>
            </div>

            <div className="relative">
              {/* Center dashed line for desktop */}
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[2px] border-l-2 border-dashed border-teal-500/30 -translate-x-1/2" />
              {/* Left dashed line for mobile */}
              <div className="md:hidden absolute left-[27px] top-0 bottom-0 w-[2px] border-l-2 border-dashed border-teal-500/30" />

              {parseJson(how?.content).map((step, i) => (
                <div key={i} className="relative flex items-center w-full mb-16 last:mb-0">
                  
                  {/* Left Side (Desktop Only) */}
                  <div className={`hidden md:block w-[calc(50%-3rem)] text-right pr-8 ${i % 2 !== 0 ? 'invisible' : ''}`}>
                    <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 inline-block w-full hover:border-teal-400 transition-colors">
                      <div className="text-[10px] font-black uppercase tracking-widest text-teal-500 mb-2">{step.label}</div>
                      <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{step.title}</h4>
                      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                    </div>
                  </div>

                  {/* Center Circle Marker */}
                  <div className="absolute left-[14px] md:left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-white dark:bg-slate-950 border-[3px] border-teal-500 flex items-center justify-center text-teal-600 dark:text-teal-400 font-black shadow-xl z-10 text-xl">
                    {String(i + 1).padStart(2, '0')}
                  </div>

                  {/* Right Side (Desktop Only) */}
                  <div className={`hidden md:block w-[calc(50%-3rem)] ml-auto text-left pl-8 ${i % 2 === 0 ? 'invisible' : ''}`}>
                    <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 inline-block w-full hover:border-teal-400 transition-colors">
                      <div className="text-[10px] font-black uppercase tracking-widest text-teal-500 mb-2">{step.label}</div>
                      <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{step.title}</h4>
                      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                    </div>
                  </div>

                  {/* Mobile View */}
                  <div className="w-full pl-20 md:hidden">
                    <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 text-left hover:border-teal-400 transition-colors">
                      <div className="text-[10px] font-black uppercase tracking-widest text-teal-500 mb-2">{step.label}</div>
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{step.title}</h4>
                      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Professionals Section */}
      {isVisible('professionals') && (
        <section className="py-24 px-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">{professionals?.title}</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto">{professionals?.subtitle}</p>
            {professionals?.image_url && (
              <div className="relative max-w-4xl mx-auto">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-50 dark:from-slate-900 via-transparent to-transparent z-10 rounded-3xl" />
                <img src={professionals.image_url} alt="Professionals" className="w-full rounded-3xl border border-slate-200 dark:border-slate-800" />
              </div>
            )}
            <div className="mt-8">
              <button onClick={() => nav('/doctors')} className="px-8 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors shadow-sm">
                Meet Our Doctors
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Benefits / Results */}
      {isVisible('benefits') && (
        <section className="py-24 px-6 relative overflow-hidden bg-white dark:bg-slate-950">
          <div className="absolute inset-0 bg-teal-500/5 pointer-events-none" />
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">{benefits?.title}</h2>
                <p className="text-slate-600 dark:text-slate-400 text-lg mb-8 leading-relaxed">{benefits?.subtitle}</p>
              </div>
              <div className="grid gap-4">
                {parseJson(benefits?.content).map((b, i) => (
                  <div key={i} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex items-center gap-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-16 h-16 rounded-xl bg-teal-50 dark:bg-slate-800 flex flex-col items-center justify-center shrink-0 border border-teal-100 dark:border-slate-700 text-teal-600 dark:text-teal-400">
                      <span className="text-xl font-black">{b.stat}</span>
                    </div>
                    <div>
                      <h4 className="text-slate-900 dark:text-white font-bold mb-1">{b.title}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Final CTA Footer */}
      {isVisible('cta') && (
        <section className="py-32 px-6 relative border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-teal-500/5 dark:to-teal-900/20" />
          <div className="max-w-3xl mx-auto relative z-10 text-center">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 leading-tight">{cta?.title}</h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg mb-10">{cta?.subtitle}</p>
            <button
              onClick={() => goBook(cta?.button_link)}
              className="px-10 py-5 rounded-2xl bg-teal-500 hover:bg-teal-400 text-white dark:text-slate-950 font-black tracking-wide transition-all shadow-[0_0_40px_-10px_rgba(20,184,166,0.5)] text-lg"
            >
              {cta?.button_text || "Book Appointment"}
            </button>
          </div>
        </section>
      )}

      {/* Standard Footer */}
      <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900 pt-16 pb-8 text-sm text-slate-600 dark:text-slate-500">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <Logo size="sm" src={logoUrl} />
              <p className="mt-4 max-w-sm">{settings.homepage.contact.description}</p>
            </div>
            <div>
              <h5 className="text-slate-900 dark:text-white font-bold mb-4 uppercase tracking-wider text-xs">Contact</h5>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <FaMapMarkerAlt className="mt-1 shrink-0 text-teal-600 dark:text-teal-500" />
                  <span>{settings.homepage.contact.address}</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaEnvelope className="shrink-0 text-teal-600 dark:text-teal-500" />
                  <a href={`mailto:${settings.homepage.contact.email}`} className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">{settings.homepage.contact.email}</a>
                </li>
                <li className="flex items-center gap-3">
                  <FaPhoneAlt className="shrink-0 text-teal-600 dark:text-teal-500" />
                  <span>{settings.homepage.contact.customerServicePhone}</span>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="text-slate-900 dark:text-white font-bold mb-4 uppercase tracking-wider text-xs">Follow Us</h5>
              <div className="flex gap-4">
                <a href={settings.homepage.social.facebookUrl} className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-900 flex items-center justify-center hover:bg-teal-500 hover:text-white transition-all text-lg text-slate-700 dark:text-slate-400">
                  <FaFacebook />
                </a>
                <a href={settings.homepage.social.instagramUrl} className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-900 flex items-center justify-center hover:bg-teal-500 hover:text-white transition-all text-lg text-slate-700 dark:text-slate-400">
                  <FaInstagram />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-200 dark:border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p>{settings.homepage.footer.copyright}</p>
            <div className="flex gap-6">
              <a href={settings.homepage.footer.privacyUrl || "#"} className="hover:text-slate-900 dark:hover:text-white transition-colors">{settings.homepage.footer.privacyLabel}</a>
              <a href={settings.homepage.footer.termsUrl || "#"} className="hover:text-slate-900 dark:hover:text-white transition-colors">{settings.homepage.footer.termsLabel}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
