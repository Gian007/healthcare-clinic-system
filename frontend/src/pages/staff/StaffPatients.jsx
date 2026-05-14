import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import StaffTableBadge from "../../components/staff/StaffTableBadge";
import * as staffApi from "../../api/staffApi";
import { FaIdCard, FaCamera, FaImage, FaCheckCircle, FaTimesCircle, FaChevronDown, FaExclamationTriangle } from "react-icons/fa";

export default function StaffPatients() {
  const { dark } = useOutletContext();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showModal, setShowModal] = useState(false);
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

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data = await staffApi.getPatients();
      setPatients(data || []);
    } catch (error) {
      console.error("Failed to fetch patients:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleAction = async (patient) => {
    try {
      const data = await staffApi.getPatient(patient.patient_id);
      setSelectedPatient(data);
      setExpandVerify(false);
      setShowRejectBox(false);
      setRejectReason("");
      setRejectNote("");
      setShowModal(true);
    } catch (error) {
      alert("Failed to load patient details");
    }
  };

  const handleUpdate = async () => {
    try {
      setSaving(true);
      await staffApi.updatePatient(selectedPatient.patient_id, {
        account_status: selectedPatient.account_status,
        first_name: selectedPatient.first_name,
        last_name: selectedPatient.last_name,
        contact_number: selectedPatient.contact_number,
        address: selectedPatient.address,
        sex: selectedPatient.sex
      });
      setShowModal(false);
      fetchPatients();
    } catch (error) {
      alert("Failed to update patient");
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
      await staffApi.processVerification(selectedPatient.patient_id, { action, reason: finalReason });
      const updated = await staffApi.getPatient(selectedPatient.patient_id);
      setSelectedPatient(updated);
      setShowRejectBox(false);
      fetchPatients();
    } catch (error) {
      alert("Failed to process verification");
    } finally {
      setVerifying(false);
    }
  };

  const pageTitle = dark ? "text-white" : "text-gray-900";
  const muted = dark ? "text-gray-400" : "text-gray-500";
  const card = dark
    ? "bg-gray-900 border-gray-800 text-white"
    : "bg-white border-gray-200 text-gray-900";
  const input = dark
    ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
    : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400";
  const tableHead = dark ? "bg-gray-800 text-gray-300" : "bg-gray-50 text-gray-500";
  const divide = dark ? "divide-gray-800" : "divide-gray-100";

  const filtered = patients.filter(p => 
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    (p.patient_number || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.contact_number || "").includes(search)
  );

  return (
    <div>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className={`text-2xl font-semibold ${pageTitle}`}>Patients</h1>
          <p className={`text-sm ${muted}`}>Manage patient records and verify IDs</p>
        </div>
      </div>

      <div className={`mt-6 rounded-2xl border p-4 shadow-sm ${card}`}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by patient ID, name, or phone number..."
          className={`mb-4 w-full rounded-lg border px-4 py-2 text-sm ${input}`}
        />

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className={tableHead}>
              <tr>
                <th className="px-4 py-3">Patient ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Gender</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>

            <tbody className={`divide-y ${divide}`}>
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">Loading patients...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">No patients found.</td></tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.patient_id} className="hover:bg-teal-50/30 dark:hover:bg-teal-900/10 transition-colors">
                    <td className="px-4 py-3 font-medium font-mono text-teal-600 dark:text-teal-400">{p.patient_number || 'N/A'}</td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-teal-100 dark:bg-teal-900/40 border border-teal-200 dark:border-teal-800 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                          {p.profile_picture ? (
                            <img 
                              src={`${import.meta.env.VITE_BACKEND_URL}/storage/${p.profile_picture}`} 
                              className="w-full h-full object-cover" 
                              onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${p.first_name}+${p.last_name}&background=random`; }}
                            />
                          ) : (
                            <span className="text-teal-600 dark:text-teal-400 font-bold text-[10px]">{(p.first_name?.[0] || "") + (p.last_name?.[0] || "")}</span>
                          )}
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white leading-tight">{p.first_name} {p.last_name}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3">{p.sex || 'N/A'}</td>
                    <td className="px-4 py-3">{p.contact_number || 'N/A'}</td>

                    <td className="px-4 py-3">
                      <StaffTableBadge status={p.account_status} />
                    </td>

                    <td className="px-4 py-3">
                      <button 
                        onClick={() => handleAction(p)}
                        className="px-4 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition shadow-sm">
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Unified Manage Modal */}
      {showModal && selectedPatient && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ${card}`}>
            <div className="p-6 border-b dark:border-gray-800 flex justify-between items-center bg-teal-600 text-white">
              <div>
                <h2 className="text-xl font-bold">Patient Management</h2>
                <p className="text-xs text-teal-100 mt-1">{selectedPatient.patient_number}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="h-8 w-8 grid place-items-center rounded-full hover:bg-white/20 transition-colors">✕</button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh] custom-scrollbar">
              {/* Profile Header */}
              <div className={`flex items-center gap-4 p-4 rounded-2xl border ${card} mb-2 shadow-sm`}>
                <div className="h-14 w-14 rounded-full bg-teal-100 dark:bg-teal-900/40 border-2 border-white dark:border-slate-800 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                  {selectedPatient.profile_picture ? (
                    <img 
                      src={`${import.meta.env.VITE_BACKEND_URL}/storage/${selectedPatient.profile_picture}`} 
                      className="w-full h-full object-cover" 
                      onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${selectedPatient.first_name}+${selectedPatient.last_name}&background=random`; }}
                    />
                  ) : (
                    <span className="text-teal-600 dark:text-teal-400 font-bold text-base">{(selectedPatient.first_name?.[0] || "") + (selectedPatient.last_name?.[0] || "")}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white leading-tight">{selectedPatient.first_name} {selectedPatient.last_name}</h3>
                  <p className="text-[10px] text-teal-600 dark:text-teal-400 font-bold uppercase tracking-widest">{selectedPatient.patient_number || 'No ID'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`text-[10px] font-bold tracking-wider uppercase ${muted}`}>First Name</label>
                  <input 
                    value={selectedPatient.first_name || ''} 
                    onChange={(e) => setSelectedPatient({...selectedPatient, first_name: e.target.value})}
                    className={`w-full mt-1 p-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition ${input}`}
                  />
                </div>
                <div>
                  <label className={`text-[10px] font-bold tracking-wider uppercase ${muted}`}>Last Name</label>
                  <input 
                    value={selectedPatient.last_name || ''} 
                    onChange={(e) => setSelectedPatient({...selectedPatient, last_name: e.target.value})}
                    className={`w-full mt-1 p-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition ${input}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`text-[10px] font-bold tracking-wider uppercase ${muted}`}>Phone Number</label>
                  <input 
                    value={selectedPatient.contact_number || ''} 
                    onChange={(e) => setSelectedPatient({...selectedPatient, contact_number: e.target.value})}
                    className={`w-full mt-1 p-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition ${input}`}
                  />
                </div>
                <div>
                  <label className={`text-[10px] font-bold tracking-wider uppercase ${muted}`}>Account Status</label>
                  <select 
                    value={selectedPatient.account_status}
                    onChange={(e) => setSelectedPatient({...selectedPatient, account_status: e.target.value})}
                    className={`w-full mt-1 p-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition ${input}`}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`text-[10px] font-bold tracking-wider uppercase ${muted}`}>Sex</label>
                  <select 
                    value={selectedPatient.sex || ''} 
                    onChange={(e) => setSelectedPatient({...selectedPatient, sex: e.target.value})}
                    className={`w-full mt-1 p-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition ${input}`}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className={`text-[10px] font-bold tracking-wider uppercase ${muted}`}>Email</label>
                  <p className="mt-2 text-sm font-medium">{selectedPatient.email}</p>
                </div>
              </div>

              {/* ID Verification Section */}
              <div className={`rounded-xl border p-4 ${dark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg"><FaIdCard /></span>
                    <div>
                      <h3 className="text-sm font-bold">Identity Verification</h3>
                      <p className={`text-[10px] ${muted}`}>Verify identity documents and selfies</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      selectedPatient.verification_status === 'Approved' ? 'bg-green-100 text-green-700' : 
                      selectedPatient.verification_status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {selectedPatient.verification_status}
                    </span>
                    <button 
                      onClick={() => setExpandVerify(!expandVerify)}
                      className="text-xs font-bold text-teal-600 hover:underline"
                    >
                      {expandVerify ? 'Hide' : 'Review Documents'}
                    </button>
                  </div>
                </div>

                {expandVerify && (
                  <div className="mt-4 pt-4 border-t dark:border-gray-700 space-y-4 animate-in slide-in-from-top-2 duration-200">
                    {selectedPatient.patient_verification ? (
                      <>
                        <div className="grid grid-cols-2 gap-3 text-[11px]">
                          <div>
                            <p className={muted}>ID Type</p>
                            <p className="font-bold">{selectedPatient.patient_verification.id_type}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <p className={`text-[9px] font-bold mb-1 ${muted}`}>FRONT ID</p>
                            <div className="aspect-[4/3] rounded-lg overflow-hidden border dark:border-gray-700 bg-black/5 flex items-center justify-center">
                              {selectedPatient.patient_verification.id_image ? (
                                <img 
                                  src={`${import.meta.env.VITE_BACKEND_URL}/storage/${selectedPatient.patient_verification.id_image}`} 
                                  className="w-full h-full object-cover cursor-zoom-in"
                                  onClick={() => window.open(`${import.meta.env.VITE_BACKEND_URL}/storage/${selectedPatient.patient_verification.id_image}`)}
                                />
                              ) : <FaImage className="text-gray-300" />}
                            </div>
                          </div>
                          <div>
                            <p className={`text-[9px] font-bold mb-1 ${muted}`}>BACK ID</p>
                            <div className="aspect-[4/3] rounded-lg overflow-hidden border dark:border-gray-700 bg-black/5 flex items-center justify-center">
                              {selectedPatient.patient_verification.id_back_image ? (
                                <img 
                                  src={`${import.meta.env.VITE_BACKEND_URL}/storage/${selectedPatient.patient_verification.id_back_image}`} 
                                  className="w-full h-full object-cover cursor-zoom-in"
                                  onClick={() => window.open(`${import.meta.env.VITE_BACKEND_URL}/storage/${selectedPatient.patient_verification.id_back_image}`)}
                                />
                              ) : <FaImage className="text-gray-300" />}
                            </div>
                          </div>
                          <div>
                            <p className={`text-[9px] font-bold mb-1 ${muted}`}>SELFIE + ID</p>
                            <div className="aspect-[4/3] rounded-lg overflow-hidden border dark:border-gray-700 bg-black/5 flex items-center justify-center">
                              {selectedPatient.patient_verification.selfie_image ? (
                                <img 
                                  src={`${import.meta.env.VITE_BACKEND_URL}/storage/${selectedPatient.patient_verification.selfie_image}`} 
                                  className="w-full h-full object-cover cursor-zoom-in"
                                  onClick={() => window.open(`${import.meta.env.VITE_BACKEND_URL}/storage/${selectedPatient.patient_verification.selfie_image}`)}
                                />
                              ) : <FaCamera className="text-gray-300" />}
                            </div>
                          </div>
                        </div>

                        {selectedPatient.verification_status !== 'Approved' && !showRejectBox && (
                          <div className="flex gap-2 pt-2">
                            <button onClick={() => handleVerify('approve')} disabled={verifying} className="flex-1 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
                              <FaCheckCircle /> Approve
                            </button>
                            <button onClick={() => setShowRejectBox(true)} className="flex-1 py-2 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition flex items-center justify-center gap-2">
                              <FaTimesCircle /> Reject
                            </button>
                          </div>
                        )}

                        {showRejectBox && (
                          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900 animate-in zoom-in-95">
                             <div className="flex justify-between items-center mb-3">
                               <h4 className="text-xs font-bold text-red-600">Rejection Reason</h4>
                               <button onClick={() => setShowRejectBox(false)} className="text-xs text-gray-500 underline">Cancel</button>
                             </div>
                             <select 
                               value={rejectReason}
                               onChange={(e) => setRejectReason(e.target.value)}
                               className={`w-full p-2 rounded-lg border text-xs mb-3 outline-none focus:ring-2 focus:ring-red-500/20 ${input}`}
                             >
                               <option value="">Select common issue...</option>
                               {commonReasons.map(r => <option key={r} value={r}>{r}</option>)}
                             </select>
                             <textarea 
                               placeholder="Additional notes for the patient..."
                               value={rejectNote}
                               onChange={(e) => setRejectNote(e.target.value)}
                               className={`w-full p-2 rounded-lg border text-xs outline-none focus:ring-2 focus:ring-red-500/20 mb-3 ${input}`}
                               rows={2}
                             />
                             <button 
                               onClick={() => handleVerify('reject')}
                               disabled={verifying}
                               className="w-full py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition disabled:opacity-50">
                               Confirm Rejection
                             </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-6">
                        <FaExclamationTriangle className="text-amber-400 text-2xl mx-auto mb-2" />
                        <p className="text-xs italic text-gray-500">No verification documents have been uploaded by this patient yet.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t dark:border-gray-800 flex justify-end gap-3 bg-gray-50/50 dark:bg-gray-900/50">
              <button 
                onClick={() => setShowModal(false)}
                className={`px-6 py-2.5 rounded-xl text-sm font-medium transition ${dark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
                Cancel
              </button>
              <button 
                onClick={handleUpdate}
                disabled={saving}
                className="px-8 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 transition disabled:opacity-50 shadow-lg shadow-teal-600/20">
                {saving ? 'Saving...' : 'Update Patient'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}