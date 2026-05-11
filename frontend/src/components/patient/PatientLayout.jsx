import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../state/auth";
import {
  FaHeartbeat, FaCalendarAlt, FaCreditCard, FaBell, FaUser, FaSignOutAlt, FaBars, FaTimes, FaHome
} from "react-icons/fa";

const links = [
  { to: "/patient", label: "Dashboard", icon: FaHome, end: true },
  { to: "/patient/book", label: "Book Appointment", icon: FaCalendarAlt },
  { to: "/patient/profile", label: "Profile", icon: FaUser },
];

export default function PatientLayout() {
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem("clinicTheme") === "dark");
  const { user, logout } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("clinicTheme", dark ? "dark" : "light");
  }, [dark]);

  const handleLogout = async () => {
    await logout();
    nav("/");
  };

  const displayName = user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() : "Patient";
  const initials = user ? `${(user.first_name || "P")[0]}${(user.last_name || "")[0] || ""}` : "P";

  return (
    <div className="min-h-screen bg-[#f4f6f8] dark:bg-slate-950 transition-colors">
      {/* Mobile overlay */}
      {open && (
        <button onClick={() => setOpen(false)} className="fixed inset-0 z-40 bg-black/30 lg:hidden" />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 z-50 h-screen w-72 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 flex flex-col shadow-lg lg:shadow-none`}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <FaHeartbeat className="text-primary text-lg" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 dark:text-white">HealthCare Clinic</h1>
              <p className="text-xs text-gray-500">Patient Portal</p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="lg:hidden text-gray-400 hover:text-gray-600">
            <FaTimes />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-primary text-white shadow-md"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white"
                  }`
                }
              >
                <Icon className="text-base" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-3 rounded-xl bg-gray-50 dark:bg-slate-800/50 p-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-white font-bold text-sm shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{displayName}</p>
              <p className="text-xs text-gray-500">{user?.email || "patient@email.com"}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gray-100 hover:bg-red-50 hover:text-red-600 px-4 py-3 text-sm font-medium text-gray-600 transition-colors"
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 lg:px-8 transition-colors">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="rounded-lg border border-gray-200 p-2 lg:hidden"
            >
              <FaBars className="text-gray-600" />
            </button>
            <h2 className="font-semibold text-gray-900 dark:text-white">Welcome, {user?.first_name || "Patient"}!</h2>
          </div>
          <div className="flex items-center gap-4 relative">
            <button 
              onClick={() => {
                setProfileMenuOpen(false);
                setNotifOpen(!notifOpen);
              }} 
              className="text-sm text-gray-500 hover:text-gray-900 relative p-2"
            >
              <FaBell className="text-lg" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {notifOpen && (
              <div className="absolute right-32 top-12 w-80 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg z-50 overflow-hidden">
                <div className="p-3 border-b dark:border-slate-700 font-semibold text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-900/50">Notifications</div>
                <div className="max-h-64 overflow-y-auto">
                  <div className="p-3 border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Appointment Confirmed</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Your appointment with Dr. Santos is confirmed for tomorrow.</p>
                  </div>
                  <div className="p-3 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Welcome to HealthCare</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Please complete your profile verification.</p>
                  </div>
                </div>
              </div>
            )}

            <div className="relative">
              <button 
                onClick={() => {
                  setNotifOpen(false);
                  setProfileMenuOpen(!profileMenuOpen);
                }}
                className="hidden sm:block text-right cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 p-2 rounded-lg"
              >
                <p className="text-sm font-semibold text-gray-900">{displayName}</p>
                <p className="text-xs text-gray-500">Patient</p>
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 top-12 w-56 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg z-50 overflow-hidden">
                  <div className="p-3 border-b dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{displayName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email || "patient@email.com"}</p>
                  </div>
                  <div className="py-1">
                    <button onClick={() => { setProfileMenuOpen(false); nav("/patient/profile"); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700">Profile Settings</button>
                    <button onClick={() => { setProfileMenuOpen(false); nav("/patient/profile"); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700">Verification ID</button>
                    <button onClick={() => setDark(!dark)} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700">Toggle Theme ({dark ? 'Light' : 'Dark'})</button>
                  </div>
                  <div className="border-t dark:border-slate-700 py-1">
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium">Logout</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
