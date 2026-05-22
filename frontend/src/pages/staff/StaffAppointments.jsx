import { useOutletContext } from "react-router-dom";
import { useEffect, useState } from "react";
import StaffTableBadge from "../../components/staff/StaffTableBadge";
import * as staffApi from "../../api/staffApi";

export default function StaffAppointments() {
  const { dark } = useOutletContext();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await staffApi.getAppointments();
      setAppointments(data || []);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    if (!confirm(`Are you sure you want to mark this appointment as ${status}?`)) return;
    try {
      setActionLoading(true);
      await staffApi.updateAppointmentStatus(id, { booking_status: status });
      // Refresh the list
      const data = await staffApi.getDashboardData();
      setAppointments(data.appointments_today || []);
    } catch (error) {
      alert("Failed to update status: " + (error.response?.data?.message || error.message));
    } finally {
      setActionLoading(false);
    }
  };

  const pageTitle = dark ? "text-white" : "text-gray-900";
  const muted = dark ? "text-gray-400" : "text-gray-500";
  const card = dark
    ? "bg-gray-900 border-gray-800 text-white"
    : "bg-white border-gray-200 text-gray-900";
  const tableHead = dark ? "bg-gray-800 text-gray-300" : "bg-gray-50 text-gray-500";
  const divide = dark ? "divide-gray-800" : "divide-gray-100";

  return (
    <div>
      <h1 className={`text-2xl font-semibold ${pageTitle}`}>Appointments</h1>
      <p className={`text-sm ${muted}`}>All clinic appointments</p>

      <div className={`mt-6 overflow-hidden rounded-2xl border shadow-sm ${card}`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className={tableHead}>
              <tr>
                <th className="px-4 py-3">Date & Time</th>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Doctor</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Patient ID</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>

            <tbody className={`divide-y ${divide}`}>
              {loading ? (
                <tr><td colSpan="7" className="p-8 text-center text-gray-500">Loading appointments...</td></tr>
              ) : appointments.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-gray-500">No appointments found.</td></tr>
              ) : (
                appointments.map((a) => (
                  <tr key={a.appointment_id} className="hover:bg-teal-50/20 dark:hover:bg-teal-900/10 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {new Date(`${a.appointment_date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5 font-medium">
                        {a.start_time} - {a.end_time}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="grid h-8 w-8 place-items-center rounded-full bg-teal-100 dark:bg-teal-900/40 border border-teal-200 dark:border-teal-800 text-xs font-bold text-teal-700 dark:text-teal-400">
                          {a.patient?.first_name ? a.patient.first_name[0] : '?'}
                        </div>
                        <span className="font-semibold">{a.patient?.first_name} {a.patient?.last_name}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3">{a.doctor ? `Dr. ${a.doctor.first_name} ${a.doctor.last_name}` : 'N/A'}</td>
                    <td className="px-4 py-3">{a.service?.service_name || 'N/A'}</td>
                    <td className="px-4 py-3 font-mono text-teal-600 dark:text-teal-400">{a.patient?.patient_number || 'N/A'}</td>
                    <td className="px-4 py-3">
                      <StaffTableBadge status={a.booking_status} />
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {a.booking_status === 'Pending' && (
                          <button 
                            onClick={() => handleUpdateStatus(a.appointment_id, 'Confirmed')}
                            disabled={actionLoading}
                            className="rounded-md border border-green-300 px-3 py-1 text-xs text-green-700 hover:bg-green-50 dark:hover:bg-green-950/20 dark:border-green-800 dark:text-green-400 transition font-bold disabled:opacity-55"
                          >
                            Confirm
                          </button>
                        )}
                        {a.booking_status !== 'Cancelled' && a.booking_status !== 'Completed' && (
                          <button 
                            onClick={() => handleUpdateStatus(a.appointment_id, 'Cancelled')}
                            disabled={actionLoading}
                            className="rounded-md border border-red-300 px-3 py-1 text-xs text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 dark:border-red-800 dark:text-red-400 transition font-bold disabled:opacity-55"
                          >
                            Cancel
                          </button>
                        )}
                        <button 
                          onClick={() => { setSelectedAppt(a); setShowModal(true); }}
                          className="rounded-md border border-gray-300 px-3 py-1 text-xs hover:bg-gray-50 dark:hover:bg-slate-800 dark:border-slate-700 transition font-bold"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Appointment Detail Modal */}
      {showModal && selectedAppt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ${card}`}>
            <div className="p-5 border-b dark:border-gray-800 flex justify-between items-center bg-teal-600 text-white">
              <div>
                <h2 className="text-lg font-bold">Appointment Details</h2>
                <p className="text-xs text-teal-100 mt-1">Clinic Appointment Record</p>
              </div>
              <button onClick={() => setShowModal(false)} className="h-8 w-8 grid place-items-center rounded-full hover:bg-white/20 transition-colors">✕</button>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={`text-[10px] font-bold tracking-wider uppercase ${muted}`}>Patient Name</p>
                  <p className="font-bold text-gray-900 dark:text-white mt-0.5">{selectedAppt.patient?.first_name} {selectedAppt.patient?.last_name}</p>
                </div>
                <div>
                  <p className={`text-[10px] font-bold tracking-wider uppercase ${muted}`}>Patient ID</p>
                  <p className="font-mono font-bold text-teal-600 dark:text-teal-400 mt-0.5">{selectedAppt.patient?.patient_number || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t pt-3 dark:border-gray-800">
                <div>
                  <p className={`text-[10px] font-bold tracking-wider uppercase ${muted}`}>Assigned Doctor</p>
                  <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{selectedAppt.doctor ? `Dr. ${selectedAppt.doctor.first_name} ${selectedAppt.doctor.last_name}` : 'N/A'}</p>
                </div>
                <div>
                  <p className={`text-[10px] font-bold tracking-wider uppercase ${muted}`}>Service Requested</p>
                  <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{selectedAppt.service?.service_name || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t pt-3 dark:border-gray-800">
                <div>
                  <p className={`text-[10px] font-bold tracking-wider uppercase ${muted}`}>Scheduled Time</p>
                  <p className="font-medium text-gray-900 dark:text-white mt-0.5">{selectedAppt.start_time} - {selectedAppt.end_time}</p>
                </div>
                <div>
                  <p className={`text-[10px] font-bold tracking-wider uppercase ${muted}`}>Booking Status</p>
                  <div className="mt-1">
                    <StaffTableBadge status={selectedAppt.booking_status} />
                  </div>
                </div>
              </div>

              {selectedAppt.reason_for_visit && (
                <div className="border-t pt-3 dark:border-gray-800">
                  <p className={`text-[10px] font-bold tracking-wider uppercase ${muted}`}>Reason for Visit</p>
                  <p className="mt-1 text-xs bg-gray-50 dark:bg-slate-800 p-3 rounded-lg border dark:border-slate-700 text-gray-700 dark:text-gray-300 italic">{selectedAppt.reason_for_visit}</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t dark:border-gray-800 flex justify-end bg-gray-50/50 dark:bg-gray-900/50">
              <button 
                onClick={() => setShowModal(false)}
                className={`px-6 py-2 rounded-xl text-xs font-semibold transition ${dark ? 'hover:bg-gray-800 text-white' : 'hover:bg-gray-100 text-gray-700'}`}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}