import { useEffect, useState } from "react";
import { FaCalendarAlt, FaBell, FaUserCircle, FaArrowRight, FaClipboardList } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../state/auth";
import * as patientApi from "../../api/patientApi";

const STATUS_COLORS = {
  Confirmed:   { bg: 'bg-green-100 dark:bg-green-900/30',  text: 'text-green-700 dark:text-green-400'  },
  Pending:     { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400' },
  Cancelled:   { bg: 'bg-red-100 dark:bg-red-900/30',     text: 'text-red-700 dark:text-red-400'     },
  Completed:   { bg: 'bg-blue-100 dark:bg-blue-900/30',   text: 'text-blue-700 dark:text-blue-400'   },
  'No Show':   { bg: 'bg-gray-100 dark:bg-gray-900/30',   text: 'text-gray-600 dark:text-gray-400'   },
  Rescheduled: { bg: 'bg-purple-100 dark:bg-purple-900/30',text: 'text-purple-700 dark:text-purple-400'},
};

function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS.Pending;
  return <span className={`text-xs px-2 py-1 rounded-full font-medium ${c.bg} ${c.text}`}>{status}</span>;
}

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-5 animate-pulse">
      <div className="flex gap-4">
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-700 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4" />
          <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/2" />
          <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/3" />
        </div>
      </div>
    </div>
  );
}

export default function PatientDashboard() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [appts, setAppts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailModal, setDetailModal] = useState(null);

  useEffect(() => {
    patientApi.getDashboard()
      .then(d => setAppts(d.appointments || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const upcoming = appts.filter(a => a.booking_status !== 'Completed' && a.booking_status !== 'Cancelled');
  const completed = appts.filter(a => a.booking_status === 'Completed').length;

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-primary to-teal-500 rounded-2xl p-6 text-white shadow-md">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {user?.first_name}! 👋</h1>
            <p className="text-white/80 text-sm mt-1">
              {user?.verification_status === 'Approved'
                ? 'Your account is verified. You can book appointments.'
                : user?.verification_status === 'Under Review'
                ? 'Your ID is under review. You may still book appointments.'
                : 'Upload your ID to unlock full access.'}
            </p>
          </div>
          <button
            onClick={() => nav('/patient/book')}
            className="flex items-center gap-2 bg-white text-primary font-semibold px-5 py-2.5 rounded-xl hover:bg-white/90 transition shrink-0">
            <FaCalendarAlt /> Book Appointment
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Appointments', value: appts.length, icon: <FaCalendarAlt className="text-primary" /> },
          { label: 'Upcoming',           value: upcoming.length, icon: <FaClipboardList className="text-teal-500" /> },
          { label: 'Completed',          value: completed, icon: <FaBell className="text-green-500" /> },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-xl">{s.icon}</div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ID Verification alert */}
      {user?.verification_status === 'Pending' && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-amber-800 dark:text-amber-300">Verify Your Identity</p>
            <p className="text-sm text-amber-700 dark:text-amber-400">Upload a valid ID to get verified and access all features.</p>
          </div>
          <button onClick={() => nav('/patient/profile')}
            className="flex items-center gap-1 bg-amber-500 text-white px-4 py-2 rounded-xl font-medium text-sm shrink-0 hover:bg-amber-600 transition">
            Upload ID <FaArrowRight className="text-xs" />
          </button>
        </div>
      )}
      {user?.verification_status === 'Rejected' && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-red-800 dark:text-red-300">ID Verification Rejected</p>
            <p className="text-sm text-red-700 dark:text-red-400">Your ID was rejected. Please re-upload a valid ID.</p>
          </div>
          <button onClick={() => nav('/patient/profile')}
            className="flex items-center gap-1 bg-red-500 text-white px-4 py-2 rounded-xl font-medium text-sm shrink-0">
            Re-upload <FaArrowRight className="text-xs" />
          </button>
        </div>
      )}

      {/* Appointments list */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">My Appointments</h2>
        <div className="space-y-3">
          {loading ? (
            [1,2,3].map(i => <SkeletonCard key={i} />)
          ) : appts.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-10 text-center">
              <FaCalendarAlt className="text-4xl text-gray-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">You have no appointments yet.</p>
              <button onClick={() => nav('/patient/book')}
                className="mt-4 text-primary font-medium hover:underline">
                Book your first appointment →
              </button>
            </div>
          ) : (
            appts.map(a => (
              <div key={a.appointment_id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-5 flex items-start justify-between gap-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <FaUserCircle className="text-xl" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        Dr. {a.doctor?.first_name} {a.doctor?.last_name}
                      </span>
                      <StatusBadge status={a.booking_status} />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{a.service?.service_name}</p>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mt-1">
                      {new Date(a.appointment_date + 'T00:00:00').toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric', year:'numeric' })} • {a.start_time}
                    </p>
                    {a.reason_for_visit && <p className="text-xs text-gray-400 mt-1 truncate max-w-xs">Reason: {a.reason_for_visit}</p>}
                  </div>
                </div>
                <button
                  onClick={() => setDetailModal(a)}
                  className="text-sm px-4 py-2 rounded-lg border border-primary text-primary hover:bg-primary hover:text-white transition shrink-0">
                  View
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {detailModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDetailModal(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Appointment Details</h3>
            <div className="space-y-3 text-sm">
              {[
                ['Doctor', `Dr. ${detailModal.doctor?.first_name} ${detailModal.doctor?.last_name}`],
                ['Service', detailModal.service?.service_name],
                ['Date', new Date(detailModal.appointment_date + 'T00:00:00').toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })],
                ['Time', detailModal.start_time],
                ['Status', detailModal.booking_status],
                ['Type', detailModal.appointment_type],
                ['Reason', detailModal.reason_for_visit],
              ].map(([k,v]) => (
                <div key={k} className="flex justify-between gap-2">
                  <span className="text-gray-500 dark:text-gray-400 shrink-0">{k}</span>
                  <span className="text-gray-900 dark:text-white text-right font-medium">{v || '—'}</span>
                </div>
              ))}
              {detailModal.completion_note && (
                <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-yellow-800 dark:text-yellow-300 text-xs">
                  <strong>Note:</strong> {detailModal.completion_note}
                </div>
              )}
            </div>
            <button onClick={() => setDetailModal(null)}
              className="mt-6 w-full bg-primary text-white py-2.5 rounded-xl font-medium hover:opacity-90 transition">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
