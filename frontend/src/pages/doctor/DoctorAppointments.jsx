import { useEffect, useMemo, useState } from 'react';
import { PlayCircle, CheckCircle2, Search, Calendar, User, Clock, Check, X } from 'lucide-react';
import { getAppointments, updateAppointmentStatus } from '../../api/doctorApi';
import { Badge, Button, Card, Modal, PageHeader } from '../../components/doctor/DoctorUI';

export default function DoctorAppointments(){
 const [rows, setRows] = useState([]);
 const [q, setQ] = useState('');
 const [loading, setLoading] = useState(true);
 const [doneModal, setDoneModal] = useState(null);
 const [reason, setReason] = useState('');
 const [isCompleted, setIsCompleted] = useState(true);

 useEffect(() => {
   loadAppointments();
 }, []);

 const loadAppointments = async () => {
   setLoading(true);
   try {
     const data = await getAppointments();
     setRows(data);
   } catch (error) {
     console.error("Failed to load appointments:", error);
   } finally {
     setLoading(false);
   }
 };

 const filtered = useMemo(() => rows.filter(r => 
   `${r.patient?.first_name} ${r.patient?.last_name} ${r.service?.service_name} ${r.booking_status}`.toLowerCase().includes(q.toLowerCase())
 ), [rows, q]);

 const handleStatusUpdate = async (id, status, reasonText = null) => {
   try {
     await updateAppointmentStatus(id, { status, reason: reasonText });
     setRows(rows.map(r => r.appointment_id === id ? { ...r, booking_status: status, completion_note: reasonText } : r));
   } catch (error) {
     console.error("Failed to update status:", error);
   }
 };

 const handleComplete = async () => {
   if (!isCompleted && !reason) return alert("Please select a reason");
   const finalStatus = isCompleted ? 'Completed' : (reason === 'No show' ? 'No Show' : 'Cancelled');
   await handleStatusUpdate(doneModal.appointment_id, finalStatus, isCompleted ? null : reason);
   setDoneModal(null);
   setReason('');
 };
 return <div><PageHeader title="Appointments" subtitle="Manage your patient appointments" />
 <Card className="p-5 overflow-x-auto"><div className="flex flex-col md:flex-row justify-between gap-3 mb-6"><h2 className="font-bold">All Appointments</h2><div className="relative"><Search size={16} className="absolute left-3 top-3 text-slate-400"/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search patients..." className="pl-10 pr-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 outline-none w-full md:w-72"/></div></div>
 {loading ? <div className="text-center py-10">Loading...</div> :      <table className="w-full text-sm min-w-[900px]">
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
          {filtered.map(r => (
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
                      <span className="text-teal-600 dark:text-teal-400 font-bold text-[10px]">{(r.patient?.first_name?.[0] || "") + (r.patient?.last_name?.[0] || "")}</span>
                    )}
                  </div>
                  <div>
                    <div className="text-slate-900 dark:text-white leading-tight">{r.patient?.first_name} {r.patient?.last_name}</div>
                    <div className="text-[10px] text-slate-500 font-bold tracking-tighter uppercase">{r.patient?.patient_number}</div>
                  </div>
                </div>
              </td>
              <td>{r.service?.service_name}</td>
              <td>{r.appointment_date}</td>
              <td>{r.start_time}</td>
              <td><Badge tone={r.booking_status==='Pending'?'yellow':r.booking_status==='Completed'?'green':'blue'}>{r.booking_status}</Badge></td>
              <td className="text-xs text-slate-500 max-w-[150px] truncate">{r.completion_note || '-'}</td>
              <td className="py-3">
                <div className="flex gap-2">
                  <button onClick={()=>handleStatusUpdate(r.appointment_id,'Confirmed')} title="Called" className="text-teal-600 hover:text-teal-800 bg-teal-50 dark:bg-teal-900/20 p-2 rounded-lg transition-colors"><PlayCircle size={18}/></button>
                  <button onClick={()=>{setDoneModal(r); setIsCompleted(true);}} title="Done" className="text-green-600 hover:text-green-800 bg-green-50 dark:bg-green-900/20 p-2 rounded-lg transition-colors"><CheckCircle2 size={18}/></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
 }
 </Card>
 
 {doneModal && (
   <Modal title="Appointment Completion" onClose={() => setDoneModal(null)}>
     <div className="space-y-4 text-sm">
       <p className="text-lg font-semibold text-center mb-6">Is the appointment completed?</p>
       <div className="flex gap-4 mb-6">
         <button onClick={() => setIsCompleted(true)} className={`flex-1 py-3 rounded-xl border-2 font-semibold ${isCompleted ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-200 text-slate-500'}`}>Yes, Completed</button>
         <button onClick={() => setIsCompleted(false)} className={`flex-1 py-3 rounded-xl border-2 font-semibold ${!isCompleted ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-200 text-slate-500'}`}>No, Incomplete</button>
       </div>
       
       {!isCompleted && (
         <div className="space-y-2 mb-6">
           <label className="font-semibold block mb-2">Reason for incompletion:</label>
           {['No show', 'Incomplete', 'Reschedule', 'Others'].map(res => (
             <label key={res} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
               <input type="radio" name="reason" value={res} checked={reason === res} onChange={() => setReason(res)} className="w-4 h-4 text-primary" />
               <span>{res}</span>
             </label>
           ))}
         </div>
       )}
       
       <div className="flex gap-3">
         <Button variant="outline" className="flex-1" onClick={() => setDoneModal(null)}>Cancel</Button>
         <Button className="flex-1" onClick={handleComplete}>Confirm</Button>
       </div>
     </div>
   </Modal>
 )}
 </div>
}
function Stat({title,value}){return <Card className="p-5"><p className="text-sm text-slate-500">{title}</p><p className="text-2xl font-bold mt-2">{value}</p></Card>}
