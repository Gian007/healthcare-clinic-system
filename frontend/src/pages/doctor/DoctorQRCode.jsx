import { useState } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { Button, Card, PageHeader } from '../../components/doctor/DoctorUI';

export default function DoctorQRCode(){
 const [code,setCode]=useState('DOC-12345');
 const regenerate=()=>setCode('DOC-'+Math.floor(10000+Math.random()*90000));
 const download=()=>{ const blob=new Blob([`Doctor QR Code ID: ${code}`],{type:'text/plain'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`${code}-qr.txt`; a.click(); URL.revokeObjectURL(url); };
 return <div><PageHeader title="Doctor QR Code" subtitle="QR code for patient queue activation" />
 <div className="grid lg:grid-cols-2 gap-6"><Card className="p-6"><h2 className="font-bold mb-5">Your QR Code</h2><div className="border dark:border-slate-800 rounded-2xl p-8 grid place-items-center"><div className="w-64 h-64 rounded-2xl bg-slate-100 dark:bg-slate-800 grid place-items-center text-center"><div className="text-8xl text-slate-300">▦</div><p className="text-xs text-slate-400">QR Code Preview</p></div></div><p className="text-center text-sm text-slate-500 mt-5">QR Code ID</p><p className="text-center font-bold text-xl">{code}</p><div className="grid sm:grid-cols-2 gap-3 mt-6"><Button onClick={download}><Download size={16} className="inline mr-2"/>Download QR</Button><Button variant="outline" onClick={regenerate}><RefreshCw size={16} className="inline mr-2"/>Regenerate</Button></div></Card>
 <Card className="p-6"><h2 className="font-bold mb-5">Doctor Information</h2><div className="bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-800 rounded-2xl p-5 flex gap-4"><div className="w-14 h-14 rounded-full bg-teal-100 text-teal-700 grid place-items-center font-bold">S</div><div><p className="font-bold text-lg">Dr. Sarah Johnson</p><p className="text-slate-500">Cardiology</p></div></div><Info label="License Number" value="MD-2024-5678"/><Info label="Clinic Location" value="Building A, 2nd Floor, Room 204"/><Info label="Doctor ID" value={code}/></Card></div>
 <Card className="p-6 mt-6"><h2 className="font-bold mb-5">How to Use QR Code</h2><div className="grid md:grid-cols-3 gap-4"><Step n="1" title="Download QR Code" desc="Download and print your unique QR code"/><Step n="2" title="Display at Clinic" desc="Place the QR code at clinic entrance or waiting area"/><Step n="3" title="Patients Scan" desc="Patients scan to activate their queue number"/></div></Card>
 </div>
}
function Info({label,value}){return <div className="mt-5"><p className="text-xs uppercase text-slate-500">{label}</p><p className="font-bold mt-1">{value}</p></div>}
function Step({n,title,desc}){return <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl text-center"><div className="w-12 h-12 rounded-full bg-teal-100 text-teal-700 grid place-items-center font-bold mx-auto mb-4">{n}</div><h3 className="font-bold">{title}</h3><p className="text-sm text-slate-500 mt-2">{desc}</p></div>}
