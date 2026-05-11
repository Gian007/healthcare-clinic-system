import { useEffect, useState } from 'react';
import { Clock, CalendarDays } from 'lucide-react';
import { scheduleSeed } from '../../data/doctorSeed';
import { loadState, saveState } from '../../utils/storage';
import { Card, Badge, Button, PageHeader } from '../../components/doctor/DoctorUI';

export default function DoctorSchedule(){
 const [items,setItems]=useState(()=>loadState('doctor-schedule',scheduleSeed));
 useEffect(()=>saveState('doctor-schedule',items),[items]);
 const toggle=(id)=>setItems(items.map(i=>i.id===id?{...i,active:!i.active}:i));
 const work=items.filter(i=>i.active).length; const slots=items.reduce((s,i)=>s+i.slot_limit,0);
 return <div><PageHeader title="My Schedule" subtitle="View and manage your weekly working schedule" />
 <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">{items.map(d=>{const avail=d.slot_limit-d.booked; const pct=Math.min(100,(d.booked/d.slot_limit)*100); return <Card key={d.id} className="p-5"><div className="flex justify-between mb-8"><h2 className="text-xl font-bold">{d.day}</h2><button onClick={()=>toggle(d.id)}><Badge tone={d.active?'green':'gray'}>{d.active?'Active':'Inactive'}</Badge></button></div><p className="flex gap-2 items-center text-sm"><Clock size={16}/> {d.start} - {d.end}</p><p className="flex gap-2 items-center text-sm mt-3"><CalendarDays size={16}/> Slot Limit: {d.slot_limit} patients</p><div className="border-t border-slate-200 dark:border-slate-800 mt-4 pt-3"><div className="flex justify-between text-xs text-slate-500"><span>Booked: {d.booked}</span><span>Available: {avail}</span></div><div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full mt-2 overflow-hidden"><div className="h-full bg-teal-500" style={{width:`${pct}%`}} /></div></div></Card>})}</div>
 <Card className="p-6 mt-6 bg-teal-50 dark:bg-teal-500/10 border-teal-200 dark:border-teal-800"><div className="grid md:grid-cols-3 gap-5"><Stat label="Working Days" value={`${work} days/week`} /><Stat label="Total Slots/Week" value={`${slots} slots`} /><Stat label="Average Hours/Day" value="7.5 hours" /></div></Card></div>
}
function Stat({label,value}){return <div><p className="text-sm text-slate-500">{label}</p><p className="text-2xl font-bold">{value}</p></div>}
