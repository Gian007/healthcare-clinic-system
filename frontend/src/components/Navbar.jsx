import { Link, NavLink, useNavigate } from "react-router-dom";
import { FaHeartbeat } from "react-icons/fa";
import { FiLogIn, FiLogOut, FiSun, FiMoon, FiMenu, FiX } from "react-icons/fi";
import { useAuth } from "../state/auth";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const [dark, setDark] = useState(() => localStorage.getItem("clinicTheme") === "dark");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("clinicTheme", dark ? "dark" : "light");
  }, [dark]);

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
    <header className="bg-white dark:bg-slate-900 border-b dark:border-slate-800 transition-colors">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
            <FaHeartbeat className="text-primary text-lg" />
          </div>
          <span className="font-semibold text-gray-900 dark:text-white">HealthCare Clinic</span>
        </Link>

        {/* Public nav Desktop */}
        <nav className="hidden md:flex items-center gap-6">
          <button onClick={() => setDark(!dark)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
            {dark ? <FiSun className="text-lg" /> : <FiMoon className="text-lg" />}
          </button>
          <NavLink to="/doctors" className={({ isActive }) => (isActive ? activeClass : linkClass)}>
            Doctors
          </NavLink>
          <NavLink to="/services" className={({ isActive }) => (isActive ? activeClass : linkClass)}>
            Services
          </NavLink>
          <NavLink to="/queue" className={({ isActive }) => (isActive ? activeClass : linkClass)}>
            Queue
          </NavLink>
          <NavLink to="/announcements" className={({ isActive }) => (isActive ? activeClass : linkClass)}>
            Announcements
          </NavLink>

          {!user ? (
            <button
              onClick={() => nav("/login")}
              className="inline-flex items-center gap-2 bg-primary text-white text-sm px-4 py-2 rounded-md shadow-sm hover:opacity-95"
            >
              <FiLogIn />
              Login
            </button>
          ) : (
            <>
              <button onClick={goDashboard} className="text-sm text-gray-700 hover:text-gray-900">
                Dashboard
              </button>
              <button
                onClick={() => {
                  logout();
                  nav("/");
                }}
                className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm px-4 py-2 rounded-md hover:bg-primary/15"
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
        <nav className="md:hidden border-t dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4 flex flex-col gap-4">
          <NavLink to="/doctors" onClick={() => setMenuOpen(false)} className={({ isActive }) => (isActive ? activeClass : linkClass)}>
            Doctors
          </NavLink>
          <NavLink to="/services" onClick={() => setMenuOpen(false)} className={({ isActive }) => (isActive ? activeClass : linkClass)}>
            Services
          </NavLink>
          <NavLink to="/queue" onClick={() => setMenuOpen(false)} className={({ isActive }) => (isActive ? activeClass : linkClass)}>
            Queue
          </NavLink>
          <NavLink to="/announcements" onClick={() => setMenuOpen(false)} className={({ isActive }) => (isActive ? activeClass : linkClass)}>
            Announcements
          </NavLink>

          <hr className="dark:border-slate-800" />

          {!user ? (
            <button
              onClick={() => { setMenuOpen(false); nav("/login"); }}
              className="flex items-center justify-center gap-2 bg-primary text-white text-sm px-4 py-2 rounded-md shadow-sm hover:opacity-95"
            >
              <FiLogIn />
              Login
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <button onClick={() => { setMenuOpen(false); goDashboard(); }} className="text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-left">
                Dashboard
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                  nav("/");
                }}
                className="flex items-center justify-center gap-2 bg-primary/10 text-primary text-sm px-4 py-2 rounded-md hover:bg-primary/15"
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
