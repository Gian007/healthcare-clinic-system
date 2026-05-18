import { useEffect, useState, useMemo } from "react";
import { PageHeader, Modal, Badge, TextInput, SelectInput } from "../../components/admin/AdminUI";
import * as adminApi from "../../api/adminApi";
import { useAdminSettings } from "../../state/adminSettings";
import { FaHospital, FaTrash, FaPen, FaCircle } from "react-icons/fa";

export default function AdminRooms() {
  const { settings, setSettings } = useAdminSettings();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [doctorSchedules, setDoctorSchedules] = useState([]);
  
  // Modals
  const [modal, setModal] = useState(null); // { mode, data }
  const [formErrors, setFormErrors] = useState({});

  // Memoized Rooms
  const rooms = useMemo(() => settings.rooms || [], [settings]);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const scheds = await adminApi.getDoctorSchedules();
      setDoctorSchedules(scheds || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const saveRoom = async (roomData) => {
    if (!roomData.name?.trim()) {
      alert("Room Name / Number is strictly required.");
      return;
    }
    setSaving(true);
    try {
      let updatedRooms = [];
      if (roomData.isEdit) {
        updatedRooms = rooms.map(r => r.id === roomData.id ? { id: r.id, name: roomData.name, purpose: roomData.purpose, status: roomData.status } : r);
      } else {
        updatedRooms = [...rooms, { id: Date.now().toString(), name: roomData.name, purpose: roomData.purpose, status: roomData.status }];
      }

      const res = await adminApi.updateSettings({ rooms: updatedRooms });
      setSettings(res.settings);
      setModal(null);
      alert(roomData.isEdit ? "Room details saved successfully." : "New Room registered successfully.");
    } catch (e) {
      console.error(e);
      alert("Failed to save room details.");
    } finally {
      setSaving(false);
    }
  };

  const deleteRoom = async (roomId) => {
    if (!window.confirm("Are you sure you want to delete this room? This will not affect existing historical schedule records but is recommended for future assignments.")) return;
    setSaving(true);
    try {
      const updatedRooms = rooms.filter(r => r.id !== roomId);
      const res = await adminApi.updateSettings({ rooms: updatedRooms });
      setSettings(res.settings);
      alert("Room deleted successfully.");
    } catch (e) {
      console.error(e);
      alert("Failed to delete room.");
    } finally {
      setSaving(false);
    }
  };

  // Calculate stats
  const activeCount = useMemo(() => rooms.filter(r => r.status === 'Active').length, [rooms]);
  const maintenanceCount = useMemo(() => rooms.filter(r => r.status === 'Maintenance').length, [rooms]);

  if (loading) return <div className="p-10 text-center animate-pulse text-slate-500">Loading rooms directory...</div>;

  return (
    <div className="pb-20">
      <PageHeader 
        title="Room Directory & Management" 
        subtitle="Configure physical consulting rooms and view active daily assignments."
      />

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-black uppercase text-slate-400 tracking-wider">Total Rooms</div>
          <div className="text-3xl font-black text-slate-800 dark:text-white mt-2">{rooms.length}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-black uppercase text-slate-400 tracking-wider">Active Rooms</div>
            <div className="text-3xl font-black text-teal-600 mt-2">{activeCount}</div>
          </div>
          <div className="h-3 w-3 rounded-full bg-teal-500 animate-pulse" />
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-black uppercase text-slate-400 tracking-wider">Under Maintenance</div>
            <div className="text-3xl font-black text-amber-500 mt-2">{maintenanceCount}</div>
          </div>
          <div className="h-3 w-3 rounded-full bg-amber-500" />
        </div>
      </div>

      <div className="flex justify-end mb-6">
        <button 
          onClick={() => setModal({ mode: 'add', data: { name: '', purpose: '', status: 'Active' } })}
          className="bg-teal-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:opacity-90 transition"
        >
          <FaHospital/> Register New Room
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {rooms.length === 0 ? (
          <div className="md:col-span-2 xl:col-span-3 py-20 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-300 mb-4">
              <FaHospital size={32}/>
            </div>
            <h4 className="text-lg font-bold text-slate-400">No rooms registered.</h4>
            <p className="text-sm text-slate-400 mt-1">Register rooms in the directory to assign them to doctors' schedules.</p>
          </div>
        ) : rooms.map(r => {
          // Find doctors scheduled in this room today
          const todayWeekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date().getDay()];
          const assignedSchedules = doctorSchedules.filter(s => s.room === r.name && s.day_of_week === todayWeekday && s.schedule_status === 'Active');

          return (
            <div key={r.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-teal-200 dark:hover:border-teal-900 transition-all group">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 rounded-2xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 text-xl shadow-inner">
                    <FaHospital/>
                  </div>
                  <Badge variant={r.status === 'Active' ? 'success' : 'neutral'}>{r.status}</Badge>
                </div>
                <h4 className="font-black text-lg text-slate-800 dark:text-white leading-tight">{r.name}</h4>
                <p className="text-sm text-slate-500 font-medium mt-1">{r.purpose || "No descriptive purpose provided."}</p>

                {/* Daily assignments summary */}
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Today's Occupants</div>
                  {assignedSchedules.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">No doctors scheduled today.</span>
                  ) : (
                    <div className="space-y-1.5">
                      {assignedSchedules.map(s => (
                        <div key={s.schedule_id} className="flex justify-between items-center text-xs bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl border border-slate-100 dark:border-slate-800/10">
                          <span className="font-bold text-slate-700 dark:text-slate-300">Dr. {s.doctor?.last_name}</span>
                          <span className="text-[10px] bg-teal-50 dark:bg-teal-950/30 text-teal-600 font-bold px-2 py-0.5 rounded-lg">{s.start_time.slice(0,5)} - {s.end_time.slice(0,5)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => setModal({ mode: 'edit', data: { ...r, isEdit: true } })}
                  className="p-2.5 bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition font-bold text-xs flex items-center gap-1.5"
                >
                  <FaPen size={12}/> Edit
                </button>
                <button 
                  onClick={() => deleteRoom(r.id)}
                  className="p-2.5 bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/30 transition font-bold text-xs flex items-center gap-1.5"
                >
                  <FaTrash size={12}/> Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Register/Edit Modal */}
      {modal && (
        <Modal 
          title={modal.mode === 'add' ? 'Register New Room' : 'Edit Room Details'} 
          onClose={() => setModal(null)}
        >
          <form onSubmit={(e) => { e.preventDefault(); saveRoom(modal.data); }} className="space-y-6">
            <div className="space-y-4">
              <TextInput 
                label="Room Name / Number" 
                placeholder="e.g. Room 101, Dental Suite A" 
                value={modal.data.name} 
                onChange={v => setModal({...modal, data: {...modal.data, name: v}})} 
              />
              <TextInput 
                label="Purpose / Details" 
                placeholder="e.g. General Consultations, Ultrasound" 
                value={modal.data.purpose} 
                onChange={v => setModal({...modal, data: {...modal.data, purpose: v}})} 
              />
              <SelectInput 
                label="Status" 
                value={modal.data.status} 
                onChange={v => setModal({...modal, data: {...modal.data, status: v}})} 
                options={[{label:'Active',value:'Active'},{label:'Maintenance',value:'Maintenance'}]} 
              />
            </div>
            <button disabled={saving} type="submit" className="w-full bg-teal-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg hover:opacity-90 transition">
              {saving ? 'Saving...' : (modal.mode === 'add' ? 'Register Room' : 'Save Changes')}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
