import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../state/auth";
import { useAdminSettings } from "../../state/adminSettings";
import { resolveLogoUrl } from "../../config/adminSettings";
import * as notifApi from "../../api/notificationApi";
import {
  FaHeartbeat, FaCalendarAlt, FaBell, FaUser, FaSignOutAlt, FaBars, FaTimes, FaHome, FaMoon, FaSun, FaChevronLeft, FaChevronRight
} from "react-icons/fa";
import Logo from "../Logo";

const links = [
  { to: "/patient", label: "Dashboard", icon: FaHome, end: true, key: "dashboard" },
  { to: "/patient/book", label: "Book Appointment", icon: FaCalendarAlt, key: "bookAppointment" },
  { to: "/patient/calendar", label: "Calendar", icon: FaCalendarAlt, key: "calendar" },
  { to: "/patient/profile", label: "Profile", icon: FaUser, key: "profile" },
];

export default function PatientLayout() {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("patientSidebarCollapsed") === "true");
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem("clinicTheme") === "dark");
  const [notifications, setNotifications] = useState([]);
  const { user, logout } = useAuth();
  const { settings } = useAdminSettings();
  const nav = useNavigate();
  const visibleLinks = links.filter((item) => settings.features.patientMenuItems[item.key] !== false);
  const logoUrl = resolveLogoUrl(settings.branding.logoPath);

  useEffect(() => {
    notifApi.getNotifications()
      .then(setNotifications)
      .catch(() => {});
  }, []);

  const handleMarkRead = async (id) => {
    await notifApi.markRead(id);
    setNotifications(prev => prev.map(n => n.notif_id === id ? { ...n, is_read: true } : n));
  };

  const handleMarkAllRead = async () => {
    await notifApi.markAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("clinicTheme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    localStorage.setItem("patientSidebarCollapsed", collapsed ? "true" : "false");
  }, [collapsed]);

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
      <aside className={`fixed left-0 top-0 z-50 h-[100dvh] transition-all duration-300 ease-in-out bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex flex-col shadow-2xl lg:shadow-none
        ${collapsed ? "lg:w-20" : "lg:w-72"} 
        ${open ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0"}`}>
        
        {/* Header */}
        <div className={`flex items-center border-b border-gray-100 dark:border-slate-800 p-5 shrink-0 h-[70px] ${collapsed ? "lg:justify-center justify-between" : "justify-between"}`}>
          <div className={`flex items-center gap-3 overflow-hidden ${collapsed ? "lg:hidden" : ""}`}>
            <Logo src={logoUrl} />
            <div>
              <h1 className="font-black text-xl text-gray-900 dark:text-white leading-none tracking-tighter font-comfortaa font-fat">{settings.branding.clinicName}</h1>
              <p className="text-[9px] text-teal-600 dark:text-teal-400 uppercase font-bold tracking-widest mt-1 font-poppins">Patient Portal</p>
            </div>
          </div>
          <div className="hidden lg:block">
            <button onClick={() => setCollapsed(!collapsed)} className="rounded-lg border border-gray-100 dark:border-slate-800 p-2 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-white">
              {collapsed ? <FaChevronRight size={12}/> : <FaChevronLeft size={12}/>}
            </button>
          </div>
          <button className="lg:hidden p-2 text-gray-400 hover:text-gray-600" onClick={() => setOpen(false)}>
            <FaTimes size={18} />
          </button>
        </div>

        {/* Navigation - Flexible area */}
        <nav className="flex-1 overflow-y-auto p-2 px-3 space-y-1.5 scrollbar-hide">
          <p className={`px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest my-3 transition-opacity duration-200 ${collapsed ? "lg:opacity-0" : "opacity-100"}`}>
            {collapsed ? "" : "Menu"}
          </p>
          {visibleLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center rounded-xl p-3 text-sm font-bold transition-all duration-200 ${
                    collapsed ? "lg:justify-center" : "gap-3 px-4"
                  } ${
                    isActive
                      ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800/50 hover:text-gray-900 dark:hover:text-white"
                  }`
                }
                title={collapsed ? item.label : ""}
              >
                <Icon size={18} className="shrink-0" />
                <span className={`transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden ${collapsed ? "lg:opacity-0 lg:w-0" : "opacity-100 w-auto"}`}>
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>

        {/* Fixed Bottom Section */}
        <div className="mt-auto shrink-0 border-t border-gray-100 dark:border-slate-800">
          <div className="p-3 space-y-1">
            <button
              onClick={() => setDark(!dark)}
              className={`w-full flex items-center rounded-xl p-2.5 text-xs font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-all ${
                collapsed ? "lg:justify-center" : "gap-3 px-4"
              }`}
              title={collapsed ? (dark ? 'Light Mode' : 'Dark Mode') : ""}
            >
              {dark ? <FaSun size={16} className="text-amber-400 shrink-0" /> : <FaMoon size={16} className="shrink-0" />}
              <span className={`transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden ${collapsed ? "lg:opacity-0 lg:w-0" : "opacity-100 w-auto"}`}>
                {dark ? 'Light Mode' : 'Dark Mode'}
              </span>
            </button>

            <button
              onClick={handleLogout}
              className={`w-full flex items-center rounded-xl p-2.5 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all ${
                collapsed ? "lg:justify-center" : "gap-3 px-4"
              }`}
              title={collapsed ? "Logout" : ""}
            >
              <FaSignOutAlt size={16} className="shrink-0" />
              <span className={`transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden ${collapsed ? "lg:opacity-0 lg:w-0" : "opacity-100 w-auto"}`}>
                Logout
              </span>
            </button>
          </div>

          {/* User Footer */}
          <div className={`p-3 bg-gray-50/50 dark:bg-slate-900/50 flex items-center border-t border-gray-100 dark:border-slate-800 transition-all ${
            collapsed ? "lg:justify-center" : "gap-3"
          }`}>
            <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 border-2 border-white dark:border-slate-800 shadow-sm overflow-hidden">
              {user?.profile_picture ? (
                <img 
                  src={`${import.meta.env.VITE_BACKEND_URL}/storage/${user.profile_picture}?t=${new Date().getTime()}`} 
                  className="h-full w-full object-cover"
                  onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${initials}&background=random`; }}
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div className={`min-w-0 transition-all duration-300 ease-in-out ${collapsed ? "lg:opacity-0 lg:w-0 lg:hidden" : "opacity-100 w-auto"}`}>
              <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{displayName}</p>
              <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className={`transition-all duration-300 ease-in-out ${collapsed ? "lg:pl-20" : "lg:pl-72"}`}>
        {/* Top header */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 lg:px-8 transition-colors">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="rounded-lg border border-gray-200 dark:border-slate-700 p-2 lg:hidden text-gray-600 dark:text-gray-400"
            >
              <FaBars />
            </button>

            <h2 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white truncate">Welcome, {user?.first_name || "Patient"}!</h2>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4 relative">
            {/* Dark mode toggle — header (desktop only) */}
            <button
              onClick={() => setDark(!dark)}
              className="hidden sm:flex items-center justify-center p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
              title={dark ? "Switch to Light" : "Switch to Dark"}
            >
              {dark ? <FaSun className="text-amber-400" /> : <FaMoon />}
            </button>

            {/* Notifications */}
            <button 
              onClick={() => {
                setProfileMenuOpen(false);
                setNotifOpen(!notifOpen);
              }} 
              className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition"
            >
              <FaBell className="text-lg" />
              {notifications.filter(n => !n.is_read).length > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
              )}
            </button>

            {notifOpen && (
              <div className="fixed inset-x-3 top-14 sm:absolute sm:inset-auto sm:right-0 sm:top-12 w-auto sm:w-80 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[75vh] sm:max-h-[28rem] animate-in fade-in zoom-in duration-200">
                <div className="p-3 border-b dark:border-slate-700 flex justify-between items-center bg-gray-50/80 dark:bg-slate-900/50">
                  <span className="font-bold text-sm text-gray-900 dark:text-white">Notifications</span>
                  <div className="flex items-center gap-2">
                    {notifications.some(n => !n.is_read) && (
                      <button onClick={handleMarkAllRead} className="text-[10px] text-primary font-bold hover:underline">Mark all read</button>
                    )}
                    <button onClick={() => setNotifOpen(false)} className="sm:hidden text-gray-400 p-1"><FaTimes /></button>
                  </div>
                </div>
                <div className="overflow-y-auto flex-1">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">No notifications.</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.notif_id} className={`p-3 border-b dark:border-slate-700 transition ${!n.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'}`}>
                        <p className={`text-sm font-medium leading-snug ${!n.is_read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                          {n.title} {!n.is_read && <span className="inline-block w-1.5 h-1.5 bg-primary rounded-full ml-1" />}
                        </p>
                        <p className={`text-xs mt-1 leading-relaxed ${!n.is_read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-500 dark:text-gray-500'}`}>{n.body}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-[10px] text-gray-400">{new Date(n.created_at).toLocaleString()}</span>
                          {!n.is_read && (
                            <button onClick={(e) => { e.stopPropagation(); handleMarkRead(n.notif_id); }} className="text-[10px] text-primary font-bold hover:underline">Read</button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Profile menu — desktop */}
            <div className="relative">
              <button 
                onClick={() => {
                  setNotifOpen(false);
                  setProfileMenuOpen(!profileMenuOpen);
                }}
                className="hidden sm:flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 p-2 rounded-lg transition"
              >
                <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden border border-primary/20">
                  {user?.profile_picture ? (
                    <img src={`${import.meta.env.VITE_BACKEND_URL}/storage/${user.profile_picture}`} className="h-full w-full object-cover" />
                  ) : initials}
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-gray-900 dark:text-white leading-tight">{displayName}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">Patient</p>
                </div>
              </button>

              {profileMenuOpen && (
                <div className="fixed inset-x-3 top-14 sm:absolute sm:inset-auto sm:right-0 sm:top-12 w-auto sm:w-56 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                  <div className="p-4 border-b dark:border-slate-700 bg-gray-50/80 dark:bg-slate-900/50">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{displayName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email || "patient@email.com"}</p>
                  </div>
                  <div className="py-1">
                    <button onClick={() => { setProfileMenuOpen(false); nav("/patient/profile"); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition">Profile Settings</button>
                    <button onClick={() => { setProfileMenuOpen(false); nav("/patient/profile"); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition">Verification ID</button>
                  </div>
                  <div className="border-t dark:border-slate-700 py-1">
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition">Logout</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="p-3 sm:p-5 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
