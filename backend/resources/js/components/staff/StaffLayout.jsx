import { useState, useEffect } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../state/auth";
import * as notifApi from "../../api/notificationApi";
import { 
  FaHeartbeat, FaThLarge, FaUsers, FaCalendarCheck, FaClipboardList, 
  FaQrcode, FaBell, FaSignOutAlt, FaSun, FaMoon, FaBars, FaTimes, FaCog, FaClinicMedical
} from "react-icons/fa";
import Logo from "../Logo";

const links = [
  { name: "Dashboard", path: "/staff", icon: FaThLarge },
  { name: "Queue Management", path: "/staff/queue", icon: FaClipboardList },
  { name: "Scan Patient", path: "/staff/scan", icon: FaQrcode },
  { name: "Appointments", path: "/staff/appointments", icon: FaCalendarCheck },
  { name: "Walk-in Registration", path: "/staff/walk-in", icon: FaClinicMedical },
  { name: "Patients", path: "/staff/patients", icon: FaUsers },
  { name: "Hospital Schedule", path: "/staff/schedule", icon: FaCalendarCheck },
  { name: "Clinic Calendar", path: "/staff/calendar", icon: FaCalendarCheck },
  { name: "Notifications", path: "/staff/notifications", icon: FaBell },
];

export default function StaffLayout() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem("clinicTheme") === "dark");

  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnread = async () => {
    try {
      const res = await notifApi.getUnreadCount();
      setUnreadCount(res.unread_count || 0);
    } catch (e) {}
  };

  useEffect(() => {
    fetchUnread();
    const timer = setInterval(fetchUnread, 15000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("clinicTheme", dark ? "dark" : "light");
  }, [dark]);

  function handleLogout() {
    logout();
    nav("/");
  }

  const staffName = user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() : "Staff User";
  const initials = user ? `${(user.first_name || "S")[0]}${(user.last_name || "")[0] || ""}` : "SU";

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#eefafa] dark:bg-slate-950 transition-colors duration-300">
      {/* Mobile Overlay */}
      {open && <button onClick={() => setOpen(false)} className="fixed inset-0 z-40 bg-black/40 lg:hidden backdrop-blur-sm" />}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 z-50 h-[100dvh] w-72 bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 flex flex-col shadow-2xl lg:shadow-none`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50 dark:border-slate-800 shrink-0">
          <Link to="/staff" className="flex items-center gap-3">
            <Logo />
            <div>
              <h1 className="font-black text-xl text-gray-900 dark:text-white leading-none tracking-tighter font-comfortaa font-fat">SHQMS</h1>
              <p className="text-[9px] text-teal-600 dark:text-teal-400 uppercase font-bold tracking-widest mt-1 font-poppins">Staff Access</p>
            </div>
          </Link>
          <button onClick={() => setOpen(false)} className="lg:hidden text-gray-400 hover:text-teal-600 transition-colors"><FaTimes size={18}/></button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 px-4 space-y-0.5 scrollbar-hide">
          <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest my-4">Management</p>
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/staff"}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200 ${
                    isActive
                      ? "bg-teal-600 text-white shadow-lg shadow-teal-600/20 scale-[1.02]"
                      : "text-gray-500 dark:text-gray-400 hover:bg-teal-50 dark:hover:bg-slate-800/50 hover:text-teal-700 dark:hover:text-white"
                  }`
                }
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="mt-auto shrink-0 border-t border-gray-50 dark:border-slate-800">
          <div className="p-3 space-y-1">
            <button
              onClick={() => nav("/staff/profile")}
              className="w-full flex items-center gap-4 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-all"
            >
              <FaCog size={16} />
              <span>Profile Settings</span>
            </button>
            <button
              onClick={() => setDark(!dark)}
              className="w-full flex items-center gap-4 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-all"
            >
              {dark ? <FaSun size={16} className="text-amber-400" /> : <FaMoon size={16} />}
              <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 rounded-xl px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
            >
              <FaSignOutAlt size={16} />
              <span>Logout</span>
            </button>
          </div>

          {/* User Footer */}
          <div className="p-3 bg-teal-50/50 dark:bg-slate-900/50 flex items-center gap-3 border-t border-gray-50 dark:border-slate-800">
            <div className="h-9 w-9 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-sm shrink-0 border-2 border-white dark:border-slate-800 shadow-sm overflow-hidden">
              {user?.profile_picture ? (
                <img 
                  src={`${import.meta.env.VITE_BACKEND_URL}/storage/${user.profile_picture}?t=${new Date().getTime()}`} 
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{staffName}</p>
              <p className="text-[10px] text-gray-500 truncate">Staff Member</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 lg:px-8 transition-colors">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(true)} className="lg:hidden p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg">
              <FaBars size={20} />
            </button>
            <div>
              <h1 className="font-bold text-gray-900 dark:text-white">Staff Dashboard</h1>
              <p className="hidden text-[10px] text-gray-500 sm:block uppercase font-bold tracking-wider">{today}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <NavLink to="/staff/notifications" className="relative p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-all">
              <FaBell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[8px] font-bold text-white border-2 border-white dark:border-slate-900 animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </NavLink>
            <div className="h-8 w-px bg-gray-200 dark:bg-slate-800 mx-1 hidden sm:block" />
            <div className="flex items-center gap-3">
               <div className="hidden sm:block text-right">
                  <p className="text-xs font-bold text-gray-900 dark:text-white leading-tight">{staffName}</p>
                  <p className="text-[10px] text-teal-600 font-bold uppercase tracking-tighter">Staff</p>
               </div>
               <div className="h-9 w-9 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs border-2 border-white dark:border-slate-800 shadow-sm overflow-hidden">
                  {user?.profile_picture ? (
                    <img src={`${import.meta.env.VITE_BACKEND_URL}/storage/${user.profile_picture}`} className="h-full w-full object-cover" />
                  ) : initials}
               </div>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet context={{ dark }} />
        </main>
      </div>
    </div>
  );
}