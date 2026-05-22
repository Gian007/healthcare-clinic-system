import { useEffect, useState, useMemo } from "react";
import { PageHeader, Modal, Badge, TextInput, SelectInput } from "../../components/admin/AdminUI";
import * as adminApi from "../../api/adminApi";
import { useAdminSettings } from "../../state/adminSettings";
import { FaTrash, FaCheck, FaTimes, FaCalendarAlt, FaHospital, FaUserMd, FaUmbrellaBeach, FaStar, FaBell } from "react-icons/fa";

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

const formatTime12Hour = (timeStr) => {
  if (!timeStr) return '';
  try {
    const parts = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(parts[0], 10));
    date.setMinutes(parseInt(parts[1], 10));
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  } catch (e) {
    return timeStr;
  }
};

export default function AdminSchedules() {
  const { settings, setSettings } = useAdminSettings();
  const [tab, setTab] = useState('hospital'); // 'hospital', 'doctors', 'rooms', 'dayoffs', 'special'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Data
  const [clinicHours, setClinicHours] = useState([]);
  const [doctorSchedules, setDoctorSchedules] = useState([]);
  const [dayOffRequests, setDayOffRequests] = useState([]);
  const [specialSchedules, setSpecialSchedules] = useState([]);
  const [doctors, setDoctors] = useState([]);

  // Modals
  const [modal, setModal] = useState(null); // { type, mode, data }
  const [formErrors, setFormErrors] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Memoized Rooms - Not needed, keep as empty array for compatibility
  const rooms = [];

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [hours, docScheds, dayOffs, specials, docs] = await Promise.all([
        adminApi.getClinicHours(),
        adminApi.getDoctorSchedules(),
        adminApi.getAdminDayOffRequests(),
        adminApi.getSpecialSchedules(),
        adminApi.getDoctors()
      ]);
      setClinicHours(hours);
      setDoctorSchedules(docScheds);
      setDayOffRequests(dayOffs);
      setSpecialSchedules(specials);
      setDoctors(docs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  /* ─────────────────────────── Tab 1: Hospital Hours ─────────────────────────── */
  const saveClinicHours = async () => {
    setSaving(true);
    try {
      await adminApi.updateClinicHours({ hours: clinicHours });
      alert("Clinic hours updated successfully.");
    } catch (e) {
      console.error(e);
      alert("Failed to update clinic hours.");
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (id) => {
    setClinicHours(prev => prev.map(h => h.id === id ? { ...h, is_open: !h.is_open } : h));
  };

  const updateHourField = (id, field, val) => {
    setClinicHours(prev => prev.map(h => h.id === id ? { ...h, [field]: val } : h));
  };

  const saveDoctorSchedule = async (e) => {
    e.preventDefault();
    setSaving(true); setFormErrors({});

    // Client-side validation to enforce required Room
    if (!modal.data.room?.trim()) {
      setFormErrors({ general: "The Room/Dept field is required." });
      setSaving(false);
      return;
    }

    try {
      const data = modal.data;
      if (modal.mode === 'add') {
        await adminApi.createDoctorSchedule(data);
      } else {
        await adminApi.updateDoctorSchedule(data.schedule_id, data);
      }
      setModal(null);
      fetchAll();
    } catch (err) {
      if (err.response?.status === 422) {
        const errors = err.response.data.errors;
        const msg = errors ? Object.values(errors)[0][0] : err.response.data.message;
        setFormErrors({ general: msg });
      } else {
        setFormErrors({ general: "An error occurred." });
      }
    } finally {
      setSaving(false);
    }
  };

  /* ─────────────────────────── Tab 3: Day Off Requests ─────────────────────────── */
  const handleDayOffAction = async (id, action, remarks) => {
    try {
      if (action === 'approve') await adminApi.approveDayOffRequest(id, remarks);
      else await adminApi.rejectDayOffRequest(id, remarks);
      setModal(null);
      fetchAll();
    } catch (e) {
      console.error(e);
      alert("Failed to process request.");
    }
  };

  /* ─────────────────────────── Tab 4: Special Schedules ─────────────────────────── */
  const saveSpecialSchedule = async (e) => {
    e.preventDefault();
    setSaving(true); setFormErrors({});
    try {
      if (modal.mode === 'add') await adminApi.createSpecialSchedule(modal.data);
      else await adminApi.updateSpecialSchedule(modal.data.id, modal.data);
      setModal(null);
      fetchAll();
    } catch (err) {
      if (err.response?.status === 422) setFormErrors(err.response.data.errors || { general: err.response.data.message });
      else setFormErrors({ general: "An error occurred." });
    } finally {
      setSaving(false);
    }
  };

  const deleteScheduleItem = async () => {
    if (!confirmDelete) return;
    try {
      if (confirmDelete.type === 'doctor') {
        const res = await adminApi.deleteDoctorSchedule(confirmDelete.id);
        if (res?.deactivated) {
          alert("This schedule contains active or historical appointments. It has been deactivated instead of deleted to preserve records.");
        } else {
          alert("Schedule deleted successfully.");
        }
      } else {
        await adminApi.deleteSpecialSchedule(confirmDelete.id);
        alert("Special schedule deleted successfully.");
      }
      setConfirmDelete(null);
      fetchAll();
    } catch (e) {
      console.error(e);
      alert("Failed to delete schedule item.");
      setConfirmDelete(null);
    }
  };

  if (loading) return <div className="p-10 text-center animate-pulse text-slate-500">Loading clinic scheduling system...</div>;

  return (
    <div className="pb-20">
      <PageHeader 
        title="Scheduling System" 
        subtitle="Manage clinic hours, doctor regular schedules, and special closures."
      />

      {/* Tabs */}
      <div className="flex gap-2 mb-8 bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-2xl w-fit">
        {[
          { id: 'hospital', label: 'Clinic Hours', icon: <FaHospital/> },
          { id: 'doctors',  label: 'Doctor Regular', icon: <FaUserMd/> },
          { id: 'dayoffs',  label: 'Day Off Requests', icon: <FaUmbrellaBeach/> },
          { id: 'special',  label: 'Holidays & Special', icon: <FaStar/> },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === t.id ? 'bg-white dark:bg-slate-700 text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content: Hospital Hours */}
      {tab === 'hospital' && (
        <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
            <div className="p-8 border-b border-slate-50 dark:border-slate-800">
              <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">Base Operating Hours</h3>
              <p className="text-sm text-slate-500">These settings define when the clinic is open for all appointments.</p>
            </div>
            <div className="divide-y divide-slate-50 dark:divide-slate-800">
              {clinicHours.map(h => (
                <div key={h.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <div className="w-32">
                    <span className="font-bold text-slate-700 dark:text-slate-300">{h.day_of_week}</span>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${h.is_open ? 'text-emerald-600' : 'text-rose-500'}`}>{h.is_open ? 'Open' : 'Closed'}</span>
                      <button 
                        onClick={() => toggleDay(h.id)}
                        className={`w-12 h-6 rounded-full transition-all relative ${h.is_open ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${h.is_open ? 'left-7' : 'left-1'}`}/>
                      </button>
                    </div>
                    {h.is_open && (
                      <div className="flex items-center gap-2">
                        <input 
                          type="time" 
                          value={h.open_time.slice(0,5)} 
                          onChange={e => updateHourField(h.id, 'open_time', e.target.value)}
                          className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-3 py-1.5 text-sm font-bold"
                        />
                        <span className="text-slate-400">to</span>
                        <input 
                          type="time" 
                          value={h.close_time.slice(0,5)} 
                          onChange={e => updateHourField(h.id, 'close_time', e.target.value)}
                          className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-3 py-1.5 text-sm font-bold"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-8 bg-slate-50 dark:bg-slate-800/30">
              <button 
                onClick={saveClinicHours}
                disabled={saving}
                className="w-full bg-slate-900 dark:bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:opacity-90 transition shadow-xl"
              >
                {saving ? 'Saving...' : 'Save Hospital Hours'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Doctor Regular Schedules */}
      {tab === 'doctors' && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex justify-end mb-6">
            <button 
              onClick={() => setModal({ type: 'doctor', mode: 'add', data: { doctor_id: '', day_of_week: 'Monday', start_time: '09:00', end_time: '17:00', lunch_start: '12:00', lunch_end: '13:00', break1_start: '10:00', break1_end: '10:30', break2_start: '15:00', break2_end: '15:30', room: '', schedule_status: 'Active', slot_limit: 8 } })}
              className="bg-teal-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:opacity-90 transition"
            >
              <FaCalendarAlt/> Assign New Schedule
            </button>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {doctorSchedules.length === 0 ? (
               <div className="xl:col-span-2 py-20 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center">
                  <div className="h-16 w-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-300 mb-4">
                     <FaCalendarAlt size={32}/>
                  </div>
                  <h4 className="text-lg font-bold text-slate-400">No regular schedules assigned.</h4>
                  <p className="text-sm text-slate-400 mt-1">Click the button above to assign a doctor to a weekly rotation.</p>
               </div>
            ) : doctorSchedules.map(s => {
              const formatTime = (t) => {
                if (!t) return 'N/A';
                const [h, m] = t.split(':').map(Number);
                const p = h >= 12 ? 'PM' : 'AM';
                const dh = h % 12 || 12;
                return `${dh}:${m.toString().padStart(2, '0')} ${p}`;
              };
              return (
                <div key={s.schedule_id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-start justify-between hover:border-teal-200 dark:hover:border-teal-900 transition-all group">
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 text-xl shadow-inner">
                      <FaUserMd/>
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800 dark:text-white leading-tight">Dr. {s.doctor?.first_name} {s.doctor?.last_name}</h4>
                      <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mt-1">{s.day_of_week}s</p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-slate-500 font-medium">
                        <span className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-lg">
                          <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"/> 
                          {formatTime(s.start_time)} - {formatTime(s.end_time)}
                        </span>
                        <span className="text-[10px] font-black text-slate-400 uppercase">{s.slot_limit} Slots Total</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={s.schedule_status === 'Active' ? 'success' : 'neutral'}>{s.schedule_status}</Badge>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setModal({ type: 'doctor', mode: 'edit', data: s })}
                        className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition font-bold text-xs"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}



      {/* Tab Content: Day Off Requests */}
      {tab === 'dayoffs' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left bg-slate-50 dark:bg-slate-800 text-slate-500 font-black uppercase tracking-widest text-[10px]">
                <th className="p-6">Doctor</th>
                <th className="p-6">Target Date</th>
                <th className="p-6">Reason</th>
                <th className="p-6">Status</th>
                <th className="p-6">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {dayOffRequests.length === 0 ? (
                <tr><td colSpan="5" className="p-12 text-center text-slate-400 italic">No day-off requests found.</td></tr>
              ) : (
                dayOffRequests.map(r => (
                  <tr key={r.dayoff_id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-6 font-bold text-slate-800 dark:text-white">Dr. {r.doctor?.first_name} {r.doctor?.last_name}</td>
                    <td className="p-6">
                      <span className="font-mono font-bold text-teal-600 block">{r.dayoff_date}</span>
                      {r.is_half_day ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 dark:text-teal-400 mt-1 px-1.5 py-0.5 bg-teal-50 dark:bg-teal-500/10 rounded">
                          Half Day: {formatTime12Hour(r.start_time)} - {formatTime12Hour(r.end_time)}
                        </span>
                      ) : (
                        <span className="block text-[10px] text-slate-400 mt-1 font-bold">Full Day</span>
                      )}
                    </td>
                    <td className="p-6 text-slate-500 max-w-xs truncate">{r.reason}</td>
                    <td className="p-6">
                      <Badge variant={r.status === 'Approved' ? 'success' : r.status === 'Rejected' ? 'error' : 'warning'}>{r.status}</Badge>
                    </td>
                    <td className="p-6">
                      {r.status === 'Pending' ? (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleDayOffAction(r.dayoff_id, 'approve', '')}
                            className="bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-emerald-600 transition"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleDayOffAction(r.dayoff_id, 'reject', '')}
                            className="bg-rose-500 text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-rose-600 transition"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] font-black text-slate-400 uppercase">Processed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab Content: Special Schedules */}
      {tab === 'special' && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
           <div className="flex justify-end mb-6">
            <button 
              onClick={() => setModal({ type: 'special', mode: 'add', data: { title: '', date: '', type: 'Holiday', applies_to_type: 'Whole Clinic', applies_to_id: '', start_time: '', end_time: '', reason: '', notify_patients: true } })}
              className="bg-slate-900 dark:bg-primary text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:opacity-90 transition"
            >
              <FaStar/> New Special Schedule
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {specialSchedules.map(s => (
              <div key={s.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col hover:border-amber-200 transition-all group">
                <div className={`p-4 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-between border-b transition-colors duration-300 ${
                  s.type === 'Holiday' || s.type === 'Shortened Hours'
                    ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300 border-amber-100/50 dark:border-amber-900/30'
                    : s.type === 'Clinic Closed' || s.type === 'Emergency'
                    ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 border-rose-100/50 dark:border-rose-900/30'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-100 dark:border-slate-800'
                }`}>
                   <span>{s.type}</span>
                   {s.notify_patients && <FaBell title="Patients will be notified"/>}
                </div>
                <div className="p-6 flex-1">
                  <h4 className="font-black text-lg text-slate-800 dark:text-white leading-tight mb-1">{s.title}</h4>
                  <p className="text-sm font-bold text-slate-400 mb-4">{new Date(s.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                  
                  <div className="space-y-3">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Applies To</p>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{s.applies_to_type === 'Whole Clinic' ? '🏥 Whole Clinic' : s.applies_to_type}</p>
                    </div>
                    {s.reason && (
                       <p className="text-xs text-slate-500 italic leading-relaxed">"{s.reason}"</p>
                    )}
                  </div>
                </div>
                <div className="p-4 bg-slate-50/50 dark:bg-slate-800/30 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => setModal({ type: 'special', mode: 'edit', data: s })} className="p-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold">Edit</button>
                   <button onClick={() => setConfirmDelete({ type: 'special', id: s.id, label: s.title })} className="p-2 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Factory */}
      {modal && (
        <Modal 
          title={
            modal.type === 'doctor' ? (modal.mode === 'add' ? 'Assign Schedule' : 'Edit Schedule') :
            modal.type === 'dayoff_action' ? (modal.mode === 'approve' ? 'Approve Request' : 'Reject Request') :
            (modal.mode === 'add' ? 'Add Special Event' : 'Edit Special Event')
          } 
          onClose={() => setModal(null)}
        >
          {modal.type === 'doctor' && (
            <form onSubmit={saveDoctorSchedule} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectInput 
                  label="Doctor" 
                  value={modal.data.doctor_id} 
                  onChange={v => setModal({...modal, data: {...modal.data, doctor_id: v}})}
                  options={doctors.map(d => ({ label: `Dr. ${d.first_name} ${d.last_name}`, value: d.doctor_id }))}
                />
                <SelectInput 
                  label="Day of Week" 
                  value={modal.data.day_of_week} 
                  onChange={v => setModal({...modal, data: {...modal.data, day_of_week: v}})}
                  options={DAYS.map(d => ({ label: d, value: d }))}
                />
                <TextInput label="Start Time" type="time" value={modal.data.start_time?.slice(0,5)} onChange={v => setModal({...modal, data: {...modal.data, start_time: v}})} />
                <TextInput label="End Time" type="time" value={modal.data.end_time?.slice(0,5)} onChange={v => setModal({...modal, data: {...modal.data, end_time: v}})} />
                
                <div className="md:col-span-2 border-t dark:border-slate-800 pt-4 mt-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Break & Lunch Periods</p>
                  <div className="grid grid-cols-2 gap-4">
                    <TextInput label="Lunch Start" type="time" value={modal.data.lunch_start?.slice(0,5)} onChange={v => setModal({...modal, data: {...modal.data, lunch_start: v}})} />
                    <TextInput label="Lunch End" type="time" value={modal.data.lunch_end?.slice(0,5)} onChange={v => setModal({...modal, data: {...modal.data, lunch_end: v}})} />
                    <TextInput label="Break 1 Start" type="time" value={modal.data.break1_start?.slice(0,5)} onChange={v => setModal({...modal, data: {...modal.data, break1_start: v}})} />
                    <TextInput label="Break 1 End" type="time" value={modal.data.break1_end?.slice(0,5)} onChange={v => setModal({...modal, data: {...modal.data, break1_end: v}})} />
                    <TextInput label="Break 2 Start" type="time" value={modal.data.break2_start?.slice(0,5)} onChange={v => setModal({...modal, data: {...modal.data, break2_start: v}})} />
                    <TextInput label="Break 2 End" type="time" value={modal.data.break2_end?.slice(0,5)} onChange={v => setModal({...modal, data: {...modal.data, break2_end: v}})} />
                  </div>
                </div>

                <TextInput label="Total Slot Limit" type="number" value={modal.data.slot_limit} onChange={v => setModal({...modal, data: {...modal.data, slot_limit: v}})} />
                <TextInput 
                  label="Room/Dept" 
                  placeholder="e.g. Room 101"
                  value={modal.data.room} 
                  onChange={v => setModal({...modal, data: {...modal.data, room: v}})} 
                />
                <SelectInput label="Status" value={modal.data.schedule_status} onChange={v => setModal({...modal, data: {...modal.data, schedule_status: v}})} options={[{label:'Active',value:'Active'},{label:'Inactive',value:'Inactive'}]} />
              </div>
              <button disabled={saving} type="submit" className="w-full bg-teal-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg hover:opacity-90 transition">
                 {saving ? 'Processing...' : (modal.mode === 'add' ? 'Assign Schedule' : 'Save Changes')}
              </button>
            </form>
          )}

          {modal.type === 'dayoff_action' && (
             <div className="space-y-6">
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                   <p className="text-xs font-black uppercase text-slate-500 mb-2">Request from</p>
                   <p className="font-bold text-slate-800 dark:text-white">Dr. {modal.data.doctor?.first_name} {modal.data.doctor?.last_name}</p>
                   <p className="text-sm text-teal-600 font-bold mt-1">
                     For {modal.data.dayoff_date}
                     {modal.data.is_half_day ? (
                       <span className="block text-xs font-black uppercase text-teal-500 mt-1">
                         ⏱️ Half Day: {formatTime12Hour(modal.data.start_time)} - {formatTime12Hour(modal.data.end_time)}
                       </span>
                     ) : (
                       <span className="block text-[10px] text-slate-400 mt-1 uppercase font-black">Full Day Request</span>
                     )}
                   </p>
                   <p className="text-xs italic text-slate-500 mt-2">"{modal.data.reason}"</p>
                </div>
                <div className="space-y-1">
                   <label className="text-xs font-black uppercase text-slate-500 ml-1">Admin Remarks</label>
                   <textarea 
                     rows={3} 
                     placeholder="Type your message to the doctor..."
                     className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-teal-500/20 transition-all resize-none"
                     onChange={e => modal.remarks = e.target.value}
                   />
                </div>
                <button 
                  onClick={() => handleDayOffAction(modal.data.dayoff_id, modal.mode, modal.remarks)}
                  className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg text-white transition ${modal.mode === 'approve' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-500 hover:bg-rose-600'}`}
                >
                  {modal.mode === 'approve' ? 'Approve & Notify' : 'Reject Request'}
                </button>
             </div>
          )}

          {modal.type === 'special' && (
            <form onSubmit={saveSpecialSchedule} className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <TextInput label="Title" placeholder="e.g. Christmas Day, Emergency Repair..." value={modal.data.title} onChange={v => setModal({...modal, data: {...modal.data, title: v}})} />
                  </div>
                  <TextInput label="Date" type="date" value={modal.data.date} onChange={v => setModal({...modal, data: {...modal.data, date: v}})} />
                  <SelectInput 
                    label="Event Type" 
                    value={modal.data.type} 
                    onChange={v => setModal({...modal, data: {...modal.data, type: v}})} 
                    options={['Holiday', 'Clinic Closed', 'Shortened Hours', 'Special Doctor Schedule', 'Emergency'].map(x => ({label:x,value:x}))} 
                  />
                  <SelectInput 
                    label="Applies To" 
                    value={modal.data.applies_to_type} 
                    onChange={v => setModal({...modal, data: {...modal.data, applies_to_type: v}})} 
                    options={['Whole Clinic', 'Specific Doctor', 'Specific Service'].map(x => ({label:x,value:x}))} 
                  />
                  {modal.data.applies_to_type === 'Specific Doctor' && (
                    <SelectInput label="Select Doctor" value={modal.data.applies_to_id} onChange={v => setModal({...modal, data: {...modal.data, applies_to_id: v}})} options={doctors.map(d => ({label:`Dr. ${d.last_name}`, value:d.doctor_id}))} />
                  )}
                  {modal.data.type === 'Shortened Hours' && (
                    <>
                      <TextInput label="Opening Time" type="time" value={modal.data.start_time} onChange={v => setModal({...modal, data: {...modal.data, start_time: v}})} />
                      <TextInput label="Closing Time" type="time" value={modal.data.end_time} onChange={v => setModal({...modal, data: {...modal.data, end_time: v}})} />
                    </>
                  )}
                  <div className="md:col-span-2">
                    <TextInput label="Reason/Description" value={modal.data.reason} onChange={v => setModal({...modal, data: {...modal.data, reason: v}})} />
                  </div>
                  <div className="md:col-span-2 flex items-center gap-3 bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl">
                     <input type="checkbox" className="w-5 h-5 accent-teal-600" checked={modal.data.notify_patients} onChange={e => setModal({...modal, data: {...modal.data, notify_patients: e.target.checked}})} />
                     <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Notify affected patients automatically</span>
                  </div>
               </div>
               <button disabled={saving} type="submit" className="w-full bg-slate-900 dark:bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg hover:opacity-90 transition">
                  {saving ? 'Processing...' : (modal.mode === 'add' ? 'Create Event' : 'Save Changes')}
               </button>
            </form>
          )}

          {formErrors.general && (
            <p className="mt-4 text-center text-xs font-black text-rose-500 uppercase tracking-widest animate-bounce">⚠️ {formErrors.general}</p>
          )}
        </Modal>
      )}

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 w-full max-w-md text-center shadow-2xl border border-slate-100 dark:border-slate-800">
              <div className="h-20 w-20 bg-rose-50 dark:bg-rose-900/30 text-rose-500 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-6 shadow-inner">
                <FaTrash/>
              </div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white leading-tight">Delete item?</h3>
              <p className="text-slate-500 mt-2 font-medium">Are you sure you want to delete <span className="text-slate-900 dark:text-slate-200 font-bold">"{confirmDelete.label}"</span>? This action cannot be undone.</p>
              
              <div className="flex gap-4 mt-10">
                <button onClick={() => setConfirmDelete(null)} className="flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition">Cancel</button>
                <button onClick={deleteScheduleItem} className="flex-1 bg-rose-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-rose-500/30 hover:bg-rose-600 transition">Yes, Delete</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
