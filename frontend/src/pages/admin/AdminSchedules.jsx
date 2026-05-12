import { useEffect, useState } from "react";
import { PageHeader, Modal } from "../../components/admin/AdminUI";
import * as adminApi from "../../api/adminApi";
import { FaTrash } from "react-icons/fa";

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const BLANK = { doctor_id: '', day_of_week: 'Monday', start_time: '09:00', end_time: '17:00', slot_duration_mins: 30, max_patients: 10 };

export default function AdminSchedules() {
  const [schedules, setSchedules] = useState([]);
  const [doctors, setDoctors]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(false);
  const [formData, setFormData]   = useState(BLANK);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving]       = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = () => {
    setLoading(true);
    Promise.all([adminApi.getSchedules(), adminApi.getDoctors()])
      .then(([s, d]) => { setSchedules(s); setDoctors(d); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true); setFormErrors({});
    try {
      await adminApi.createSchedule(formData);
      setModal(false);
      fetchAll();
    } catch(err) {
      if (err.response?.data?.errors) {
        const e = {};
        Object.entries(err.response.data.errors).forEach(([k,v]) => e[k] = v[0]);
        setFormErrors(e);
      } else {
        setFormErrors({ general: err.response?.data?.message || 'Failed to save.' });
      }
    }
    setSaving(false);
  };

  const doDelete = async () => {
    if (!confirmDelete) return;
    await adminApi.deleteSchedule(confirmDelete.schedule_id);
    setConfirmDelete(null);
    fetchAll();
  };

  // Group by doctor
  const byDoctor = schedules.reduce((acc, s) => {
    const id = s.doctor_id;
    if (!acc[id]) acc[id] = { doctor: s.doctor, slots: [] };
    acc[id].slots.push(s);
    return acc;
  }, {});

  const doctorGroups = Object.values(byDoctor);
  doctorGroups.forEach(g => g.slots.sort((a,b) => DAYS.indexOf(a.day_of_week) - DAYS.indexOf(b.day_of_week)));

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Schedules</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Doctor schedules from the database</p>
        </div>
        <button onClick={() => { setFormData(BLANK); setFormErrors({}); setModal(true); }}
          className="bg-primary text-white px-5 py-2.5 rounded-xl font-medium hover:opacity-90 transition">
          + Add Schedule
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2].map(i => (
            <div key={i} className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 animate-pulse">
              <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-1/3 mb-4"/>
              <div className="space-y-2">{[1,2,3].map(j => <div key={j} className="h-4 bg-gray-200 dark:bg-slate-700 rounded"/>)}</div>
            </div>
          ))}
        </div>
      ) : doctorGroups.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-12 text-center">
          <p className="text-4xl mb-3">📅</p>
          <p className="text-gray-500 dark:text-gray-400">No schedules found.</p>
          <p className="text-xs text-gray-400 mt-1">Create doctors first, then assign their schedules here.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {doctorGroups.map(({ doctor, slots }) => (
            <div key={doctor?.doctor_id} className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="bg-gradient-to-r from-teal-600 to-teal-500 text-white px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="font-bold">Dr. {doctor?.first_name} {doctor?.last_name}</h2>
                  <p className="text-sm text-teal-100">{doctor?.specialization?.name || 'No specialization'} • {doctor?.email}</p>
                </div>
                <span className="text-xs bg-white/20 px-3 py-1.5 rounded-full">{slots.length} day{slots.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="p-5">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-slate-800">
                      <th className="pb-3">Day</th>
                      <th className="pb-3">Start</th>
                      <th className="pb-3">End</th>
                      <th className="pb-3">Slot (min)</th>
                      <th className="pb-3">Max Patients</th>
                      <th className="pb-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {slots.map(s => (
                      <tr key={s.schedule_id} className="border-b border-gray-50 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                        <td className="py-3 font-medium">{s.day_of_week}</td>
                        <td className="text-teal-600">{s.start_time?.slice(0,5)}</td>
                        <td className="text-teal-600">{s.end_time?.slice(0,5)}</td>
                        <td>{s.slot_duration_mins || 30}</td>
                        <td>{s.max_patients || 10}</td>
                        <td>
                          <button onClick={() => setConfirmDelete(s)}
                            className="text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-lg transition">
                            <FaTrash className="text-xs" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {modal && (
        <Modal title="Add Doctor Schedule" onClose={() => setModal(false)}>
          <form onSubmit={save} className="space-y-4">
            {formErrors.general && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{formErrors.general}</div>}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Doctor <span className="text-red-500">*</span></label>
              <select required value={formData.doctor_id} onChange={e => setFormData(p => ({...p, doctor_id: e.target.value}))}
                className={`w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30 dark:bg-slate-800 dark:border-slate-700 dark:text-white ${formErrors.doctor_id ? 'border-red-400' : 'border-gray-300 dark:border-slate-700'}`}>
                <option value="">— Select Doctor —</option>
                {doctors.map(d => (
                  <option key={d.doctor_id} value={d.doctor_id}>Dr. {d.first_name} {d.last_name}</option>
                ))}
              </select>
              {formErrors.doctor_id && <p className="text-xs text-red-500 mt-1">{formErrors.doctor_id}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Day of Week</label>
              <select value={formData.day_of_week} onChange={e => setFormData(p => ({...p, day_of_week: e.target.value}))}
                className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30 dark:bg-slate-800 dark:text-white">
                {DAYS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[['Start Time','start_time','time'],['End Time','end_time','time'],['Slot (minutes)','slot_duration_mins','number'],['Max Patients','max_patients','number']].map(([label,name,type]) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
                  <input type={type} value={formData[name]} onChange={e => setFormData(p => ({...p, [name]: e.target.value}))}
                    className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30 dark:bg-slate-800 dark:text-white" />
                </div>
              ))}
            </div>
            <button type="submit" disabled={saving} className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50">
              {saving ? 'Saving...' : 'Add Schedule'}
            </button>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-sm text-center">
            <FaTrash className="text-red-500 text-4xl mx-auto mb-3" />
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Delete Schedule?</h3>
            <p className="text-sm text-gray-500 mt-1">{confirmDelete.day_of_week} ({confirmDelete.start_time?.slice(0,5)} – {confirmDelete.end_time?.slice(0,5)})</p>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 border border-gray-300 dark:border-slate-700 py-2.5 rounded-xl font-medium">Cancel</button>
              <button onClick={doDelete} className="flex-1 bg-red-500 text-white py-2.5 rounded-xl font-medium hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
