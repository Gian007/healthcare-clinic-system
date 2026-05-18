import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../state/auth";
import { useAdminSettings } from "../../state/adminSettings";
import { resolveLogoUrl } from "../../config/adminSettings";
import {
  Menu, X, Moon, Sun, LayoutDashboard, Stethoscope, CalendarDays,
  BriefcaseMedical, Users, UserRound, Bell, BarChart3, Settings,
  ChevronLeft, ChevronRight, LogOut, HeartPulse, Hospital
} from "lucide-react";
import Logo from "../Logo";

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/queue", label: "Live Queue", icon: HeartPulse, key: "queue" },
  { to: "/admin/doctors", label: "Doctors", icon: Stethoscope, key: "doctors" },
  { to: "/admin/schedules", label: "Schedules", icon: CalendarDays, key: "schedules" },
  { to: "/admin/rooms", label: "Room Directory", icon: Hospital, key: "rooms" },
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

  // Dynamic color calculations based on theme mode
  const sidebarBg = dark ? settings.theme.sidebarColor : "#ffffff";
  const sidebarTextClass = dark ? "text-white" : "text-slate-800";
  const borderClass = dark ? "border-white/10" : "border-slate-100";
  const secTextClass = dark ? "text-white/70" : "text-slate-500";
  const badgeTextClass = dark ? "text-white/40" : "text-slate-400";

  return (
    <div className="admin-portal min-h-screen bg-[#f4fbfa] transition-colors dark:bg-slate-950">
      <button onClick={() => setMobileOpen(true)} className="fixed left-4 top-4 z-40 rounded-xl bg-primary p-3 text-white shadow-lg md:hidden">
        <Menu size={20} />
      </button>

      {mobileOpen && <button onClick={() => setMobileOpen(false)} className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden" />}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-[100dvh] flex-col shadow-2xl transition-all duration-300 lg:shadow-none
          ${collapsed ? "md:w-20" : "md:w-72"}
          ${mobileOpen ? "w-72 translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${sidebarTextClass}`}
        style={{ backgroundColor: sidebarBg }}
      >
        <div className={`flex shrink-0 items-center justify-between border-b p-5 ${borderClass}`}>
          <div className={`flex items-center gap-3 overflow-hidden ${(collapsed && !mobileOpen) ? "md:hidden" : ""}`}>
            <Logo src={logoUrl} />
            <div className="min-w-0">
              <h1 className="truncate text-xl font-black leading-none tracking-tighter font-comfortaa font-fat">
                {settings.branding.clinicName}
              </h1>
              <p className={`mt-1 truncate text-[9px] font-bold uppercase tracking-widest font-poppins ${secTextClass}`}>
                {settings.branding.tagline}
              </p>
            </div>
          </div>

          <div className="hidden md:block">
            <button onClick={() => setCollapsed(!collapsed)} className={`rounded-lg p-2 transition-colors ${
              dark ? "bg-white/10 hover:bg-white/20 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}>
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>
          <button onClick={() => setMobileOpen(false)} className={`rounded-lg p-2 transition-colors md:hidden ${
            dark ? "bg-white/10 hover:bg-white/20 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
          }`}>
            <X size={18} />
          </button>
        </div>

        <nav className="scrollbar-hide flex-1 space-y-0.5 overflow-y-auto p-3 px-4">
          <p className={`my-4 px-4 text-[10px] font-bold uppercase tracking-widest ${(collapsed && !mobileOpen) ? "md:hidden" : ""} ${badgeTextClass}`}>
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
                  isActive 
                    ? (dark ? "bg-white font-bold shadow-lg text-slate-900" : "bg-slate-100 font-bold shadow-sm")
                    : (dark ? "hover:bg-white/10 text-white/80" : "hover:bg-slate-100 text-slate-600")
                } ${(collapsed && !mobileOpen) ? "md:justify-center md:px-2" : ""}`}
              >
                <Icon size={20} className="shrink-0" />
                <span className={`${(collapsed && !mobileOpen) ? "md:hidden" : ""} truncate`}>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className={`mt-auto shrink-0 border-t ${borderClass}`}>
          <div className="space-y-1 p-3">
            <button onClick={() => setDark(!dark)} className={`flex w-full items-center gap-4 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              dark ? "hover:bg-white/10 text-white" : "hover:bg-slate-100 text-slate-700"
            } ${(collapsed && !mobileOpen) ? "md:justify-center" : ""}`}>
              {dark ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} />}
              <span className={`${(collapsed && !mobileOpen) ? "md:hidden" : ""}`}>{dark ? "Light Mode" : "Dark Mode"}</span>
            </button>
            <button onClick={handleLogout} className={`flex w-full items-center gap-4 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              dark ? "text-red-100 hover:bg-red-500/80" : "text-red-600 hover:bg-red-50"
            } ${(collapsed && !mobileOpen) ? "md:justify-center" : ""}`}>
              <LogOut size={18} />
              <span className={`${(collapsed && !mobileOpen) ? "md:hidden" : ""}`}>Logout</span>
            </button>
          </div>

          <div className={`flex items-center gap-3 border-t p-4 ${
            dark ? "border-white/5 bg-black/10 text-white" : "border-slate-100 bg-slate-50 text-slate-800"
          } ${(collapsed && !mobileOpen) ? "md:justify-center" : ""}`}>
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 text-sm font-bold shadow-sm ${
              dark ? "border-white/20 bg-white/20" : "border-slate-200 bg-slate-100 text-slate-700"
            }`}>
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
              <p className={`truncate text-[10px] leading-tight ${dark ? "text-white/60" : "text-slate-500"}`}>Administrator</p>
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
