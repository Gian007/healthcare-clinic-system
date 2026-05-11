import { useEffect, useState } from 'react';
import { CalendarX2, Plus } from 'lucide-react';
import { dayOffSeed } from '../../data/doctorSeed';
import { loadState, saveState } from '../../utils/storage';
import { Badge, Button, Card, Modal, PageHeader } from '../../components/doctor/DoctorUI';

export default function DoctorDayOff(){
 const [rows,setRows]=useState(()=>loadState('doctor-dayoff',dayOffSeed)); const [open,setOpen]=useState(false); const [form,setForm]=useState({date:'',reason:''});
 useEffect(()=>saveState('doctor-dayoff',rows),[rows]);
 const add=()=>{ if(!form.date||!form.reason)return alert('Complete date and reason'); setRows([{id:Date.now(),date:form.date,reason:form.reason,requested_on:new Date().toLocaleDateString(),status:'Pending'},...rows]); setForm({date:'',reason:''}); setOpen(false); };
 const count=s=>rows.filter(r=>r.status===s).length;
 return <div><PageHeader title="Day Off Requests" subtitle="Manage your day off requests" action={<Button onClick={()=>setOpen(true)}><Plus size={16} className="inline mr-2"/>Request Day Off</Button>} />
 <div className="grid md:grid-cols-3 gap-4 mb-6"><Stat title="Pending" value={count('Pending')} tone="yellow"/><Stat title="Approved" value={count('Approved')} tone="green"/><Stat title="Rejected" value={count('Rejected')} tone="red"/></div>
 <Card className="p-5 overflow-x-auto"><h2 className="font-bold mb-5">Request History</h2><table className="w-full text-sm min-w-[700px]"><thead><tr className="text-left text-slate-500 border-b dark:border-slate-800"><th className="py-3">Date</th><th>Reason</th><th>Requested On</th><th>Status</th><th></th></tr></thead><tbody>{rows.map(r=><tr key={r.id} className="border-b dark:border-slate-800"><td className="py-4">{r.date}</td><td>{r.reason}</td><td>{r.requested_on}</td><td><Badge tone={r.status==='Approved'?'green':r.status==='Rejected'?'red':'yellow'}>{r.status}</Badge></td><td><Button variant="ghost" onClick={()=>setRows(rows.filter(x=>x.id!==r.id))}>Remove</Button></td></tr>)}</tbody></table></Card>
 {open&&<Modal title="Request Day Off" onClose={()=>setOpen(false)}><div className="space-y-3"><input type="date" className="w-full p-3 rounded-xl border dark:bg-slate-800 dark:border-slate-700" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/><textarea placeholder="Reason" className="w-full p-3 rounded-xl border dark:bg-slate-800 dark:border-slate-700" value={form.reason} onChange={e=>setForm({...form,reason:e.target.value})}/><Button onClick={add} className="w-full">Submit Request</Button></div></Modal>}
 </div>
}
function Stat({title,value,tone}){return <Card className="p-5 flex justify-between"><div><p className="text-sm text-slate-500">{title}</p><p className="text-2xl font-bold">{value}</p></div><CalendarX2 className={tone==='red'?'text-red-500':tone==='green'?'text-green-500':'text-yellow-500'}/></Card>}
