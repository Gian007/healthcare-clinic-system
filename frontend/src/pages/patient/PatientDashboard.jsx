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
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [pendingConfirmAppt, setPendingConfirmAppt] = useState(null);

  const fetchDashboardData = () => {
    patientApi.getDashboard()
      .then(d => {
        setAppts(d.appointments || []);
        setPendingConfirmAppt(d.pending_attendance_confirm_appointment || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleOpenDetail = (appt) => {
    setDetailModal(appt);
    setCancelling(false);
    setCancelReason("");
  };

  const handleConfirmCancel = async () => {
    if (!cancelReason.trim()) {
      alert("Please provide a reason for cancellation.");
      return;
    }
    setCancelLoading(true);
    try {
      await patientApi.cancelAppointment(detailModal.appointment_id, {
        cancellation_reason: cancelReason
      });
      alert("Appointment cancelled successfully!");
      setDetailModal(null);
      fetchDashboardData();
    } catch (e) {
      alert(e.response?.data?.message || "Failed to cancel appointment.");
    } finally {
      setCancelLoading(false);
    }
  };

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

      {/* Attendance Check Notification Banner */}
      {pendingConfirmAppt && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-5 shadow-sm animate-pulse flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex gap-3">
            <span className="text-2xl shrink-0">⚠️</span>
            <div>
              <h4 className="font-bold text-amber-800 dark:text-amber-300 text-sm md:text-base">Upcoming Appointment Pre-Confirmation</h4>
              <p className="text-xs md:text-sm text-amber-700 dark:text-amber-400 mt-1">
                Your appointment with <strong className="font-semibold">Dr. {pendingConfirmAppt.doctor?.first_name} {pendingConfirmAppt.doctor?.last_name}</strong> starts at <strong className="font-semibold">{pendingConfirmAppt.start_time}</strong>. Please confirm if you are going to this appointment!
              </p>
            </div>
          </div>
          <div className="flex gap-2.5 shrink-0 self-end md:self-center">
            <button
              onClick={async () => {
                if (confirm("Confirming your attendance?")) {
                  try {
                    await patientApi.confirmAttendance(pendingConfirmAppt.appointment_id);
                    alert("Attendance confirmed successfully!");
                    fetchDashboardData();
                  } catch (e) {
                    alert("Failed to confirm attendance.");
                  }
                }
              }}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Yes, I am going
            </button>
            <button
              onClick={async () => {
                if (confirm("Are you sure you want to cancel your appointment? This will release your spot in the queue.")) {
                  try {
                    await patientApi.declineAttendance(pendingConfirmAppt.appointment_id);
                    alert("Appointment cancelled successfully.");
                    fetchDashboardData();
                  } catch (e) {
                    alert("Failed to cancel appointment.");
                  }
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              No, Cancel spot
            </button>
          </div>
        </div>
      )}

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
                className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4 min-w-0 w-full sm:w-auto">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <FaUserCircle className="text-xl" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 dark:text-white truncate max-w-[150px] sm:max-w-none">
                        Dr. {a.doctor?.first_name} {a.doctor?.last_name}
                      </span>
                      <StatusBadge status={a.booking_status} />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">{a.service?.service_name}</p>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mt-1">
                      {new Date(a.appointment_date + 'T00:00:00').toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric', year:'numeric' })} • {a.start_time}
                    </p>
                    {a.reason_for_visit && (
                      <p className="text-xs text-gray-400 mt-1 truncate max-w-full" title={a.reason_for_visit}>
                        Reason: {a.reason_for_visit}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleOpenDetail(a)}
                  className="text-sm px-4 py-2 rounded-xl border border-primary text-primary hover:bg-primary hover:text-white transition w-full sm:w-auto text-center shrink-0 self-stretch sm:self-start mt-2 sm:mt-0 font-bold">
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
            {!cancelling ? (
              <>
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
                  {detailModal.cancellation && (
                    <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 rounded-lg text-red-800 dark:text-red-300 text-xs">
                      <strong>Cancellation Reason ({detailModal.cancellation.cancelled_by}):</strong> {detailModal.cancellation.cancellation_reason}
                    </div>
                  )}
                </div>
                <div className="mt-6 flex flex-col gap-2">
                  {['Pending', 'Confirmed', 'Rescheduled'].includes(detailModal.booking_status) && (
                    <button
                      onClick={() => setCancelling(true)}
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl font-medium transition"
                    >
                      Cancel Appointment
                    </button>
                  )}
                  <button onClick={() => setDetailModal(null)}
                    className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 py-2.5 rounded-xl font-medium transition">
                    Close
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Cancel Appointment</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Please provide a reason for cancelling this appointment.</p>
                <textarea
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  placeholder="Reason for cancellation (e.g. scheduling conflict, personal reasons)..."
                  className="w-full border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl p-3 h-28 outline-none focus:ring-2 focus:ring-primary/30 resize-none text-sm font-sans"
                />
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => setCancelling(false)}
                    disabled={cancelLoading}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 py-2.5 rounded-xl font-medium transition text-center"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleConfirmCancel}
                    disabled={cancelLoading || !cancelReason.trim()}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl font-medium transition disabled:opacity-40"
                  >
                    {cancelLoading ? "Cancelling..." : "Confirm Cancel"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
