import { useEffect, useMemo, useState } from "react";
import { Badge, Modal, PageHeader, SelectInput, TextInput, Toolbar } from "../../components/admin/AdminUI";
import * as adminApi from "../../api/adminApi";
import { FaIdCard, FaCamera, FaImage, FaCheckCircle, FaTimesCircle, FaExclamationTriangle } from "react-icons/fa";

const blank = { patient_number:"", first_name:"", last_name:"", middle_name:"", birth_date:"", sex:"Male", contact_number:"", email:"", address:"", registration_type:"Online", account_status:"Active", verification_status:"Pending" };

export default function AdminPatients(){
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query,setQuery]=useState(""); 
  const [modal,setModal]=useState(null); 
  const [notice,setNotice]=useState("");
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [expandVerify, setExpandVerify] = useState(false);
  
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectNote, setRejectNote] = useState("");

  const commonReasons = [
    "Image is blurred or unreadable",
    "Missing Front/Back side of ID",
    "Selfie is not clear or missing",
    "ID does not match profile name",
    "ID is expired",
    "Incorrect ID type submitted",
    "Others (Specify below)"
  ];
  
  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getPatients();
      setRecords(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const list = useMemo(() => 
    records.filter(p => 
      `${p.first_name} ${p.last_name} ${p.patient_number} ${p.email}`.toLowerCase().includes(query.toLowerCase())
    ), [records, query]
  );

  const save = async () => {
    try {
      setSaving(true);
      await adminApi.updatePatient(modal.data.patient_id, modal.data);
      setNotice(`Patient ${modal.data.first_name} updated successfully.`);
      setModal(null);
      fetchPatients();
    } catch (e) {
      alert("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleVerify = async (action) => {
    let finalReason = null;
    if (action === 'reject') {
      if (!rejectReason) { alert("Please select a reason for rejection."); return; }
      finalReason = rejectReason === "Others (Specify below)" ? rejectNote : `${rejectReason}${rejectNote ? ': ' + rejectNote : ''}`;
      if (!finalReason) { alert("Please provide a specific reason."); return; }
    }

    try {
      setVerifying(true);
      await adminApi.processVerification(modal.data.patient_id, { action, reason: finalReason });
      const data = await adminApi.getPatients();
      setRecords(data);
      const updated = data.find(p => p.patient_id === modal.data.patient_id);
      if (updated) setModal({ ...modal, data: updated });
      setShowRejectBox(false);
    } catch (error) {
      alert("Failed to process verification");
    } finally {
      setVerifying(false);
    }
  };

  const warn = async (p) => { 
    try {
      await adminApi.updatePatientStatus(p.patient_id, { status: 'Suspended' });
      setNotice(`Warning sent to ${p.first_name} ${p.last_name}: Please follow clinic policy.`); 
      fetchPatients();
    } catch (e) { console.error(e); }
  };
  
  if (loading) return <div className="p-10 text-center text-teal-600 font-bold">Loading patient records...</div>;

  return (
    <div>
      <PageHeader 
        title="Patient Accounts" 
        subtitle="Comprehensive management of patient records and identity verifications." 
        actionLabel="Add Patient" 
        onAction={()=>setModal({mode:"add",data:blank})}
      />
      
      {notice && (
        <div className="mb-4 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 p-4 flex justify-between items-center shadow-sm border border-emerald-200 dark:border-emerald-800 animate-in fade-in slide-in-from-top-2">
          <span className="font-medium">{notice}</span>
          <button onClick={()=>setNotice("")} className="text-xl hover:opacity-70 transition">×</button>
        </div>
      )}
      
      <Toolbar query={query} setQuery={setQuery} label="Search patient by name, ID, or email..." />
      
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 overflow-x-auto shadow-sm">
        <table className="w-full text-sm min-w-[1000px]">
          <thead className="text-left bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800">
            <tr>
              <th className="p-4">Patient No.</th>
              <th className="p-4">Full Name</th>
              <th className="p-4">Contact Details</th>
              <th className="p-4">Account</th>
              <th className="p-4">Verification</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map(p => (
              <tr key={p.patient_id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="p-4 font-mono text-teal-600 dark:text-teal-400 font-bold">{p.patient_number || 'PENDING'}</td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-teal-100 dark:bg-teal-900/40 border border-teal-200 dark:border-teal-800 flex items-center justify-center shrink-0 overflow-hidden">
                      {p.profile_picture ? (
                        <img 
                          src={`${import.meta.env.VITE_BACKEND_URL}/storage/${p.profile_picture}`} 
                          className="w-full h-full object-cover" 
                          onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${p.first_name}+${p.last_name}&background=random`; }}
                        />
                      ) : (
                        <span className="text-teal-600 dark:text-teal-400 font-bold text-xs">{(p.first_name?.[0] || "") + (p.last_name?.[0] || "")}</span>
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white leading-none">{p.first_name} {p.last_name}</div>
                      <div className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-tighter">{p.sex} • {p.birth_date}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-slate-500">
                  <div className="text-xs">{p.email}</div>
                  <div className="text-[10px] mt-0.5">{p.contact_number}</div>
                </td>
                <td className="p-4">
                  <Badge variant={p.account_status === 'Active' ? 'success' : 'warning'}>{p.account_status}</Badge>
                </td>
                <td className="p-4">
                  <Badge variant={p.verification_status === 'Approved' ? 'success' : (p.verification_status === 'Rejected' ? 'danger' : 'warning')}>
                    {p.verification_status}
                  </Badge>
                </td>
                <td className="p-4">
                  <div className="flex gap-2 justify-center">
                    <button onClick={()=>{ setExpandVerify(false); setShowRejectBox(false); setModal({mode:"edit",data:p}); }} className="px-4 py-1.5 rounded-xl bg-teal-600 text-white text-[10px] font-bold hover:bg-teal-700 transition shadow-sm">MANAGE</button>
                    <button onClick={()=>warn(p)} className="px-4 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold hover:bg-amber-100 hover:text-amber-700 transition">WARN</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title={modal.mode==="add"?"Add Patient":"Account Management"} onClose={()=>setModal(null)}>
          <div className="space-y-6 overflow-y-auto max-h-[75vh] pr-2 custom-scrollbar">
            {modal.mode === "edit" && (
              <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 mb-2">
                <div className="h-16 w-16 rounded-full bg-teal-100 dark:bg-teal-900/40 border-2 border-white dark:border-slate-700 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                  {modal.data.profile_picture ? (
                    <img 
                      src={`${import.meta.env.VITE_BACKEND_URL}/storage/${modal.data.profile_picture}`} 
                      className="w-full h-full object-cover" 
                      onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${modal.data.first_name}+${modal.data.last_name}&background=random`; }}
                    />
                  ) : (
                    <span className="text-teal-600 dark:text-teal-400 font-bold text-lg">{(modal.data.first_name?.[0] || "") + (modal.data.last_name?.[0] || "")}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">{modal.data.first_name} {modal.data.last_name}</h3>
                  <p className="text-xs text-teal-600 dark:text-teal-400 font-bold uppercase tracking-widest">{modal.data.patient_number || 'No Patient ID'}</p>
                  <p className="text-[10px] text-slate-500 mt-1 italic">Member since {new Date(modal.data.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextInput label="First Name" value={modal.data.first_name} onChange={v=>setModal({...modal,data:{...modal.data,first_name:v}})}/>
              <TextInput label="Last Name" value={modal.data.last_name} onChange={v=>setModal({...modal,data:{...modal.data,last_name:v}})}/>
              <TextInput label="Date of Birth" type="date" value={modal.data.birth_date} onChange={v=>setModal({...modal,data:{...modal.data,birth_date:v}})}/>
              <SelectInput label="Sex" value={modal.data.sex} onChange={v=>setModal({...modal,data:{...modal.data,sex:v}})} options={["Male","Female", "Other"]}/>
              <TextInput label="Phone Number" value={modal.data.contact_number} onChange={v=>setModal({...modal,data:{...modal.data,contact_number:v}})}/>
              <TextInput label="Email Address" value={modal.data.email} onChange={v=>setModal({...modal,data:{...modal.data,email:v}})}/>
              <div className="md:col-span-2">
                <TextInput label="Home Address" value={modal.data.address} onChange={v=>setModal({...modal,data:{...modal.data,address:v}})}/>
              </div>
              <SelectInput label="Account Status" value={modal.data.account_status} onChange={v=>setModal({...modal,data:{...modal.data,account_status:v}})} options={["Active","Suspended","Inactive"]}/>
            </div>

            {/* Verification Section */}
            <div className="bg-slate-50 dark:bg-slate-800/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 flex items-center justify-center text-xl">
                    <FaIdCard />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Identity Verification</h4>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{modal.data.verification_status}</p>
                  </div>
                </div>
                <button onClick={() => setExpandVerify(!expandVerify)} className="text-xs font-bold text-teal-600 hover:underline px-4 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  {expandVerify ? "Hide Review" : "Review Docs"}
                </button>
              </div>

              {expandVerify && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-5 animate-in slide-in-from-top-2">
                  {modal.data.patient_verification ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          { label: 'Front of ID', field: 'id_image', icon: <FaImage /> },
                          { label: 'Back of ID', field: 'id_back_image', icon: <FaImage /> },
                          { label: 'Selfie + ID', field: 'selfie_image', icon: <FaCamera /> }
                        ].map(img => (
                          <div key={img.field}>
                            <p className="text-[9px] font-bold text-slate-500 mb-2 uppercase tracking-tight">{img.label}</p>
                            <div className="aspect-[4/3] rounded-xl bg-slate-200 dark:bg-slate-900 overflow-hidden border border-slate-200 dark:border-slate-700 group relative">
                              {modal.data.patient_verification[img.field] ? (
                                <>
                                  <img 
                                    src={`${import.meta.env.VITE_BACKEND_URL}/storage/${modal.data.patient_verification[img.field]}`} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                  />
                                  <button 
                                    onClick={() => window.open(`${import.meta.env.VITE_BACKEND_URL}/storage/${modal.data.patient_verification[img.field]}`)}
                                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition">
                                    Click to Enlarge
                                  </button>
                                </>
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                                  <span className="text-2xl mb-1">{img.icon}</span>
                                  <span className="text-[9px] font-bold">MISSING</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {modal.data.verification_status !== 'Approved' && !showRejectBox && (
                        <div className="flex gap-3 pt-2">
                          <button onClick={() => handleVerify('approve')} disabled={verifying} className="flex-1 py-3 rounded-2xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition shadow-lg shadow-teal-600/20">APPROVE DOCUMENTS</button>
                          <button onClick={() => setShowRejectBox(true)} className="flex-1 py-3 rounded-2xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition shadow-lg shadow-rose-600/20">REJECT / FLAG</button>
                        </div>
                      )}

                      {showRejectBox && (
                        <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900 animate-in zoom-in-95">
                           <div className="flex justify-between items-center mb-4">
                             <h5 className="text-xs font-bold text-rose-600 flex items-center gap-2"><FaExclamationTriangle /> Select Rejection Reason</h5>
                             <button onClick={() => setShowRejectBox(false)} className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter hover:underline">Cancel</button>
                           </div>
                           <select 
                             value={rejectReason}
                             onChange={(e) => setRejectReason(e.target.value)}
                             className="w-full p-3 rounded-xl border border-rose-200 dark:border-rose-800 bg-white dark:bg-slate-900 text-xs mb-3 outline-none focus:ring-2 focus:ring-rose-500/20 transition"
                           >
                             <option value="">Choose a reason...</option>
                             {commonReasons.map(r => <option key={r} value={r}>{r}</option>)}
                           </select>
                           <textarea 
                             placeholder="Type additional notes here... (Patient will see this)"
                             value={rejectNote}
                             onChange={(e) => setRejectNote(e.target.value)}
                             className="w-full p-3 rounded-xl border border-rose-200 dark:border-rose-800 bg-white dark:bg-slate-900 text-xs outline-none focus:ring-2 focus:ring-rose-500/20 mb-4 transition"
                             rows={2}
                           />
                           <button 
                             onClick={() => handleVerify('reject')}
                             disabled={verifying}
                             className="w-full py-3 bg-rose-600 text-white rounded-2xl text-xs font-bold hover:bg-rose-700 transition shadow-lg shadow-rose-600/20">
                             SUBMIT REJECTION
                           </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8">
                       <FaIdCard className="text-3xl text-slate-200 dark:text-slate-800 mx-auto mb-2" />
                       <p className="text-xs italic text-slate-400">Patient has not submitted any verification documents.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button onClick={save} disabled={saving} className="w-full rounded-2xl bg-slate-900 dark:bg-teal-600 text-white py-4 font-bold hover:opacity-90 transition shadow-xl shadow-slate-900/20 dark:shadow-teal-600/20 disabled:opacity-50">
              {saving ? 'UPDATING RECORD...' : 'SAVE ALL CHANGES'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
