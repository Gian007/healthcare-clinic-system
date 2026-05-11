import { useEffect, useState } from "react";
import { FaCalendarAlt, FaBell, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../state/auth";
import * as patientApi from "../../api/patientApi";

function StatusBadge({ status }) {
  if (status === "Confirmed")
    return <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">Confirmed</span>;
  return <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 font-medium">Pending</span>;
}

export default function PatientDashboard() {
  const nav = useNavigate();
  const { user } = useAuth();
  
  const [appts, setAppts] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await patientApi.getDashboardData();
        setAppts(data.appointments || []);
        setNotes(data.notifications || []);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        // Fallback to empty state — that's fine
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-3 text-gray-500 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back, {user?.first_name}! 👋</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{user?.email}</p>

      {/* Top cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => nav("/patient/book")}
          className="bg-primary text-white rounded-2xl shadow-md p-6 text-left hover:opacity-95 transition-opacity active:scale-[0.98]"
        >
          <FaCalendarAlt className="text-xl" />
          <div className="mt-3 font-semibold">Book New Appointment</div>
          <div className="text-sm opacity-90">Schedule your next visit</div>
        </button>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 flex items-start justify-between hover:shadow-md transition-shadow">
          <div>
            <FaCalendarAlt className="text-primary text-xl" />
            <div className="mt-3 font-semibold text-gray-900 dark:text-white">My Appointments</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total scheduled</div>
          </div>
          <div className="text-2xl font-semibold text-gray-900 dark:text-white">{appts.length}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 flex items-start justify-between hover:shadow-md transition-shadow">
          <div>
            <FaBell className="text-primary text-xl" />
            <div className="mt-3 font-semibold text-gray-900 dark:text-white">Notifications</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Unread messages</div>
          </div>
          <div className="text-2xl font-semibold text-gray-900 dark:text-white">{notes.length}</div>
        </div>
      </div>

      {/* Live Queue Tracker */}
      <h2 className="mt-10 text-lg font-semibold text-gray-900 dark:text-white">Live Queue Status</h2>
      <div className="mt-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 flex flex-col sm:flex-row gap-6 justify-between items-center transition-colors">
        <div className="text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">Current Serving</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">#042</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">Next Queue</div>
          <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">#043</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">Your Position</div>
          <div className="text-4xl font-bold text-primary">#045</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">Status</div>
          <span className="inline-block mt-1 text-sm px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 font-medium">Waiting</span>
        </div>
      </div>

      {/* Appointments */}
      <h2 className="mt-10 text-lg font-semibold text-gray-900 dark:text-white">My Appointments</h2>
      <div className="mt-4 space-y-4">
        {appts.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-8 text-center text-gray-500 dark:text-gray-400 transition-colors">
            You have no upcoming appointments.
            <button onClick={() => nav("/patient/book")} className="block mx-auto mt-3 text-primary font-medium hover:underline">
              Book your first appointment →
            </button>
          </div>
        ) : (
          appts.map((a) => (
            <div key={a.appointment_id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-5 flex items-start justify-between gap-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <FaUserCircle className="text-xl" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <div className="font-semibold text-gray-900 dark:text-white">Dr. {a.doctor?.first_name} {a.doctor?.last_name}</div>
                    <StatusBadge status={a.booking_status} />
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{a.service?.service_name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-500 mt-2 font-medium">
                    {new Date(a.appointment_date).toLocaleDateString()} • {a.start_time}
                  </div>
                  {a.queue && <div className="text-sm text-gray-500 mt-1">Queue Number: <span className="font-semibold text-gray-700 dark:text-gray-300">{a.queue}</span></div>}
                </div>
              </div>

              <button className="text-sm px-4 py-2 rounded-md border border-primary text-primary hover:bg-primary hover:text-white transition-colors shrink-0">
                View Details
              </button>
            </div>
          ))
        )}
      </div>

      {/* Notifications */}
      <h2 className="mt-10 text-lg font-semibold text-gray-900 dark:text-white">Recent Notifications</h2>
      <div className="mt-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden transition-colors">
        {notes.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">No notifications yet.</div>
        ) : (
          notes.map((n) => (
            <div key={n.id} className="flex items-start gap-3 px-5 py-4 border-b dark:border-slate-800 last:border-b-0 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
              <span className={`w-2 h-2 rounded-full mt-2 shrink-0 ${n.color || 'bg-primary'}`} />
              <div>
                <div className="text-sm text-gray-900 dark:text-white font-medium">{n.text}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{n.sub}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
