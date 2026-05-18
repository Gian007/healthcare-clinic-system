import { Link, NavLink, useNavigate } from "react-router-dom";
import Logo from "./Logo";
import { FiLogIn, FiLogOut, FiSun, FiMoon, FiMenu, FiX } from "react-icons/fi";
import { useAuth } from "../state/auth";
import { useAdminSettings } from "../state/adminSettings";
import { resolveLogoUrl } from "../config/adminSettings";
import { useEffect, useState } from "react";

const publicLinks = [
  { to: "/doctors", label: "Doctors", key: "doctors" },
  { to: "/services", label: "Services", key: "services" },
  { to: "/queue", label: "Queue", key: "queue" },
  { to: "/announcements", label: "Announcements", key: "announcements" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { settings } = useAdminSettings();
  const nav = useNavigate();

  const [dark, setDark] = useState(() => localStorage.getItem("clinicTheme") === "dark");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const visiblePublicLinks = publicLinks.filter((item) => settings.features.guestMenuItems[item.key] !== false);
  const logoUrl = resolveLogoUrl(settings.branding.logoPath);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("clinicTheme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const linkClass = "text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition";
  const activeClass = "text-sm text-gray-900 dark:text-white font-semibold";

  const goDashboard = () => {
    if (!user) return nav("/login");
    if (user.role === "patient") return nav("/patient");
    if (user.role === "admin") return nav("/admin");
    if (user.role === "doctor") return nav("/doctor");
    if (user.role === "staff") return nav("/staff");
    return nav("/");
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-300 ${
        scrolled 
          ? "bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 shadow-sm" 
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <Logo src={logoUrl} />
          <span className="font-black text-xl tracking-tighter text-gray-900 dark:text-white uppercase font-comfortaa leading-none font-fat">{settings.branding.clinicName}</span>
        </Link>

        {/* Public nav Desktop */}
        <nav className="hidden md:flex items-center gap-6">
          <button onClick={() => setDark(!dark)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
            {dark ? <FiSun className="text-lg" /> : <FiMoon className="text-lg" />}
          </button>
          {visiblePublicLinks.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? activeClass : linkClass)}>
              {item.label}
            </NavLink>
          ))}

          {!user ? (
            <button
              onClick={() => nav("/login")}
              className="inline-flex items-center gap-2 bg-primary text-white text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-primary/20 hover:opacity-95 transition-all active:scale-95"
            >
              <FiLogIn />
              Login
            </button>
          ) : (
            <>
              <button onClick={goDashboard} className="text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-primary transition-colors">
                Dashboard
              </button>
              <button
                onClick={() => {
                  logout();
                  nav("/");
                }}
                className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm px-5 py-2.5 rounded-xl hover:bg-primary/20 transition-all"
              >
                <FiLogOut />
                Logout
              </button>
            </>
          )}
        </nav>

        {/* Mobile menu toggle */}
        <div className="flex items-center gap-4 md:hidden">
          <button onClick={() => setDark(!dark)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
            {dark ? <FiSun className="text-lg" /> : <FiMoon className="text-lg" />}
          </button>
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-900 dark:text-white text-2xl">
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <nav className="md:hidden border-t dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg px-6 py-6 flex flex-col gap-6 shadow-2xl animate-in slide-in-from-top duration-300">
          {visiblePublicLinks.map((item) => (
            <NavLink key={item.to} to={item.to} onClick={() => setMenuOpen(false)} className={({ isActive }) => (isActive ? activeClass : linkClass)}>
              {item.label}
            </NavLink>
          ))}

          <hr className="dark:border-slate-800" />

          {!user ? (
            <button
              onClick={() => { setMenuOpen(false); nav("/login"); }}
              className="flex items-center justify-center gap-2 bg-primary text-white text-sm px-4 py-3 rounded-xl shadow-lg shadow-primary/20 hover:opacity-95"
            >
              <FiLogIn />
              Login
            </button>
          ) : (
            <div className="flex flex-col gap-4">
              <button onClick={() => { setMenuOpen(false); goDashboard(); }} className="text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-primary transition-colors">
                Dashboard
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                  nav("/");
                }}
                className="flex items-center justify-center gap-2 bg-primary/10 text-primary text-sm px-4 py-3 rounded-xl hover:bg-primary/20 transition-all"
              >
                <FiLogOut />
                Logout
              </button>
            </div>
          )}
        </nav>
      )}
    </header>
  );
}
