import { useEffect, useMemo, useState } from 'react';
import { FaEye as Eye, FaSearch as Search } from 'react-icons/fa';
import { getAppointments } from '../../api/doctorApi';
import { Badge, Card, Modal, PageHeader } from '../../components/doctor/DoctorUI';

export default function DoctorAppointments() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const data = await getAppointments();
      setRows(data || []);
    } catch (error) {
      console.error("Failed to load appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => rows.filter(r =>
    `${r.patient?.first_name || ''} ${r.patient?.last_name || ''} ${r.patient?.patient_number || ''} ${r.service?.service_name || ''} ${r.booking_status || ''}`
      .toLowerCase()
      .includes(q.toLowerCase())
  ), [rows, q]);

  return (
    <div>
      <PageHeader title="Appointments" subtitle="View patient appointment details. Status is updated automatically from queue completion." />

      <Card className="p-5 overflow-x-auto">
        <div className="flex flex-col md:flex-row justify-between gap-3 mb-6">
          <h2 className="font-bold">All Appointments</h2>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-3 text-slate-400" />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search patients..."
              className="pl-10 pr-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 outline-none w-full md:w-72"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10">Loading...</div>
        ) : (
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="text-left text-slate-500 border-b dark:border-slate-800">
                <th className="py-3 px-4">Patient</th>
                <th>Service</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-slate-500">No appointments found.</td>
                </tr>
              ) : (
                filtered.map(r => (
                  <tr key={r.appointment_id} className="border-b dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-4 font-semibold">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-teal-100 dark:bg-teal-900/40 border border-teal-200 dark:border-teal-800 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                          {r.patient?.profile_picture ? (
                            <img
                              src={`${import.meta.env.VITE_BACKEND_URL}/storage/${r.patient.profile_picture}`}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${r.patient.first_name}+${r.patient.last_name}&background=random`; }}
                            />
                          ) : (
                            <span className="text-teal-600 dark:text-teal-400 font-bold text-[10px]">{initials(r.patient)}</span>
                          )}
                        </div>
                        <div>
                          <div className="text-slate-900 dark:text-white leading-tight">{patientName(r.patient)}</div>
                          <div className="text-[10px] text-slate-500 font-bold tracking-tighter uppercase">{r.patient?.patient_number}</div>
                        </div>
                      </div>
                    </td>
                    <td>{r.service?.service_name || 'N/A'}</td>
                    <td>{r.appointment_date}</td>
                    <td>{r.start_time}</td>
                    <td><Badge tone={statusTone(r.booking_status)}>{r.booking_status}</Badge></td>
                    <td className="text-xs text-slate-500 max-w-[150px] truncate">{r.completion_note || r.reason_for_visit || '-'}</td>
                    <td className="py-3">
                      <button
                        onClick={() => setSelected(r)}
                        title="View patient info"
                        className="text-teal-600 hover:text-teal-800 bg-teal-50 dark:bg-teal-900/20 p-2 rounded-lg transition-colors"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </Card>

      {selected && (
        <Modal title="Patient Information" onClose={() => setSelected(null)}>
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 grid place-items-center font-bold overflow-hidden">
                {selected.patient?.profile_picture ? (
                  <img src={`${import.meta.env.VITE_BACKEND_URL}/storage/${selected.patient.profile_picture}`} className="h-full w-full object-cover" />
                ) : initials(selected.patient)}
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{patientName(selected.patient)}</p>
                <p className="text-xs text-slate-500 font-bold uppercase">{selected.patient?.patient_number || 'No patient number'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 border-t pt-4 dark:border-slate-800">
              <Info label="Appointment Date" value={selected.appointment_date} />
              <Info label="Time" value={`${selected.start_time || '--'} - ${selected.end_time || '--'}`} />
              <Info label="Service" value={selected.service?.service_name || 'N/A'} />
              <Info label="Status" value={selected.booking_status || 'N/A'} />
              <Info label="Email" value={selected.patient?.email || 'N/A'} />
              <Info label="Contact" value={selected.patient?.contact_number || 'N/A'} />
            </div>

            <div className="border-t pt-4 dark:border-slate-800">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Reason / Notes</p>
              <p className="mt-2 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-3 text-slate-700 dark:text-slate-300">
                {selected.reason_for_visit || selected.completion_note || 'No notes provided.'}
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 p-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 font-semibold text-slate-800 dark:text-slate-100 break-words">{value}</p>
    </div>
  );
}

function patientName(patient) {
  if (!patient) return 'Unknown Patient';
  return [patient.first_name, patient.middle_name, patient.last_name].filter(Boolean).join(' ');
}

function initials(patient) {
  if (!patient) return '?';
  return `${patient.first_name?.[0] || ''}${patient.last_name?.[0] || ''}` || '?';
}

function statusTone(status) {
  if (status === 'Pending') return 'yellow';
  if (status === 'Completed') return 'green';
  if (status === 'Cancelled' || status === 'No Show') return 'red';
  return 'blue';
}
