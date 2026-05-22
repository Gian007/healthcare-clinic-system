import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FaThLarge as LayoutDashboard, FaCalendarAlt as CalendarDays, FaCalendarTimes as CalendarX2, FaClipboardList as ClipboardList, FaUsers as Users, FaQrcode as QrCode, FaClock as Clock3, FaUser as User, FaBars as Menu, FaTimes as X, FaMoon as Moon, FaSun as Sun, FaSignOutAlt as LogOut, FaChevronLeft as ChevronLeft, FaChevronRight as ChevronRight, FaBell as Bell } from 'react-icons/fa';
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
  { to: '/doctor/qr', label: 'Doctor QR Code', icon: QrCode, key: 'qrCode' },
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-950 dark:text-slate-100 transition-colors duration-300">
      {/* Mobile Trigger */}
      <button onClick={() => setOpen(true)} className="lg:hidden fixed top-4 left-4 z-40 rounded-xl bg-teal-600 p-3 text-white shadow-lg shadow-teal-600/30">
        <Menu size={20} />
      </button>

      {/* Mobile Overlay */}
      {open && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 z-50 h-[100dvh] transition-all duration-300 transform 
        ${collapsed ? "lg:w-20" : "lg:w-72"} 
        ${open ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0"} 
        bg-teal-600 dark:bg-slate-900 text-white flex flex-col shadow-2xl lg:shadow-none`}
        style={{ backgroundColor: settings.theme.sidebarColor }}>
        
        {/* Header */}
        <div className={`flex items-center border-b border-white/10 p-5 shrink-0 ${collapsed && !open ? "lg:justify-center justify-between" : "justify-between"}`}>
          <div className={`flex items-center gap-3 overflow-hidden ${collapsed && !open ? "lg:hidden" : ""}`}>
            <Logo src={logoUrl} />
            <div>
              <h1 className="text-xl font-black leading-none tracking-tighter font-comfortaa font-fat">{settings.branding.clinicName}</h1>
              <p className="text-[9px] text-white/70 uppercase font-bold tracking-widest mt-1 font-poppins">Doctor Portal</p>
            </div>
          </div>
          <div className="hidden lg:block">
            <button onClick={() => setCollapsed(!collapsed)} className="rounded-lg bg-white/10 p-2 hover:bg-white/20 transition-colors">
              {collapsed ? <ChevronRight size={18}/> : <ChevronLeft size={18}/>}
            </button>
          </div>
          <button className="lg:hidden p-2 bg-white/10 rounded-lg hover:bg-white/20" onClick={() => setOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 px-4 space-y-0.5 overflow-y-auto scrollbar-hide">
           <p className={`px-4 text-[10px] font-bold text-white/40 uppercase tracking-widest my-4 ${collapsed && !open ? "lg:hidden" : ""}`}>Clinical Tools</p>
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
                  isActive ? 'bg-white text-teal-700 dark:text-slate-900 font-bold shadow-lg' : 'hover:bg-white/10'
                } ${collapsed && !open ? "lg:justify-center px-2" : ""}`}>
                <div className="relative shrink-0">
                  <Icon size={20} className="shrink-0" />
                  {isNotifications && unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[8px] font-black text-white border border-teal-600 dark:border-slate-900 animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </div>
                {!collapsed || open ? (
                  <span className="truncate flex items-center justify-between w-full">
                    <span>{item.label}</span>
                    {isNotifications && unreadCount > 0 && (
                      <span className="ml-2 bg-white/20 text-[9px] font-black px-2 py-0.5 rounded-full shrink-0 uppercase tracking-wider">
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
        <div className="mt-auto shrink-0 border-t border-white/10">
          <div className="p-3 space-y-1">
            <button onClick={() => setDark(!dark)} className={`w-full flex items-center gap-4 rounded-xl px-4 py-2.5 text-xs font-bold hover:bg-white/10 transition-all ${collapsed && !open ? "lg:justify-center" : ""}`}>
              {dark ? <Sun size={18} className="text-amber-300"/> : <Moon size={18}/>} 
              {!collapsed || open ? <span>{dark ? "Light Mode" : "Dark Mode"}</span> : null}
            </button>
            <button onClick={handleLogout} className={`w-full flex items-center gap-4 rounded-xl px-4 py-2.5 text-xs font-bold text-red-100 hover:bg-red-500/80 transition-all ${collapsed && !open ? "lg:justify-center" : ""}`}>
              <LogOut size={18} /> 
              {!collapsed || open ? <span>Logout</span> : null}
            </button>
          </div>

          {/* User Footer */}
          <div className={`p-4 bg-black/10 flex items-center gap-3 border-t border-white/5 ${collapsed && !open ? "lg:justify-center" : ""}`}>
            <div className="w-10 h-10 rounded-full bg-white/20 grid place-items-center shrink-0 border-2 border-white/20 shadow-sm overflow-hidden font-bold">
              {user?.profile_picture ? (
                <img src={`${import.meta.env.VITE_BACKEND_URL}/storage/${user.profile_picture}`} className="h-full w-full object-cover" />
              ) : initials}
            </div>
            {!collapsed || open ? (
              <div className="min-w-0">
                <p className="text-xs font-bold truncate leading-tight">{displayName}</p>
                <p className="text-[10px] text-white/60 truncate leading-tight">Medical Practitioner</p>
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
