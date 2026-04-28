import { Link, NavLink, useNavigate } from "react-router-dom";
import { FaHeartbeat } from "react-icons/fa";
import { FiLogIn, FiLogOut } from "react-icons/fi";
import { useAuth } from "../state/auth";

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const linkClass = "text-sm text-gray-700 hover:text-gray-900 transition";
  const activeClass = "text-sm text-gray-900 font-semibold";

  const goDashboard = () => {
    if (!user) return nav("/login");
    if (user.role === "patient") return nav("/patient");
    if (user.role === "admin") return nav("/admin");
    if (user.role === "doctor") return nav("/doctor");
    if (user.role === "staff") return nav("/staff");
    return nav("/");
  };

  return (
    <header className="bg-white border-b">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
            <FaHeartbeat className="text-primary text-lg" />
          </div>
          <span className="font-semibold text-gray-900">HealthCare Clinic</span>
        </Link>

        {/* Public nav */}
        <nav className="flex items-center gap-6">
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
      </div>
    </header>
  );
}
