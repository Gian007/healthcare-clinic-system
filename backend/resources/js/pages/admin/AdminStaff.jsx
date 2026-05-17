import { useEffect, useMemo, useState } from "react";
import { Badge, Modal, PageHeader, SelectInput, TextInput, Toolbar } from "../../components/admin/AdminUI";
import * as adminApi from "../../api/adminApi";
import { FaCopy, FaCheckCircle } from "react-icons/fa";

function SuccessCredentials({ staff, tempPassword, onClose }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(`Email: ${staff.email}\nTemporary Password: ${tempPassword}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 w-full max-w-md animate-in zoom-in-95">
        <div className="text-center mb-4">
          <FaCheckCircle className="text-emerald-500 text-5xl mx-auto mb-3" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Staff Account Created!</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Temporary credentials for the new member.</p>
        </div>
        <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Name</span>
            <span className="font-medium">{staff.first_name} {staff.last_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Email</span>
            <span className="font-medium">{staff.email}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 dark:text-gray-400">Temp Password</span>
            <span className="font-bold text-teal-600 font-mono">{tempPassword}</span>
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={copy} className="flex-1 flex items-center justify-center gap-2 border border-teal-600 text-teal-600 py-2.5 rounded-xl font-medium hover:bg-teal-50 transition">
            {copied ? <FaCheckCircle size={16} /> : <FaCopy size={16} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button onClick={onClose} className="flex-1 bg-teal-600 text-white py-2.5 rounded-xl font-medium hover:opacity-90 transition shadow-lg shadow-teal-600/20">Done</button>
        </div>
      </div>
    </div>
  );
}

const blank = { first_name: "", last_name: "", role: "Receptionist", contact_number: "", email: "", account_status: "Active" };

export default function AdminStaff() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(null);
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [credentials, setCredentials] = useState(null);
  const [mailData, setMailData] = useState({ subject: '', message: '' });
  const [sendingMail, setSendingMail] = useState(false);

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getStaff();
      setRecords(data || []);
    } catch (e) {
      console.error("Failed to load staff:", e);
      setNotice("Could not connect to backend server.");
    } finally {
      setLoading(false);
    }
  };

  const handleMail = async (e) => {
    e.preventDefault();
    if (!mailData.subject || !mailData.message) return alert("Please fill in both subject and message.");
    
    setSendingMail(true);
    try {
      await adminApi.sendStaffEmail(modal.data.staff_id, mailData);
      alert("Email sent successfully!");
      setMailData({ subject: '', message: '' });
    } catch (err) {
      console.error(err);
      alert("Failed to send email.");
    } finally {
      setSendingMail(false);
    }
  };

  const list = useMemo(() =>
    records.filter(s => 
      `${s.first_name} ${s.last_name} ${s.email} ${s.role}`.toLowerCase().includes(query.toLowerCase())
    ),
    [records, query]
  );

  const save = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      Object.keys(modal.data).forEach(key => {
        if (key === 'photo') {
          if (modal.data[key]) fd.append('photo', modal.data[key]);
        } else {
          fd.append(key, modal.data[key] || '');
        }
      });

      if (modal.mode === 'edit') fd.append('_method', 'PUT');

      if (modal.mode === "add") {
        const res = await adminApi.createStaff(fd);
        setCredentials({ staff: res.staff, tempPassword: res.temp_password });
      } else {
        await adminApi.updateStaff(modal.data.staff_id, fd);
      }
      setNotice(modal.mode === "add" ? "Staff member added successfully." : "Staff record updated.");
      setModal(null);
      loadStaff();
    } catch (e) {
      alert(e.response?.data?.message || "Failed to save staff record.");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (s) => {
    const newStatus = s.account_status === "Active" ? "Inactive" : "Active";
    try {
      await adminApi.updateStaff(s.staff_id, { account_status: newStatus });
      loadStaff();
    } catch (e) {
      alert("Failed to update status.");
    }
  };

  const markResigned = async (s) => {
    if (!confirm(`Mark ${s.first_name} ${s.last_name} as Resigned?`)) return;
    try {
      await adminApi.updateStaff(s.staff_id, { account_status: "Resigned" });
      loadStaff();
      setNotice(`${s.first_name} ${s.last_name} has been marked as resigned.`);
    } catch (e) {
      alert("Failed to update status.");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading staff records...</div>;

  return (
    <div>
      <PageHeader 
        title="Staff Management" 
        subtitle="Manage clinic admin, receptionist, and other staff accounts." 
        actionLabel="Add Staff" 
        onAction={() => setModal({ mode: "add", data: blank })} 
      />

      {notice && (
        <div className="mb-4 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 p-4 flex justify-between items-center animate-in fade-in slide-in-from-top-2">
          <span>{notice}</span>
          <button onClick={() => setNotice("")} className="text-lg leading-none hover:opacity-70">×</button>
        </div>
      )}

      <Toolbar query={query} setQuery={setQuery} label="Search staff name, role, email..." />

      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 overflow-x-auto shadow-sm">
        <table className="w-full text-sm">
          <thead className="text-left bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Role</th>
              <th className="p-4">Email</th>
              <th className="p-4">Contact</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr><td colSpan="6" className="p-8 text-center text-slate-500">No staff records found.</td></tr>
            ) : (
              list.map(s => (
                <tr key={s.staff_id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-teal-100 dark:bg-teal-900/40 border border-teal-200 dark:border-teal-800 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                        {s.profile_picture ? (
                          <img 
                            src={`${import.meta.env.VITE_BACKEND_URL}/storage/${s.profile_picture}`} 
                            className="w-full h-full object-cover" 
                            onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${s.first_name}+${s.last_name}&background=random`; }}
                          />
                        ) : (
                          <span className="text-teal-600 dark:text-teal-400 font-bold text-[10px]">{(s.first_name?.[0] || "") + (s.last_name?.[0] || "")}</span>
                        )}
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white leading-tight">{s.first_name} {s.last_name}</span>
                    </div>
                  </td>
                  <td className="p-4">{s.role}</td>
                  <td className="p-4">{s.email}</td>
                  <td className="p-4">{s.contact_number}</td>
                  <td className="p-4"><Badge variant={s.account_status === 'Active' ? 'success' : 'warning'}>{s.account_status}</Badge></td>
                  <td className="p-4">
                    <div className="flex gap-2 flex-wrap">
                      <button onClick={() => setModal({ mode: "edit", data: s })} className="px-3 py-1.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors text-xs font-medium">Edit</button>
                      <button onClick={() => toggleStatus(s)} className="px-3 py-1.5 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors text-xs font-medium">Toggle</button>
                      <button onClick={() => markResigned(s)} className="px-3 py-1.5 rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition-colors text-xs font-medium">Resign</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title={modal.mode === "add" ? "Add Staff Member" : "Edit Staff"} onClose={() => setModal(null)}>
          {modal.mode === "edit" && (
            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 mb-6 shadow-sm">
              <div className="h-14 w-14 rounded-full bg-teal-100 dark:bg-teal-900/40 border-2 border-white dark:border-slate-700 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
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
                <p className="text-xs text-teal-600 dark:text-teal-400 font-bold uppercase tracking-widest mt-0.5">{modal.data.role}</p>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput label="First Name" value={modal.data.first_name} onChange={v => setModal({ ...modal, data: { ...modal.data, first_name: v } })} />
            <TextInput label="Last Name" value={modal.data.last_name} onChange={v => setModal({ ...modal, data: { ...modal.data, last_name: v } })} />
            <SelectInput label="Role" value={modal.data.role} onChange={v => setModal({ ...modal, data: { ...modal.data, role: v } })} options={["Admin", "Receptionist", "Nurse", "Verifier"]} />
            <SelectInput label="Status" value={modal.data.account_status} onChange={v => setModal({ ...modal, data: { ...modal.data, account_status: v } })} options={["Active", "Inactive", "Resigned"]} />
            <TextInput label="Contact" value={modal.data.contact_number} onChange={v => setModal({ ...modal, data: { ...modal.data, contact_number: v } })} />
            <TextInput label="Email" value={modal.data.email} onChange={v => setModal({ ...modal, data: { ...modal.data, email: v } })} />
            
            {modal.mode === 'edit' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Profile Picture</label>
                <input type="file" onChange={e => setModal({ ...modal, data: { ...modal.data, photo: e.target.files[0] } })}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-600 hover:file:bg-teal-100" />
              </div>
            )}

            <button 
              onClick={save} 
              disabled={saving}
              className="md:col-span-2 rounded-xl bg-teal-600 hover:bg-teal-700 transition-colors text-white py-3 font-bold shadow-lg shadow-teal-600/20 disabled:opacity-50 mt-2"
            >
              {saving ? 'Processing...' : 'Save Staff Member'}
            </button>
          </div>

          {modal.mode === 'edit' && (
            <>
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-sm font-bold uppercase tracking-widest text-slate-800 dark:text-slate-200 mb-2">Reset Password</h4>
                <p className="text-xs text-slate-500 mb-4">Generate a new temporary password and email it to this staff member.</p>
                <button 
                  onClick={async () => {
                    if(!confirm("Are you sure you want to reset this staff member's password?")) return;
                    try {
                      setSaving(true);
                      const res = await adminApi.resetStaffPassword(modal.data.staff_id);
                      setCredentials({ staff: modal.data, tempPassword: res.temp_password });
                      setModal(null);
                    } catch(e) {
                      alert("Failed to reset password.");
                    } finally {
                      setSaving(false);
                    }
                  }}
                  disabled={saving}
                  className="w-full border border-rose-500 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  🔐 Generate & Email New Password
                </button>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-sm font-bold uppercase tracking-widest text-slate-800 dark:text-slate-200 mb-4">Contact Staff</h4>
              <div className="space-y-4">
                <TextInput 
                  label="Subject" 
                  placeholder="Enter email subject..."
                  value={mailData.subject} 
                  onChange={v => setMailData(p => ({ ...p, subject: v }))} 
                />
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Message</label>
                  <textarea 
                    rows={4}
                    placeholder="Type your message here..."
                    value={mailData.message}
                    onChange={e => setMailData(p => ({ ...p, message: e.target.value }))}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-600/20 dark:bg-slate-800 dark:text-white transition-all resize-none" 
                  />
                </div>
                <button 
                  onClick={handleMail}
                  disabled={sendingMail || !mailData.subject || !mailData.message}
                  className="w-full bg-slate-900 dark:bg-teal-600 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:opacity-90 transition disabled:opacity-30 flex items-center justify-center gap-2 shadow-xl"
                >
                  {sendingMail ? "Sending..." : "🚀 Send Message"}
                </button>
              </div>
            </div>
            </>
          )}
        </Modal>
      )}
      {credentials && (
        <SuccessCredentials
          staff={credentials.staff}
          tempPassword={credentials.tempPassword}
          onClose={() => setCredentials(null)}
        />
      )}
    </div>
  );
}

