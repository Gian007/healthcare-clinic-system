import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, CalendarX2, ClipboardList, Users, QrCode, Clock3, User, Menu, X, Moon, Sun, LogOut, Stethoscope } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../../state/auth';

const links = [
  { to: '/doctor', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/doctor/schedule', label: 'My Schedule', icon: CalendarDays },
  { to: '/doctor/dayoff', label: 'Day Off Request', icon: CalendarX2 },
  { to: '/doctor/appointments', label: 'Appointments', icon: ClipboardList },
  { to: '/doctor/queue', label: 'My Queue', icon: Users },
  { to: '/doctor/qr', label: 'Doctor QR Code', icon: QrCode },
  { to: '/doctor/attendance', label: 'Attendance', icon: Clock3 },
  { to: '/doctor/profile', label: 'Profile', icon: User },
];

export default function DoctorLayout() {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(localStorage.getItem('clinicTheme') === 'dark');
  const navigate = useNavigate();
  const { user, logout } = useAuth();

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
    <div className="min-h-screen bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-slate-100 transition-colors">
      <button onClick={() => setOpen(true)} className="lg:hidden fixed top-4 left-4 z-50 rounded-xl bg-teal-600 dark:bg-slate-800 p-3 text-white shadow-lg"><Menu size={20}/></button>
      {open && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setOpen(false)} />}

      <aside className={`fixed left-0 top-0 z-50 h-screen bg-teal-600 dark:bg-slate-900 text-white border-r border-white/10 transition-all duration-300 ${collapsed ? 'lg:w-20' : 'lg:w-72'} w-72 ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col`}>
        <div className={`h-20 px-5 flex items-center border-b border-white/10 ${collapsed ? "lg:justify-center justify-between" : "justify-between"}`}>
          <div className={`flex items-center gap-3 overflow-hidden ${collapsed ? "lg:hidden" : ""}`}>
            <div className="w-10 h-10 rounded-xl bg-white/15 grid place-items-center shrink-0"><Stethoscope size={20} /></div>
            <div><h1 className="text-lg font-bold">HealthCare</h1><p className="text-xs text-white/75">Doctor Portal</p></div>
          </div>
          <div className="hidden lg:block">
            <button onClick={() => setCollapsed(!collapsed)} className="rounded-lg bg-white/15 p-2 hover:bg-white/25 transition-colors">
              <Menu size={18}/>
            </button>
          </div>
          <button className="lg:hidden" onClick={() => setOpen(false)}><X size={18}/></button>
        </div>

        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} end={item.end} onClick={() => setOpen(false)} title={item.label}
                className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${isActive ? 'bg-white/20 shadow-sm' : 'hover:bg-white/10'} ${collapsed ? "lg:justify-center" : ""}`}>
                <Icon size={19} className="shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-3">
          <button onClick={() => setDark(!dark)} className={`w-full rounded-xl bg-white/20 px-4 py-3 flex items-center gap-3 hover:bg-white/30 transition-colors ${collapsed ? "lg:justify-center" : "justify-center lg:justify-start"}`}>
            {dark ? <Sun size={18}/> : <Moon size={18}/>} {!collapsed && <span>{dark ? "Light Mode" : "Dark Mode"}</span>}
          </button>
          <div className={`flex items-center gap-3 rounded-xl bg-white/10 p-3 ${collapsed ? "lg:justify-center" : ""}`}>
            <div className="w-10 h-10 rounded-full bg-white/20 grid place-items-center shrink-0 font-bold">{initials}</div>
            {!collapsed && <div className="min-w-0"><p className="text-sm font-bold truncate">{displayName}</p><p className="text-xs text-white/75">Doctor</p></div>}
          </div>
          <button onClick={handleLogout} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 hover:bg-red-500/80 text-sm font-medium transition-colors ${collapsed ? "lg:justify-center" : "justify-center lg:justify-start"}`}>
            <LogOut size={18} /> {!collapsed && 'Logout'}
          </button>
        </div>
      </aside>

      <div className={`transition-all duration-300 ${collapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
        <main className="p-4 md:p-7 pt-20 lg:pt-7"><Outlet /></main>
      </div>
    </div>
  );
}
