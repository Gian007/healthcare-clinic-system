import { useEffect, useMemo, useState } from "react";
import { Badge, Modal, PageHeader, SelectInput, TextInput, Toolbar } from "../../components/admin/AdminUI";
import * as adminApi from "../../api/adminApi";

const blank = { first_name:"", last_name:"", specialization_name:"General Medicine", license_number:"", contact_number:"", email:"", status:"Available", daily_booking_limit:20 };

export default function AdminDoctors() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(null);
  
  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const data = await adminApi.getDoctors();
      setRecords(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const list = useMemo(() => records.filter(d => JSON.stringify(d).toLowerCase().includes(query.toLowerCase())), [records, query]);
  
  const save = () => {
    // Save logic will use local state if full API not available
    setModal(null);
  };

  const toggleDayOff = async (d) => {
    try {
      const newStatus = d.status === "Day Off" ? "Available" : "Day Off";
      await adminApi.updateDoctorStatus(d.doctor_id, newStatus);
      fetchDoctors();
    } catch(e) { console.error(e); }
  }

  if (loading) return <div className="p-10 text-center">Loading doctors...</div>;

  return <div>
    <PageHeader title="Doctors" subtitle="Manage doctor profiles, specialization, booking limit, and availability." actionLabel="Add Doctor" onAction={()=>setModal({mode:"add", data:blank})}/>
    <Toolbar query={query} setQuery={setQuery} label="Search doctor, specialization, PRC license..." />
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      {list.map(d => <div key={d.doctor_id} className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex justify-between gap-3"><div><h2 className="text-lg font-bold">Dr. {d.first_name} {d.last_name}</h2><p className="text-sm text-slate-500 dark:text-slate-400">{d.specialization?.specialization_name} • {d.license_number}</p></div><Badge>{d.status}</Badge></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 text-sm"><p><b>Email:</b> {d.email}</p><p><b>Contact:</b> {d.contact_number}</p><p><b>Daily Limit:</b> {d.daily_booking_limit}</p><p><b>Created:</b> {new Date(d.created_at).toLocaleDateString()}</p></div>
        <div className="mt-5 flex flex-wrap gap-2"><button onClick={()=>setModal({mode:"edit",data:d})} className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors">Edit</button><button onClick={()=>toggleDayOff(d)} className="px-4 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors">{d.status === "Day Off" ? "Mark Available" : "Set Day Off"}</button></div>
      </div>)}
    </div>
    {modal && <Modal title={modal.mode === "add" ? "Add Doctor" : "Edit Doctor"} onClose={()=>setModal(null)}><div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <TextInput label="First Name" value={modal.data.first_name} onChange={v=>setModal({...modal,data:{...modal.data,first_name:v}})}/><TextInput label="Last Name" value={modal.data.last_name} onChange={v=>setModal({...modal,data:{...modal.data,last_name:v}})}/><SelectInput label="Specialization" value={modal.data.specialization?.specialization_name || "General Medicine"} onChange={v=>setModal({...modal,data:{...modal.data,specialization:{...modal.data.specialization, specialization_name:v}}})} options={["General Medicine","Pediatrics","Cardiology","Dermatology","ENT"]}/><TextInput label="PRC License" value={modal.data.license_number} onChange={v=>setModal({...modal,data:{...modal.data,license_number:v}})}/><TextInput label="Contact Number" value={modal.data.contact_number} onChange={v=>setModal({...modal,data:{...modal.data,contact_number:v}})}/><TextInput label="Email" value={modal.data.email} onChange={v=>setModal({...modal,data:{...modal.data,email:v}})}/><SelectInput label="Status" value={modal.data.status} onChange={v=>setModal({...modal,data:{...modal.data,status:v}})} options={["Available","Active","Day Off","Inactive"]}/><TextInput label="Daily Booking Limit" type="number" value={modal.data.daily_booking_limit} onChange={v=>setModal({...modal,data:{...modal.data,daily_booking_limit:Number(v)}})}/>
      <button onClick={save} className="md:col-span-2 rounded-xl bg-teal-500 hover:bg-teal-600 transition-colors text-white py-3">Save Changes</button></div></Modal>}
  </div>;
}
