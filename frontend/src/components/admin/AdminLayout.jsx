import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../state/auth";
import { useAdminSettings } from "../../state/adminSettings";
import { resolveLogoUrl } from "../../config/adminSettings";
import {
  Menu, X, Moon, Sun, LayoutDashboard, Stethoscope, CalendarDays,
  BriefcaseMedical, Users, UserRound, Bell, BarChart3, Settings,
  ChevronLeft, ChevronRight, LogOut, HeartPulse
} from "lucide-react";
import Logo from "../Logo";

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/queue", label: "Live Queue", icon: HeartPulse, key: "queue" },
  { to: "/admin/doctors", label: "Doctors", icon: Stethoscope, key: "doctors" },
  { to: "/admin/schedules", label: "Schedules", icon: CalendarDays, key: "schedules" },
  { to: "/admin/services", label: "Services", icon: BriefcaseMedical, key: "services" },
  { to: "/admin/staff", label: "Staff Management", icon: Users, key: "staff" },
  { to: "/admin/patients", label: "Patient Accounts", icon: UserRound, key: "patients" },
  { to: "/admin/calendar", label: "Clinic Calendar", icon: CalendarDays, key: "calendar" },
  { to: "/admin/notifications", label: "Notifications", icon: Bell, key: "notifications" },
  { to: "/admin/reports", label: "Reports", icon: BarChart3, key: "reports" },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem("clinicTheme") === "dark");

  const { user, logout } = useAuth();
  const { settings } = useAdminSettings();
  const navigate = useNavigate();

  const visibleLinks = links.filter((item) => !item.key || settings.features.menuItems[item.key] !== false);
  const logoUrl = resolveLogoUrl(settings.branding.logoPath);

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
    <div className="admin-portal min-h-screen bg-[#f4fbfa] transition-colors dark:bg-slate-950">
      <button onClick={() => setMobileOpen(true)} className="fixed left-4 top-4 z-40 rounded-xl bg-primary p-3 text-white shadow-lg md:hidden">
        <Menu size={20} />
      </button>

      {mobileOpen && <button onClick={() => setMobileOpen(false)} className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden" />}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-[100dvh] flex-col text-white shadow-2xl transition-all duration-300 lg:shadow-none
          ${collapsed ? "md:w-20" : "md:w-72"}
          ${mobileOpen ? "w-72 translate-x-0" : "-translate-x-full md:translate-x-0"}`}
        style={{ backgroundColor: settings.theme.sidebarColor }}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 p-5">
          <div className={`flex items-center gap-3 overflow-hidden ${(collapsed && !mobileOpen) ? "md:hidden" : ""}`}>
            <Logo src={logoUrl} />
            <div className="min-w-0">
              <h1 className="truncate text-xl font-black leading-none tracking-tighter font-comfortaa font-fat">
                {settings.branding.clinicName}
              </h1>
              <p className="mt-1 truncate text-[9px] font-bold uppercase tracking-widest text-white/70 font-poppins">
                {settings.branding.tagline}
              </p>
            </div>
          </div>

          <div className="hidden md:block">
            <button onClick={() => setCollapsed(!collapsed)} className="rounded-lg bg-white/10 p-2 transition-colors hover:bg-white/20">
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>
          <button onClick={() => setMobileOpen(false)} className="rounded-lg bg-white/10 p-2 transition-colors hover:bg-white/20 md:hidden">
            <X size={18} />
          </button>
        </div>

        <nav className="scrollbar-hide flex-1 space-y-0.5 overflow-y-auto p-3 px-4">
          <p className={`my-4 px-4 text-[10px] font-bold uppercase tracking-widest text-white/40 ${(collapsed && !mobileOpen) ? "md:hidden" : ""}`}>
            Management
          </p>

          {visibleLinks.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileOpen(false)}
                title={item.label}
                style={({ isActive }) => isActive ? { color: settings.theme.accentColor } : undefined}
                className={({ isActive }) => `flex items-center gap-4 rounded-xl px-4 py-3 text-sm transition-all duration-200 ${
                  isActive ? "bg-white font-bold shadow-lg dark:text-slate-900" : "hover:bg-white/10"
                } ${(collapsed && !mobileOpen) ? "md:justify-center md:px-2" : ""}`}
              >
                <Icon size={20} className="shrink-0" />
                <span className={`${(collapsed && !mobileOpen) ? "md:hidden" : ""} truncate`}>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-auto shrink-0 border-t border-white/10">
          <div className="space-y-1 p-3">
            <button onClick={() => setDark(!dark)} className={`flex w-full items-center gap-4 rounded-xl px-4 py-2.5 text-xs font-bold transition-all hover:bg-white/10 ${(collapsed && !mobileOpen) ? "md:justify-center" : ""}`}>
              {dark ? <Sun size={18} className="text-amber-300" /> : <Moon size={18} />}
              <span className={`${(collapsed && !mobileOpen) ? "md:hidden" : ""}`}>{dark ? "Light Mode" : "Dark Mode"}</span>
            </button>
            <button onClick={handleLogout} className={`flex w-full items-center gap-4 rounded-xl px-4 py-2.5 text-xs font-bold text-red-100 transition-all hover:bg-red-500/80 ${(collapsed && !mobileOpen) ? "md:justify-center" : ""}`}>
              <LogOut size={18} />
              <span className={`${(collapsed && !mobileOpen) ? "md:hidden" : ""}`}>Logout</span>
            </button>
          </div>

          <div className={`flex items-center gap-3 border-t border-white/5 bg-black/10 p-4 ${(collapsed && !mobileOpen) ? "md:justify-center" : ""}`}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white/20 bg-white/20 text-sm font-bold shadow-sm">
              {user?.profile_picture ? (
                <img
                  src={`${import.meta.env.VITE_BACKEND_URL}/storage/${user.profile_picture}`}
                  alt="Admin"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div className={`${(collapsed && !mobileOpen) ? "md:hidden" : ""} min-w-0`}>
              <p className="truncate text-xs font-bold leading-tight">{user?.first_name} {user?.last_name}</p>
              <p className="truncate text-[10px] leading-tight text-white/60">Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      <main className={`min-h-screen p-4 pt-20 transition-all duration-300 sm:p-6 md:pt-8 lg:p-8 ${collapsed ? "md:ml-20" : "md:ml-72"}`}>
        <Outlet />
      </main>
    </div>
  );
}
