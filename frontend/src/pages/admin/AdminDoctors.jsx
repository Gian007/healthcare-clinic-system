import { useEffect, useMemo, useState } from "react";
import { Badge, Modal, PageHeader, TextInput, Toolbar } from "../../components/admin/AdminUI";
import * as adminApi from "../../api/adminApi";
import { FaCopy, FaCheckCircle } from "react-icons/fa";

const BLANK = { first_name:'', last_name:'', specialization_id:'', license_number:'', contact_number:'', email:'', daily_booking_limit:20 };

function SuccessCredentials({ doctor, tempPassword, onClose }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(`Email: ${doctor.email}\nTemporary Password: ${tempPassword}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 w-full max-w-md">
        <div className="text-center mb-4">
          <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-3" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Doctor Account Created!</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Share these credentials with the doctor.</p>
        </div>
        <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Name</span>
            <span className="font-medium">Dr. {doctor.first_name} {doctor.last_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Email</span>
            <span className="font-medium">{doctor.email}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 dark:text-gray-400">Temp Password</span>
            <span className="font-bold text-primary font-mono">{tempPassword}</span>
          </div>
        </div>
        <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg mt-3">
          ⚠️ This password won't be shown again. Instruct the doctor to change it after first login.
        </p>
        <div className="flex gap-3 mt-4">
          <button onClick={copy} className="flex-1 flex items-center justify-center gap-2 border border-primary text-primary py-2.5 rounded-xl font-medium hover:bg-primary/5 transition">
            {copied ? <FaCheckCircle className="text-green-500" /> : <FaCopy />}
            {copied ? 'Copied!' : 'Copy Credentials'}
          </button>
          <button onClick={onClose} className="flex-1 bg-primary text-white py-2.5 rounded-xl font-medium hover:opacity-90 transition">Done</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminDoctors() {
  const [records, setRecords]         = useState([]);
  const [specializations, setSpecs]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [query, setQuery]             = useState('');
  const [modal, setModal]             = useState(null); // { mode: 'add'|'edit', data }
  const [formData, setFormData]       = useState(BLANK);
  const [formErrors, setFormErrors]   = useState({});
  const [saving, setSaving]           = useState(false);
  const [credentials, setCredentials] = useState(null); // { doctor, tempPassword }

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [doctors, specs] = await Promise.all([adminApi.getDoctors(), adminApi.getSpecializations()]);
      setRecords(doctors);
      setSpecs(specs);
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  const list = useMemo(() =>
    records.filter(d => `${d.first_name} ${d.last_name} ${d.email} ${d.license_number} ${d.specialization?.name}`.toLowerCase().includes(query.toLowerCase())),
  [records, query]);

  const openAdd = () => {
    setFormData(BLANK);
    setFormErrors({});
    setModal('add');
  };

  const openEdit = (d) => {
    setFormData({ ...d, specialization_id: d.specialization_id || '' });
    setFormErrors({});
    setModal('edit');
  };

  const handleField = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: name === 'contact_number' ? value.replace(/\D/g,'') : value }));
    setFormErrors(p => ({ ...p, [name]: '' }));
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true); setFormErrors({});
    try {
      if (modal === 'add') {
        const res = await adminApi.createDoctor(formData);
        setCredentials({ doctor: res.doctor, tempPassword: res.temp_password });
      } else {
        await adminApi.updateDoctor(formData.doctor_id, formData);
      }
      setModal(null);
      fetchAll();
    } catch(err) {
      if (err.response?.data?.errors) {
        const e = {};
        Object.entries(err.response.data.errors).forEach(([k,v]) => e[k] = v[0]);
        setFormErrors(e);
      } else {
        setFormErrors({ general: err.response?.data?.message || 'Failed to save.' });
      }
    }
    setSaving(false);
  };

  const toggleStatus = async (d) => {
    const newStatus = d.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await adminApi.updateDoctorStatus(d.doctor_id, { status: newStatus });
      setRecords(prev => prev.map(r => r.doctor_id === d.doctor_id ? { ...r, status: newStatus } : r));
    } catch(e) { console.error(e); }
  };

  return (
    <div>
      <PageHeader title="Manage Doctors" subtitle="Create and manage doctor accounts." actionLabel="+ Add Doctor" onAction={openAdd} />
      <Toolbar query={query} setQuery={setQuery} label="Search doctor, specialization, license..." />

      {loading ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 animate-pulse">
              <div className="flex justify-between mb-4"><div className="space-y-2 flex-1"><div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-1/2"/><div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4"/></div></div>
              <div className="grid grid-cols-2 gap-3">{[1,2,3,4].map(j => <div key={j} className="h-4 bg-gray-200 dark:bg-slate-700 rounded"/>)}</div>
            </div>
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-12 text-center">
          <p className="text-4xl mb-3">👨‍⚕️</p>
          <p className="text-gray-500 dark:text-gray-400">No doctors found.</p>
          <button onClick={openAdd} className="mt-4 text-primary font-medium hover:underline">Add the first doctor →</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {list.map(d => (
            <div key={d.doctor_id} className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Dr. {d.first_name} {d.last_name}</h2>
                  <p className="text-sm text-slate-500">{d.specialization?.name || 'No specialization'} • {d.license_number}</p>
                </div>
                <span className={`h-fit text-xs px-2.5 py-1 rounded-full font-medium ${d.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                  {d.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-4 text-sm">
                <p><span className="text-gray-500">Email:</span> <span className="font-medium">{d.email}</span></p>
                <p><span className="text-gray-500">Contact:</span> <span className="font-medium">{d.contact_number}</span></p>
                <p><span className="text-gray-500">Daily Limit:</span> <span className="font-medium">{d.daily_booking_limit}</span></p>
                <p><span className="text-gray-500">Schedules:</span> <span className="font-medium">{d.schedules?.length || 0} days</span></p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => openEdit(d)} className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm hover:bg-blue-600 transition">Edit</button>
                <button onClick={() => toggleStatus(d)} className={`px-4 py-2 rounded-lg text-white text-sm transition ${d.status === 'Active' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-green-500 hover:bg-green-600'}`}>
                  {d.status === 'Active' ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modal && (
        <Modal title={modal === 'add' ? 'Add Doctor Account' : 'Edit Doctor'} onClose={() => setModal(null)}>
          <form onSubmit={save} className="space-y-4">
            {formErrors.general && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 text-sm p-3 rounded-lg border border-red-200 dark:border-red-800">{formErrors.general}</div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label:'First Name', name:'first_name', required:true },
                { label:'Last Name',  name:'last_name',  required:true },
                { label:'PRC License No.', name:'license_number', required:true },
                { label:'Contact Number', name:'contact_number', required:true },
                { label:'Email Address', name:'email', type:'email', required:true },
                { label:'Daily Booking Limit', name:'daily_booking_limit', type:'number' },
              ].map(f => (
                <div key={f.name}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{f.label}{f.required && <span className="text-red-500 ml-1">*</span>}</label>
                  <input name={f.name} type={f.type||'text'} value={formData[f.name]||''} onChange={handleField} required={f.required}
                    className={`w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30 dark:bg-slate-800 dark:border-slate-700 dark:text-white ${formErrors[f.name] ? 'border-red-400' : 'border-gray-300 dark:border-slate-700'}`} />
                  {formErrors[f.name] && <p className="text-xs text-red-500 mt-1">{formErrors[f.name]}</p>}
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Specialization <span className="text-red-500">*</span></label>
                <select name="specialization_id" value={formData.specialization_id||''} onChange={handleField} required
                  className={`w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30 dark:bg-slate-800 dark:border-slate-700 dark:text-white ${formErrors.specialization_id ? 'border-red-400' : 'border-gray-300 dark:border-slate-700'}`}>
                  <option value="">— Select Specialization —</option>
                  {specializations.map(s => (
                    <option key={s.specialization_id} value={s.specialization_id}>{s.name}</option>
                  ))}
                </select>
                {formErrors.specialization_id && <p className="text-xs text-red-500 mt-1">{formErrors.specialization_id}</p>}
                {specializations.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">No specializations found. Add them via DB or an admin tool.</p>
                )}
              </div>
            </div>
            {modal === 'add' && (
              <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 p-3 rounded-lg text-sm">
                💡 A random 8-character temporary password will be generated. You'll be able to copy it after creation.
              </div>
            )}
            <button type="submit" disabled={saving} className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50">
              {saving ? 'Saving...' : modal === 'add' ? 'Create Doctor Account' : 'Save Changes'}
            </button>
          </form>
        </Modal>
      )}

      {/* Credentials Display Modal */}
      {credentials && (
        <SuccessCredentials
          doctor={credentials.doctor}
          tempPassword={credentials.tempPassword}
          onClose={() => setCredentials(null)}
        />
      )}
    </div>
  );
}
