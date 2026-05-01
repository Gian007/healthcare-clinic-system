import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../state/auth";
import { staffUser } from "../../data/staffData";

const links = [
  ["Dashboard", "/staff"],
  ["Queue Management", "/staff/queue"],
  ["Scan Patient", "/staff/scan"],
  ["Appointments", "/staff/appointments"],
  ["Walk-in Registration", "/staff/walk-in"],
  ["Patients", "/staff/patients"],
  ["Hospital Schedule", "/staff/schedule"],
  ["Notifications", "/staff/notifications"],
];

export default function StaffLayout() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState(false);
  const [dark, setDark] = useState(false);

  const { logout } = useAuth();
  const nav = useNavigate();

  function handleLogout() {
    logout();
    nav("/");
  }

  const theme = {
    page: dark ? "bg-gray-950 text-white" : "bg-[#eefafa] text-gray-900",
    panel: dark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200",
    hover: dark ? "hover:bg-gray-800" : "hover:bg-gray-100",
    navText: dark
      ? "text-gray-300 hover:bg-gray-800"
      : "text-gray-600 hover:bg-teal-50 hover:text-teal-700",
    profile: dark ? "bg-gray-800" : "bg-teal-50",
    menuBtn: dark ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-700",
  };

  return (
    <div className={`min-h-screen ${theme.page}`}>
      {open && (
        <button
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-64 border-r transition ${theme.panel} ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex items-center justify-between px-5 py-4">
          <Link to="/staff" className="flex items-center gap-2 font-semibold">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-teal-600 text-white">
              +
            </div>
            <span>HealthCare Clinic</span>
          </Link>

          <button onClick={() => setOpen(false)} className="lg:hidden">
            ✕
          </button>
        </div>

        <nav className="space-y-1 px-3">
          {links.map(([name, path]) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/staff"}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block rounded-lg px-4 py-2.5 text-sm transition ${
                  isActive ? "bg-teal-600 text-white" : theme.navText
                }`
              }
            >
              {name}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-4 left-3 right-3">
          <div
            className={`flex items-center justify-between rounded-xl p-3 ${theme.profile}`}
          >
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-teal-600 text-white">
                JS
              </div>
              <div>
                <p className="text-sm font-semibold">{staffUser.name}</p>
                <p className="text-xs text-gray-500">{staffUser.role}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Logout"
              className="text-gray-400 hover:text-red-500"
            >
              ⎋
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header
          className={`sticky top-0 z-30 flex h-16 items-center justify-between border-b px-4 ${theme.panel}`}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className={`rounded-lg border px-3 py-2 lg:hidden ${theme.panel}`}
            >
              ☰
            </button>

            <div>
              <h1 className="font-semibold">Staff Panel</h1>
              <p className="hidden text-xs text-gray-500 sm:block">
                Wednesday, April 29, 2026
              </p>
            </div>
          </div>

          <div className="relative flex items-center gap-3">
            <NavLink
              to="/staff/notifications"
              className={`relative rounded-full p-2 ${theme.hover}`}
            >
              🔔
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
            </NavLink>

            <button
              onClick={() => setSettings(!settings)}
              className={`rounded-full p-2 ${theme.hover}`}
            >
              ⚙️
            </button>

            {settings && (
              <div
                className={`absolute right-0 top-12 w-56 rounded-xl border p-2 shadow-xl ${theme.panel}`}
              >
                <button className={`w-full rounded-lg px-3 py-2 text-left text-sm ${theme.hover}`}>
                  View Profile
                </button>

                <button className={`w-full rounded-lg px-3 py-2 text-left text-sm ${theme.hover}`}>
                  Account Info
                </button>

                <div className="my-2 border-t border-gray-200" />

                <p className="px-3 text-xs text-gray-500">Theme</p>

                <div className="mt-2 grid grid-cols-2 gap-2 px-2">
                  <button
                    onClick={() => setDark(false)}
                    className={`rounded-lg px-3 py-2 text-xs ${
                      !dark ? "bg-teal-600 text-white" : theme.menuBtn
                    }`}
                  >
                    Light
                  </button>

                  <button
                    onClick={() => setDark(true)}
                    className={`rounded-lg px-3 py-2 text-xs ${
                      dark ? "bg-teal-600 text-white" : theme.menuBtn
                    }`}
                  >
                    Dark
                  </button>
                </div>

                <div className="my-2 border-t border-gray-200" />

                <button
                  onClick={handleLogout}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-500 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet context={{ dark }} />
        </main>
      </div>
    </div>
  );
}