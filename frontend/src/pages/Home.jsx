import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../state/auth";
import { FaUserMd, FaClock, FaCalendarAlt, FaPaperPlane } from "react-icons/fa";
import Logo from "../components/Logo";

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
        <section className="bg-white/70 dark:bg-slate-900/70 backdrop-blur rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 px-6 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="font-semibold text-gray-900">Hours</div>
            <div className="mt-2 text-sm text-gray-600 leading-6">
              Monday - Friday: 8:00 AM - 6:00 PM <br />
              Saturday: 9:00 AM - 3:00 PM <br />
              Sunday: Closed
            </div>
          </div>

          <div className="text-center">
            <div className="font-semibold text-gray-900">Address</div>
            <div className="mt-2 text-sm text-gray-600 leading-6">
              123 Medical Drive <br />
              City, State 12345
            </div>
          </div>

          <div className="text-center">
            <div className="font-semibold text-gray-900">Contact</div>
            <div className="mt-2 text-sm text-gray-600 leading-6">
              Phone: (555) 123-4567 <br />
              Email: info@healthcareclinic.com
            </div>
          </div>
        </section>

        {/* QUICK ACCESS */}
        <section className="py-14">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white text-center">
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
        <section className="pb-14">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded bg-primary/10 text-primary">
                <FaPaperPlane className="text-sm" />
              </span>
              Latest Updates
            </h2>

            <Link
              to="/announcements"
              className="text-sm text-primary inline-flex items-center gap-2 hover:underline"
            >
              View All <ArrowRight />
            </Link>
          </div>

          <div className="mt-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-5">
            <div className="flex items-start gap-3">
              <span className="mt-2 w-2 h-2 rounded-full bg-primary" />
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  System Maintenance - May 25, 2026
                </div>
                <div className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                  Our clinic queueing system will undergo scheduled maintenance this coming weekend...
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  May 10, 2026
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
