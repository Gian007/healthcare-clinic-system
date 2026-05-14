import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../state/auth";
import {
  Menu, X, Moon, Sun, LayoutDashboard, Stethoscope, CalendarDays,
  BriefcaseMedical, Users, UserRound, Bell, BarChart3, Settings,
  ChevronLeft, ChevronRight, LogOut, HeartPulse
} from "lucide-react";
import Logo from "../Logo";

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/doctors", label: "Doctors", icon: Stethoscope },
  { to: "/admin/schedules", label: "Schedules", icon: CalendarDays },
  { to: "/admin/services", label: "Services", icon: BriefcaseMedical },
  { to: "/admin/staff", label: "Staff Management", icon: Users },
  { to: "/admin/patients", label: "Patient Accounts", icon: UserRound },
  { to: "/admin/notifications", label: "Notifications", icon: Bell },
  { to: "/admin/reports", label: "Reports", icon: BarChart3 },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem("clinicTheme") === "dark");

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("clinicTheme", dark ? "dark" : "light");
  }, [dark]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const initials = user ? `${(user.first_name || "A")[0]}${(user.last_name || "")[0] || ""}` : "A";

  return (
    <div className="min-h-screen bg-[#f4fbfa] dark:bg-slate-950 transition-colors">
      {/* Mobile Trigger */}
      <button onClick={() => setMobileOpen(true)} className="md:hidden fixed top-4 left-4 z-40 rounded-xl bg-teal-600 p-3 text-white shadow-lg"><Menu size={20}/></button>
      
      {/* Overlay */}
      {mobileOpen && <button onClick={() => setMobileOpen(false)} className="fixed inset-0 z-40 bg-black/40 md:hidden backdrop-blur-sm" />}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 z-50 h-[100dvh] transition-all duration-300 transform 
        ${collapsed ? "md:w-20" : "md:w-72"} 
        ${mobileOpen ? "translate-x-0 w-72" : "-translate-x-full md:translate-x-0"} 
        bg-teal-600 dark:bg-slate-900 text-white flex flex-col shadow-2xl lg:shadow-none`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0">
          <div className={`flex items-center gap-3 overflow-hidden ${(collapsed && !mobileOpen) ? "md:hidden" : ""}`}>
            <Logo />
            <div>
              <h1 className="text-xl font-black leading-none tracking-tighter font-comfortaa font-fat">SHQMS</h1>
              <p className="text-[9px] text-white/70 uppercase font-bold tracking-widest mt-1 font-poppins">Admin Portal</p>
            </div>
          </div>
          <div className="hidden md:block">
            <button onClick={() => setCollapsed(!collapsed)} className="rounded-lg bg-white/10 p-2 hover:bg-white/20 transition-colors">
              {collapsed ? <ChevronRight size={18}/> : <ChevronLeft size={18}/>}
            </button>
          </div>
          <button onClick={() => setMobileOpen(false)} className="md:hidden rounded-lg bg-white/10 p-2 hover:bg-white/20 transition-colors"><X size={18}/></button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 px-4 space-y-0.5 overflow-y-auto scrollbar-hide">
          <p className={`px-4 text-[10px] font-bold text-white/40 uppercase tracking-widest my-4 ${(collapsed && !mobileOpen) ? "md:hidden" : ""}`}>Management</p>
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink 
                key={item.to} 
                to={item.to} 
                end={item.end} 
                onClick={() => setMobileOpen(false)} 
                title={item.label} 
                className={({ isActive }) => `flex items-center gap-4 rounded-xl px-4 py-3 text-sm transition-all duration-200 ${
                  isActive ? "bg-white text-teal-700 dark:text-slate-900 font-bold shadow-lg" : "hover:bg-white/10"
                } ${(collapsed && !mobileOpen) ? "md:justify-center px-2" : ""}`}
              >
                <Icon size={20} className="shrink-0" />
                <span className={`${(collapsed && !mobileOpen) ? "md:hidden" : ""} truncate`}>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="mt-auto shrink-0 border-t border-white/10">
          <div className="p-3 space-y-1">
            <button onClick={() => setDark(!dark)} className={`w-full flex items-center gap-4 rounded-xl px-4 py-2.5 text-xs font-bold hover:bg-white/10 transition-all ${(collapsed && !mobileOpen) ? "md:justify-center" : ""}`}>
              {dark ? <Sun size={18} className="text-amber-300"/> : <Moon size={18}/>} 
              <span className={`${(collapsed && !mobileOpen) ? "md:hidden" : ""}`}>{dark ? "Light Mode" : "Dark Mode"}</span>
            </button>
            <button onClick={handleLogout} className={`w-full flex items-center gap-4 rounded-xl px-4 py-2.5 text-xs font-bold text-red-100 hover:bg-red-500/80 transition-all ${(collapsed && !mobileOpen) ? "md:justify-center" : ""}`}>
              <LogOut size={18}/> 
              <span className={`${(collapsed && !mobileOpen) ? "md:hidden" : ""}`}>Logout</span>
            </button>
          </div>

          {/* User Footer */}
          <div className={`p-4 bg-black/10 flex items-center gap-3 border-t border-white/5 ${(collapsed && !mobileOpen) ? "md:justify-center" : ""}`}>
            <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm shrink-0 border-2 border-white/20 shadow-sm overflow-hidden">
              {user?.profile_picture ? (
                <img 
                  src={`${import.meta.env.VITE_BACKEND_URL}/storage/${user.profile_picture}`} 
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div className={`${(collapsed && !mobileOpen) ? "md:hidden" : ""} min-w-0`}>
              <p className="text-xs font-bold truncate leading-tight">{user?.first_name} {user?.last_name}</p>
              <p className="text-[10px] text-white/60 truncate leading-tight">Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`min-h-screen p-4 sm:p-6 lg:p-8 pt-20 md:pt-8 transition-all duration-300 ${collapsed ? "md:ml-20" : "md:ml-72"}`}>
        <Outlet />
      </main>
    </div>
  );
}
