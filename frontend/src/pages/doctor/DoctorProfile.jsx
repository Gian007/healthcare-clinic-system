import { useEffect, useState } from 'react';
import { User, FileText, Phone, Mail, CalendarDays, Camera } from 'lucide-react';
import { loadState, saveState } from '../../utils/storage';
import { Button, Card, PageHeader } from '../../components/doctor/DoctorUI';
import { useAuth } from '../../state/auth';

export default function DoctorProfile(){
 const { user } = useAuth();
 const [tab,setTab]=useState('profile'); 
 
 const [form,setForm]=useState(() => {
   const saved = loadState('doctor-profile', null);
   if (saved) return saved;
   return {
     full_name: user ? `Dr. ${user.first_name} ${user.last_name}` : '',
     specialization: user?.specialization?.specialization_name || 'General Medicine',
     doctor_id: user?.doctor_id || 'DOC-000',
     license_number: user?.license_number || '',
     contact_number: user?.contact_number || '',
     email: user?.email || '',
     daily_booking_limit: user?.daily_booking_limit || 20
   };
 });

 useEffect(()=>saveState('doctor-profile',form),[form]);
 const update=(key,val)=>setForm({...form,[key]:val});
 
 const initials = form.full_name ? form.full_name.replace('Dr. ', '').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'DR';

 return <div><PageHeader title="Profile & Settings" subtitle="Manage your profile and preferences" />
 <div className="bg-slate-200 dark:bg-slate-800 rounded-2xl p-1 grid grid-cols-2 mb-4"><button onClick={()=>setTab('profile')} className={`py-2 rounded-xl font-semibold ${tab==='profile'?'bg-white dark:bg-slate-900 shadow':''}`}>Profile</button><button onClick={()=>setTab('settings')} className={`py-2 rounded-xl font-semibold ${tab==='settings'?'bg-white dark:bg-slate-900 shadow':''}`}>Settings</button></div>
 {tab==='profile'?<Card className="p-6"><h2 className="font-bold mb-5">Personal Information</h2><div className="bg-teal-50 dark:bg-teal-500/10 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"><div className="flex items-center gap-5"><div className="w-20 h-20 rounded-full bg-teal-100 text-teal-700 grid place-items-center text-2xl font-bold">{initials}</div><div><h3 className="text-2xl font-bold">{form.full_name}</h3><p>{form.specialization}</p><p className="text-sm text-slate-500">ID: {form.doctor_id}</p></div></div><Button variant="outline" onClick={() => document.getElementById('photo-upload').click()}><Camera size={16} className="mr-2 inline" /> Change Photo</Button><input type="file" id="photo-upload" className="hidden" accept="image/*" onChange={() => alert("Photo upload ready for backend integration")} /></div><div className="grid md:grid-cols-2 gap-4"><Input icon={<User/>} label="Full Name" value={form.full_name} onChange={v=>update('full_name',v)}/><Input icon={<FileText/>} label="Specialization" value={form.specialization} onChange={v=>update('specialization',v)}/><Input icon={<FileText/>} label="License Number" value={form.license_number} onChange={v=>update('license_number',v)}/><Input icon={<Phone/>} label="Contact Number" value={form.contact_number} onChange={v=>update('contact_number',v)}/><Input icon={<Mail/>} label="Email Address" value={form.email} onChange={v=>update('email',v)}/><Input icon={<CalendarDays/>} label="Daily Booking Limit" value={form.daily_booking_limit} onChange={v=>update('daily_booking_limit',v)}/></div><div className="flex justify-end gap-3 mt-6"><Button variant="outline">Cancel</Button><Button onClick={()=>alert('Profile saved locally. Ready for PHP backend API.')}>Save Changes</Button></div></Card>:<Card className="p-6"><h2 className="font-bold mb-4">Settings</h2><div className="space-y-4"><label className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800"><span>Email Notifications</span><input type="checkbox" defaultChecked /></label><label className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800"><span>Queue Sound Alert</span><input type="checkbox" defaultChecked /></label><label className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800"><span>Auto-call next patient after completed</span><input type="checkbox" /></label></div></Card>}
 </div>
}
function Input({label,value,onChange,icon}){return <label><p className="font-semibold text-sm mb-2">{label}</p><div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl px-3"><span className="text-slate-400 [&>svg]:w-4">{icon}</span><input value={value} onChange={e=>onChange(e.target.value)} className="w-full bg-transparent py-3 outline-none text-sm"/></div></label>}
