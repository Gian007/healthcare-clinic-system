import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FaThLarge as LayoutDashboard, FaCalendarAlt as CalendarDays, FaCalendarTimes as CalendarX2, FaClipboardList as ClipboardList, FaUsers as Users, FaClock as Clock3, FaUser as User, FaBars as Menu, FaTimes as X, FaMoon as Moon, FaSun as Sun, FaSignOutAlt as LogOut, FaChevronLeft as ChevronLeft, FaChevronRight as ChevronRight, FaBell as Bell } from 'react-icons/fa';
import Logo from "../Logo";
import { useEffect, useState } from 'react';
import { useAuth } from '../../state/auth';
import { useAdminSettings } from '../../state/adminSettings';
import { resolveLogoUrl } from '../../config/adminSettings';
import * as notifApi from '../../api/notificationApi';

const links = [
  { to: '/doctor', label: 'Dashboard', icon: LayoutDashboard, end: true, key: 'dashboard' },
  { to: '/doctor/schedule', label: 'My Schedule', icon: CalendarDays, key: 'schedule' },
  { to: '/doctor/dayoff', label: 'Day Off Request', icon: CalendarX2, key: 'dayOff' },
  { to: '/doctor/appointments', label: 'Appointments', icon: ClipboardList, key: 'appointments' },
  { to: '/doctor/queue', label: 'My Queue', icon: Users, key: 'queue' },
  { to: '/doctor/attendance', label: 'Attendance', icon: Clock3, key: 'attendance' },
  { to: '/doctor/calendar', label: 'Clinic Calendar', icon: CalendarDays, key: 'calendar' },
  { to: '/doctor/notifications', label: 'Notifications', icon: Bell, key: 'notifications' },
  { to: '/doctor/profile', label: 'Profile', icon: User, key: 'profile' },
];

export default function DoctorLayout() {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(localStorage.getItem('clinicTheme') === 'dark');
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { settings } = useAdminSettings();
  const [unreadCount, setUnreadCount] = useState(0);
  const visibleLinks = links.filter((item) => settings.features.doctorMenuItems[item.key] !== false);
  const logoUrl = resolveLogoUrl(settings.branding.logoPath);

  const fetchUnread = async () => {
    try {
      const res = await notifApi.getUnreadCount();
      setUnreadCount(res.count !== undefined ? res.count : (res.unread_count || 0));
    } catch (e) {}
  };

  useEffect(() => {
    fetchUnread();
    const timer = setInterval(fetchUnread, 15000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('clinicTheme', dark ? 'dark' : 'light');
  }, [dark]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const displayName = user ? `Dr. ${user.first_name || ''} ${user.last_name || ''}`.trim() : 'Dr. Unknown';
  const initials = user ? `${(user.first_name || 'D')[0]}${(user.last_name || '')[0] || ''}` : 'DR';

  const sidebarBg = dark ? settings.theme.sidebarColor : "#ffffff";
  const sidebarTextClass = dark ? "text-white" : "text-slate-800";
  const borderClass = dark ? "border-white/10" : "border-slate-100";
  const secTextClass = dark ? "text-white/70" : "text-slate-500";
  const badgeTextClass = dark ? "text-white/40" : "text-slate-400";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-950 dark:text-slate-100 transition-colors duration-300">
      {/* Mobile Trigger */}
      <button onClick={() => setOpen(true)} className="lg:hidden fixed top-4 left-4 z-40 rounded-xl bg-teal-600 p-3 text-white shadow-lg shadow-teal-600/30">
        <Menu size={20} />
      </button>

      {/* Mobile Overlay */}
      {open && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 z-50 h-[100dvh] border-r transition-all duration-300 transform 
        ${collapsed ? "lg:w-20" : "lg:w-72"} 
        ${open ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0"} 
        ${borderClass} ${sidebarTextClass} flex flex-col shadow-2xl lg:shadow-none`}
        style={{ backgroundColor: sidebarBg }}>
        
        {/* Header */}
        <div className={`flex items-center border-b p-5 shrink-0 ${borderClass} ${collapsed && !open ? "lg:justify-center justify-between" : "justify-between"}`}>
          <div className={`flex items-center gap-3 overflow-hidden ${collapsed && !open ? "lg:hidden" : ""}`}>
            <Logo src={logoUrl} />
            <div>
              <h1 className="text-xl font-black leading-none tracking-tighter font-comfortaa font-fat">{settings.branding.clinicName}</h1>
              <p className={`text-[9px] uppercase font-bold tracking-widest mt-1 font-poppins ${secTextClass}`}>Doctor Portal</p>
            </div>
          </div>
          <div className="hidden lg:block">
            <button onClick={() => setCollapsed(!collapsed)} className={`rounded-lg p-2 transition-colors ${
              dark ? "bg-white/10 hover:bg-white/20 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}>
              {collapsed ? <ChevronRight size={18}/> : <ChevronLeft size={18}/>}
            </button>
          </div>
          <button className={`lg:hidden p-2 rounded-lg transition-colors ${
            dark ? "bg-white/10 hover:bg-white/20 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
          }`} onClick={() => setOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 px-4 space-y-0.5 overflow-y-auto scrollbar-hide">
           <p className={`px-4 text-[10px] font-bold uppercase tracking-widest my-4 ${(collapsed && !open) ? "lg:hidden" : ""} ${badgeTextClass}`}>Clinical Tools</p>
           {visibleLinks.map((item) => {
            const Icon = item.icon;
            const isNotifications = item.label === 'Notifications';
            return (
              <NavLink 
                key={item.to} 
                to={item.to} 
                end={item.end} 
                onClick={() => setOpen(false)} 
                title={item.label}
                className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
                  isActive 
                    ? (dark ? 'bg-white text-teal-700 dark:text-slate-900 font-bold shadow-lg' : 'bg-slate-100 text-slate-900 font-bold shadow-sm') 
                    : (dark ? 'hover:bg-white/10 text-white/80' : 'hover:bg-slate-100 text-slate-600')
                } ${collapsed && !open ? "lg:justify-center px-2" : ""}`}>
                <div className="relative shrink-0">
                  <Icon size={20} className="shrink-0" />
                  {isNotifications && unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[8px] font-black text-white border border-white dark:border-slate-900 animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </div>
                {!collapsed || open ? (
                  <span className="truncate flex items-center justify-between w-full">
                    <span>{item.label}</span>
                    {isNotifications && unreadCount > 0 && (
                      <span className={`ml-2 text-[9px] font-black px-2 py-0.5 rounded-full shrink-0 uppercase tracking-wider ${
                        dark ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                      }`}>
                        {unreadCount} new
                      </span>
                    )}
                  </span>
                ) : null}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className={`mt-auto shrink-0 border-t ${borderClass}`}>
          <div className="p-3 space-y-1">
            <button onClick={() => setDark(!dark)} className={`w-full flex items-center gap-4 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              dark ? "hover:bg-white/10 text-white" : "hover:bg-slate-100 text-slate-700"
            } ${collapsed && !open ? "lg:justify-center" : ""}`}>
              {dark ? <Sun size={18} className="text-amber-300"/> : <Moon size={18}/>} 
              {!collapsed || open ? <span>{dark ? "Light Mode" : "Dark Mode"}</span> : null}
            </button>
            <button onClick={handleLogout} className={`w-full flex items-center gap-4 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              dark ? "text-red-100 hover:bg-red-500/80" : "text-red-600 hover:bg-red-50"
            } ${collapsed && !open ? "lg:justify-center" : ""}`}>
              <LogOut size={18} /> 
              {!collapsed || open ? <span>Logout</span> : null}
            </button>
          </div>

          {/* User Footer */}
          <div className={`p-4 flex items-center gap-3 border-t ${
            dark ? "border-white/5 bg-black/10 text-white" : "border-slate-100 bg-slate-50 text-slate-800"
          } ${collapsed && !open ? "lg:justify-center" : ""}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 shadow-sm overflow-hidden font-bold ${
              dark ? "border-white/20 bg-white/20" : "border-slate-200 bg-slate-100 text-slate-700"
            }`}>
              {user?.profile_picture ? (
                <img src={`${import.meta.env.VITE_BACKEND_URL}/storage/${user.profile_picture}`} className="h-full w-full object-cover" />
              ) : initials}
            </div>
            {!collapsed || open ? (
              <div className="min-w-0">
                <p className="text-xs font-bold truncate leading-tight">{displayName}</p>
                <p className={`text-[10px] truncate leading-tight ${dark ? "text-white/60" : "text-slate-500"}`}>Medical Practitioner</p>
              </div>
            ) : null}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${collapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
        <main className="p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
