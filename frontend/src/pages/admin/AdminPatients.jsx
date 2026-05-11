import { useEffect, useMemo, useState } from "react";
import { Badge, Modal, PageHeader, SelectInput, TextInput, Toolbar } from "../../components/admin/AdminUI";
import * as adminApi from "../../api/adminApi";

const blank = { patient_number:"", first_name:"", last_name:"", middle_name:"", birth_date:"", sex:"Male", contact_number:"", email:"", address:"", registration_type:"Online", account_status:"Active", verification_status:"Pending" };

export default function AdminPatients(){
 const [records, setRecords] = useState([]);
 const [loading, setLoading] = useState(true);
 const [query,setQuery]=useState(""); const [modal,setModal]=useState(null); const [notice,setNotice]=useState("");
 
 useEffect(() => {
   fetchPatients();
 }, []);

 const fetchPatients = async () => {
   try {
     const data = await adminApi.getPatients();
     setRecords(data);
   } catch (e) {
     console.error(e);
   } finally {
     setLoading(false);
   }
 }

 const list=useMemo(()=>records.filter(p=>JSON.stringify(p).toLowerCase().includes(query.toLowerCase())),[records,query]);
 const save=()=>{ 
     // Save logic will use local state if full API not available
     setModal(null); 
 };
 const warn= async (p)=>{ 
     try {
         await adminApi.updatePatientStatus(p.patient_id, 'Suspended');
         setNotice(`Warning sent to ${p.first_name} ${p.last_name}: Please follow clinic queue and appointment policy.`); 
         fetchPatients();
     } catch (e) { console.error(e); }
 };
 
 if (loading) return <div className="p-10 text-center">Loading patients...</div>;

 return (
    <div>
      <PageHeader 
        title="Patient Accounts" 
        subtitle="View, verify, edit, delete, or send warning to patient accounts." 
        actionLabel="Add Patient" 
        onAction={()=>setModal({mode:"add",data:blank})}
      />
      
      {notice && (
        <div className="mb-4 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 p-4 flex justify-between">
          <span>{notice}</span>
          <button onClick={()=>setNotice("")}>×</button>
        </div>
      )}
      
      <Toolbar query={query} setQuery={setQuery} label="Search patient name, email, number, status..." />
      
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 overflow-x-auto shadow-sm">
        <table className="w-full text-sm min-w-[1000px]">
          <thead className="text-left bg-slate-50 dark:bg-slate-800 text-slate-500">
            <tr>
              <th className="p-4 w-32">Patient No.</th>
              <th className="p-4 min-w-[200px]">Name</th>
              <th className="p-4">Contact</th>
              <th className="p-4 whitespace-nowrap">Registration</th>
              <th className="p-4 whitespace-nowrap">Account</th>
              <th className="p-4 whitespace-nowrap">Verification</th>
              <th className="p-4 min-w-[180px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map(p => (
              <tr key={p.patient_id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="p-4 font-semibold">{p.patient_number}</td>
                <td className="p-4">
                  {p.first_name} {p.middle_name} {p.last_name}<br/>
                  <span className="text-xs text-slate-500">{p.address}</span>
                </td>
                <td className="p-4">
                  {p.email}<br/>
                  <span className="text-xs text-slate-500">{p.contact_number}</span>
                </td>
                <td className="p-4">{p.registration_type}</td>
                <td className="p-4"><Badge>{p.account_status}</Badge></td>
                <td className="p-4"><Badge>{p.verification_status}</Badge></td>
                <td className="p-4">
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={()=>setModal({mode:"edit",data:p})} className="px-3 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors">Edit</button>
                    <button onClick={()=>warn(p)} className="px-3 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors">Warn/Suspend</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title={modal.mode==="add"?"Add Patient":"Edit Patient"} onClose={()=>setModal(null)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput label="First Name" value={modal.data.first_name} onChange={v=>setModal({...modal,data:{...modal.data,first_name:v}})}/>
            <TextInput label="Last Name" value={modal.data.last_name} onChange={v=>setModal({...modal,data:{...modal.data,last_name:v}})}/>
            <TextInput label="Middle Name" value={modal.data.middle_name} onChange={v=>setModal({...modal,data:{...modal.data,middle_name:v}})}/>
            <TextInput label="Birth Date" type="date" value={modal.data.birth_date} onChange={v=>setModal({...modal,data:{...modal.data,birth_date:v}})}/>
            <SelectInput label="Sex" value={modal.data.sex} onChange={v=>setModal({...modal,data:{...modal.data,sex:v}})} options={["Male","Female"]}/>
            <TextInput label="Contact Number" value={modal.data.contact_number} onChange={v=>setModal({...modal,data:{...modal.data,contact_number:v}})}/>
            <TextInput label="Email" value={modal.data.email} onChange={v=>setModal({...modal,data:{...modal.data,email:v}})}/>
            <TextInput label="Address" value={modal.data.address} onChange={v=>setModal({...modal,data:{...modal.data,address:v}})}/>
            <SelectInput label="Account Status" value={modal.data.account_status} onChange={v=>setModal({...modal,data:{...modal.data,account_status:v}})} options={["Active","Suspended","Inactive"]}/>
            <SelectInput label="Verification" value={modal.data.verification_status} onChange={v=>setModal({...modal,data:{...modal.data,verification_status:v}})} options={["Approved","Pending","Rejected"]}/>
            <button onClick={save} className="md:col-span-2 rounded-xl bg-teal-500 text-white py-3 hover:bg-teal-600 transition-colors">Save Changes</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
