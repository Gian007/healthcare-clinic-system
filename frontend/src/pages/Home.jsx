import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../state/auth";
import { FaUserMd, FaClock, FaCalendarAlt, FaPaperPlane, FaExclamationTriangle, FaCheckCircle, FaDoorOpen } from "react-icons/fa";
import Logo from "../components/Logo";
import * as publicApi from "../api/publicApi";

function ArrowRight() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14" />
      <path d="M13 5l7 7-7 7" />
    </svg>
  );
}

function QuickCard({ icon, title, desc, onClick, highlight = false }) {
  return (
    <button
      onClick={onClick}
      className={[
        "bg-white dark:bg-slate-900 rounded-2xl shadow-sm border p-8 text-center transition w-full",
        "hover:shadow-md hover:-translate-y-[1px]",
        highlight ? "border-primary/60 ring-1 ring-primary/20" : "border-gray-100 dark:border-slate-800",
      ].join(" ")}
      type="button"
    >
      <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
        {icon}
      </div>
      <h3 className="mt-4 font-semibold text-gray-900 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm text-gray-600">{desc}</p>
    </button>
  );
}

export default function Home() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi.getClinicStatus()
      .then(setStatus)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const goBook = () => {
    if (!user) return nav("/login?next=/patient/book");
    return nav("/patient/book");
  };

  return (
    <div className="bg-[#eef2f3] dark:bg-slate-950 min-h-screen transition-colors">
      <div className="max-w-6xl mx-auto px-6">
        {/* HERO */}
        <section className="pt-14 pb-10 text-center">
          <div className="flex flex-col items-center mb-6">
            <Logo size="lg" />
          </div>
          <h1 className="text-4xl md:text-7xl font-black text-gray-900 dark:text-white tracking-tighter font-comfortaa leading-none font-fat">
            SHQMS
          </h1>
          <p className="mt-2 text-base font-bold text-primary uppercase tracking-[0.2em] font-poppins">Smart Healthcare Availability and Queue Management System</p>
          <div className="w-20 h-1 bg-primary/30 mx-auto my-6 rounded-full"></div>
          
          {status?.special && (
             <div className="mb-6 animate-bounce">
                <div className="inline-flex items-center gap-3 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-6 py-3 rounded-full border border-amber-200 dark:border-amber-800 font-bold text-sm shadow-lg">
                   <FaExclamationTriangle/> {status.special.title}: {status.special.type}
                </div>
             </div>
          )}

          <p className="text-lg md:text-xl italic font-medium text-gray-600 dark:text-slate-400 max-w-2xl mx-auto font-playfair">
            "Skip the Wait, Get the Care."
          </p>

          <div className="mt-6 flex justify-center">
            <button
              onClick={goBook}
              className="inline-flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-md shadow-sm hover:opacity-95 active:opacity-90"
              type="button"
            >
              Book Appointment
              <ArrowRight />
            </button>
          </div>
        </section>

        {/* INFO BAR */}
        <section className="bg-white/70 dark:bg-slate-900/70 backdrop-blur rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center flex flex-col items-center">
            <div className="h-10 w-10 rounded-xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 mb-3 shadow-inner">
               <FaClock/>
            </div>
            <div className="font-bold text-gray-900 dark:text-white">Today's Schedule</div>
            <div className="mt-3 text-sm text-gray-600 dark:text-slate-400 leading-relaxed font-medium">
               {loading ? (
                 <span className="animate-pulse">Fetching hours...</span>
               ) : (
                 <>
                   <div className="flex items-center gap-2 justify-center mb-1">
                      {status?.hours?.is_open ? (
                        <BadgePulse color="emerald" text="Now Open" />
                      ) : (
                        <BadgePulse color="rose" text="Closed Today" />
                      )}
                   </div>
                   {status?.hours?.is_open && (
                     <div className="text-lg font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">
                       {status.hours.open_time.slice(0,5)} - {status.hours.close_time.slice(0,5)}
                     </div>
                   )}
                   <div className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">{status?.today}, {status?.date}</div>
                 </>
               )}
            </div>
          </div>

          <div className="text-center flex flex-col items-center">
            <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 mb-3 shadow-inner">
               <FaDoorOpen/>
            </div>
            <div className="font-bold text-gray-900 dark:text-white">Clinic Status</div>
            <div className="mt-3 text-sm text-gray-600 dark:text-slate-400 leading-relaxed font-medium">
               {status?.special ? (
                 <div className="text-amber-600 dark:text-amber-400 font-bold">
                    ⚠️ {status.special.type}<br/>
                    <span className="text-[11px] font-medium">{status.special.reason || 'Special schedule in effect'}</span>
                 </div>
               ) : (
                 <div className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-2 justify-center">
                    <FaCheckCircle/> Operating Normally
                 </div>
               )}
            </div>
          </div>

          <div className="text-center flex flex-col items-center">
            <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 mb-3 shadow-inner">
               <FaCalendarAlt/>
            </div>
            <div className="font-bold text-gray-900 dark:text-white">Emergency?</div>
            <div className="mt-3 text-sm text-gray-600 dark:text-slate-400 leading-relaxed font-medium">
               Contact us directly for urgent cases:<br/>
               <span className="text-lg font-black text-slate-800 dark:text-slate-200">(555) 123-4567</span>
            </div>
          </div>
        </section>

        {/* QUICK ACCESS */}
        <section className="py-14">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center uppercase tracking-[0.3em]">
            Quick Access
          </h2>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <QuickCard
              icon={<FaUserMd className="text-2xl" />}
              title="View Doctors"
              desc="Meet our team of experienced healthcare professionals"
              onClick={() => nav("/doctors")}
            />
            <QuickCard
              icon={<FaClock className="text-2xl" />}
              title="View Queue"
              desc="Check the current queue status and estimated wait times"
              onClick={() => nav("/queue")}
            />
            <QuickCard
              highlight
              icon={<FaCalendarAlt className="text-2xl" />}
              title="Book Appointment"
              desc="Schedule your visit at your convenience"
              onClick={goBook}
            />
          </div>
        </section>

        {/* LATEST UPDATES */}
        <section className="pb-20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 uppercase tracking-widest">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-primary/10 text-primary shadow-inner">
                <FaPaperPlane className="text-sm" />
              </span>
              Latest Updates
            </h2>

            <Link
              to="/announcements"
              className="text-xs font-black text-primary uppercase tracking-widest hover:underline"
            >
              View All <ArrowRight />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 p-6 hover:border-primary/30 transition-all">
              <div className="flex items-start gap-4">
                <span className="mt-2 w-3 h-3 rounded-full bg-primary shadow-lg shadow-primary/40 animate-pulse" />
                <div>
                  <div className="font-bold text-lg text-gray-900 dark:text-white leading-tight">
                    New Scheduling System Active
                  </div>
                  <div className="text-sm text-gray-600 dark:text-slate-400 mt-2 line-clamp-2">
                    We have upgraded our appointment system to provide more accurate wait times and real-time clinic status.
                  </div>
                  <div className="text-[10px] font-black text-gray-400 mt-4 uppercase tracking-widest">
                    May 15, 2026
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function BadgePulse({ color, text }) {
  const colors = {
    emerald: "bg-emerald-500 text-emerald-500",
    rose: "bg-rose-500 text-rose-500"
  };
  return (
    <div className="flex items-center gap-1.5">
       <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${colors[color].split(' ')[0]}`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${colors[color].split(' ')[0]}`}></span>
       </span>
       <span className={`text-[10px] font-black uppercase tracking-widest ${colors[color].split(' ')[1]}`}>{text}</span>
    </div>
  );
}
