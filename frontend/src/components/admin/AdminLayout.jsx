import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../state/auth";
import {
  Menu, X, Moon, Sun, LayoutDashboard, Stethoscope, CalendarDays,
  BriefcaseMedical, Users, UserRound, Bell, BarChart3, Settings,
  ChevronLeft, ChevronRight, LogOut
} from "lucide-react";

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

  return (
    <div className="min-h-screen bg-[#f4fbfa] dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      <button onClick={() => setMobileOpen(true)} className="md:hidden fixed top-4 left-4 z-50 rounded-xl bg-teal-500 p-3 text-white shadow-lg"><Menu size={20}/></button>
      {mobileOpen && <button aria-label="close overlay" onClick={() => setMobileOpen(false)} className="fixed inset-0 z-40 bg-black/40 md:hidden" />}

      <aside className={`${collapsed ? "md:w-20" : "md:w-72"} fixed left-0 top-0 z-50 h-screen w-72 transform bg-teal-500 dark:bg-slate-900 text-white transition-all duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"} flex flex-col`}>
        <div className="flex items-center justify-between p-5 border-b border-white/20">
          <div className={`${collapsed ? "md:hidden" : ""}`}>
            <h1 className="text-xl font-bold leading-tight">HealthCare Clinic</h1>
            <p className="text-xs text-white/80">Admin Panel</p>
          </div>
          <div className="hidden md:block">
            <button onClick={() => setCollapsed(!collapsed)} className="rounded-lg bg-white/15 p-2 hover:bg-white/25 transition-colors">{collapsed ? <ChevronRight size={18}/> : <ChevronLeft size={18}/>}</button>
          </div>
          <button onClick={() => setMobileOpen(false)} className="md:hidden rounded-lg bg-white/15 p-2"><X size={18}/></button>
        </div>

        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} end={item.end} onClick={() => setMobileOpen(false)} title={item.label} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${isActive ? "bg-white/25 font-semibold shadow-sm" : "hover:bg-white/15"} ${collapsed ? "md:justify-center" : ""}`}>
                <Icon size={19} className="shrink-0" />
                <span className={`${collapsed ? "md:hidden" : ""}`}>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/20 space-y-3">
          <button onClick={() => setDark(!dark)} className={`w-full rounded-xl bg-white/20 px-4 py-3 flex items-center gap-3 hover:bg-white/30 transition-colors ${collapsed ? "md:justify-center" : "justify-center md:justify-start"}`}>
            {dark ? <Sun size={18}/> : <Moon size={18}/>} <span className={`${collapsed ? "md:hidden" : ""}`}>{dark ? "Light Mode" : "Dark Mode"}</span>
          </button>
          <div className={`flex items-center gap-3 rounded-xl bg-white/10 p-3 ${collapsed ? "md:justify-center" : ""}`}>
            <div className="grid h-10 w-10 place-items-center rounded-full bg-white/25 font-bold shrink-0">
              {user?.first_name?.[0] || "A"}
            </div>
            <div className={`${collapsed ? "md:hidden" : ""} min-w-0`}>
              <p className="text-sm font-semibold truncate">{user?.first_name || "Admin"} {user?.last_name || "User"}</p>
              <p className="text-xs text-white/80">System Administrator</p>
            </div>
          </div>
          <button onClick={handleLogout} className={`w-full rounded-xl bg-white/10 hover:bg-red-500/80 px-4 py-3 flex items-center gap-3 transition-colors ${collapsed ? "md:justify-center" : "justify-center md:justify-start"}`}>
            <LogOut size={18}/> <span className={`${collapsed ? "md:hidden" : ""}`}>Logout</span>
          </button>
        </div>
      </aside>

      <main className={`min-h-screen p-5 pt-20 md:pt-8 transition-all duration-300 ${collapsed ? "md:ml-20" : "md:ml-72"}`}>
        <Outlet />
      </main>
    </div>
  );
}
