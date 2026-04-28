import { FaCalendarAlt, FaBell, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../state/auth";

const appts = [
  {
    id: 1,
    doctor: "Dr. Sarah Johnson",
    service: "General Checkup",
    date: "February 15, 2026",
    time: "09:00 AM",
    status: "Confirmed",
    queue: "A-042",
  },
  {
    id: 2,
    doctor: "Dr. Michael Chen",
    service: "Braces Consultation",
    date: "February 20, 2026",
    time: "02:00 PM",
    status: "Pending",
    queue: null,
  },
];

const notes = [
  { id: 1, text: "Appointment confirmed for February 15, 2026", sub: "2 hours ago", color: "bg-primary" },
  { id: 2, text: "Payment pending for appointment on February 20, 2026", sub: "1 day ago", color: "bg-yellow-400" },
];

function StatusBadge({ status }) {
  if (status === "Confirmed")
    return <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">Confirmed</span>;
  return <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 font-medium">Pending</span>;
}

export default function PatientDashboard() {
  const nav = useNavigate();
  const { user } = useAuth();

  return (
    <div className="bg-neutralbg min-h-[calc(100vh-72px)]">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold text-gray-900">Welcome back!</h1>
        <div className="text-sm text-gray-600 mt-1">{user?.email}</div>

        {/* Top cards */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => nav("/patient/book")}
            className="bg-primary text-white rounded-2xl shadow-md p-6 text-left hover:opacity-95"
          >
            <FaCalendarAlt className="text-xl" />
            <div className="mt-3 font-semibold">Book New Appointment</div>
            <div className="text-sm opacity-90">Schedule your next visit</div>
          </button>

          <div className="bg-white rounded-2xl shadow-sm border p-6 flex items-start justify-between">
            <div>
              <FaCalendarAlt className="text-primary text-xl" />
              <div className="mt-3 font-semibold text-gray-900">My Appointments</div>
              <div className="text-sm text-gray-600">Total scheduled</div>
            </div>
            <div className="text-2xl font-semibold text-gray-900">{appts.length}</div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border p-6 flex items-start justify-between">
            <div>
              <FaBell className="text-primary text-xl" />
              <div className="mt-3 font-semibold text-gray-900">Notifications</div>
              <div className="text-sm text-gray-600">Unread messages</div>
            </div>
            <div className="text-2xl font-semibold text-gray-900">2</div>
          </div>
        </div>

        {/* Appointments */}
        <h2 className="mt-10 text-lg font-semibold text-gray-900">My Appointments</h2>
        <div className="mt-4 space-y-4">
          {appts.map((a) => (
            <div key={a.id} className="bg-white rounded-2xl shadow-sm border p-5 flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <FaUserCircle className="text-xl" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <div className="font-semibold text-gray-900">{a.doctor}</div>
                    <StatusBadge status={a.status} />
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{a.service}</div>
                  <div className="text-sm text-gray-500 mt-2">
                    {a.date} • {a.time}
                  </div>
                  {a.queue && <div className="text-sm text-gray-500 mt-1">Queue Number: <span className="font-semibold text-gray-700">{a.queue}</span></div>}
                </div>
              </div>

              <button className="text-sm px-4 py-2 rounded-md border border-primary text-primary hover:bg-primary/5">
                View Details
              </button>
            </div>
          ))}
        </div>

        {/* Notifications */}
        <h2 className="mt-10 text-lg font-semibold text-gray-900">Recent Notifications</h2>
        <div className="mt-4 bg-white rounded-2xl shadow-sm border overflow-hidden">
          {notes.map((n) => (
            <div key={n.id} className="flex items-start gap-3 px-5 py-4 border-b last:border-b-0">
              <span className={`w-2 h-2 rounded-full mt-2 ${n.color}`} />
              <div>
                <div className="text-sm text-gray-900">{n.text}</div>
                <div className="text-xs text-gray-500 mt-1">{n.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
