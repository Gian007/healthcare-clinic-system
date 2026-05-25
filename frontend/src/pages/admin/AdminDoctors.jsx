import { useEffect, useMemo, useState } from "react";
import { Badge, Modal, PageHeader, TextInput, Toolbar } from "../../components/admin/AdminUI";
import * as adminApi from "../../api/adminApi";
import { FaCopy, FaCheckCircle } from "react-icons/fa";

const BLANK = { first_name:'', last_name:'', specialization_ids:[], license_number:'', contact_number:'', email:'', photo: null, attachments: [] };

function SuccessCredentials({ doctor, tempPassword, onClose }) {
 return (
 <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
 <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 w-full max-w-md">
 <div className="text-center mb-4">
 <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-3" />
 <h3 className="text-xl font-bold text-gray-900 dark:text-white">Doctor Account Created!</h3>
 <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Credentials have been sent securely via email.</p>
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
 </div>
 <div className="flex mt-6">
 <button onClick={onClose} className="w-full bg-primary text-white py-2.5 rounded-xl font-medium hover:opacity-90 transition">Done</button>
 </div>
 </div>
 </div>
 );
}

export default function AdminDoctors() {
 const [records, setRecords] = useState([]);
 const [specializations, setSpecs] = useState([]);
 const [services, setServices] = useState([]);
 const [loading, setLoading] = useState(true);
 const [showNewSpec, setShowNewSpec] = useState(false);
 const [newSpecName, setNewSpecName] = useState('');
 const [query, setQuery] = useState('');
 const [modal, setModal] = useState(null); // { mode: 'add'|'edit', data }
 const [mailData, setMailData] = useState({ subject: '', message: '' });
 const [sendingMail, setSendingMail] = useState(false);
 const [formData, setFormData] = useState(BLANK);
 const [formErrors, setFormErrors] = useState({});
 const [saving, setSaving] = useState(false);
 const [credentials, setCredentials] = useState(null); // { doctor, tempPassword }

 useEffect(() => {
 fetchAll();
 }, []);

 const fetchAll = async () => {
 setLoading(true);
 try {
 const [doctors, specs, svcs] = await Promise.all([
 adminApi.getDoctors(), 
 adminApi.getSpecializations(),
 adminApi.getServices()
 ]);
 setRecords(doctors);
 setSpecs(specs);
 setServices(svcs);
 } catch(e) { console.error(e); }
 setLoading(false);
 };

 // Medical Specialization Registry — same list as AdminServices
 const displaySpecs = useMemo(() => {
 const registry = [
 { cat: 'Doctor Specializations', names: [
 "General Practitioner (GP)",
 "Family Medicine Physician",
 "Internal Medicine Physician",
 "Pediatrician",
 "Obstetrician-Gynecologist (OB-GYN)",
 "Cardiologist",
 "Dermatologist",
 "ENT Specialist (Otolaryngologist)",
 "Pulmonologist",
 "Gastroenterologist",
 "Neurologist",
 "Neurosurgeon",
 "Nephrologist",
 "Endocrinologist",
 "Rheumatologist",
 "Infectious Disease Specialist",
 "Oncologist",
 "Hematologist",
 "Allergist / Immunologist",
 "Psychiatrist",
 "Ophthalmologist",
 "Orthopedic Surgeon",
 "General Surgeon",
 "Urologist",
 "Rehabilitation Medicine Specialist",
 "Anesthesiologist",
 "Emergency Medicine Physician",
 "Pathologist",
 "Radiologist",
 "Nuclear Medicine Specialist",
 "Geriatrician",
 "Sports Medicine Physician",
 "Occupational Medicine Physician",
 "Preventive Medicine Physician",
 "Pain Management Specialist",
 "Sleep Medicine Specialist",
 "Plastic and Reconstructive Surgeon",
 "Vascular Surgeon",
 "Thoracic Surgeon",
 "Cardiothoracic Surgeon",
 "Colorectal Surgeon",
 "Hepatobiliary Surgeon",
 "Transplant Surgeon",
 "Clinical Geneticist"
 ]},
 { cat: 'Dental Specializations', names: [
 "General Dentist",
 "Orthodontist",
 "Oral and Maxillofacial Surgeon",
 "Endodontist",
 "Prosthodontist",
 "Periodontist",
 "Pediatric Dentist (Pedodontist)",
 "Cosmetic Dentist",
 "Oral Pathologist",
 "Oral Radiologist",
 "Oral Medicine Specialist",
 "Dental Public Health Specialist"
 ]}
 ];

 const all = [];
 let idCounter = 999000;
 registry.forEach(r => {
 r.names.forEach(name => {
 if (!all.find(x => x.name === name)) {
 all.push({ specialization_id: idCounter++, name, description: r.cat });
 }
 });
 });

 // Merge real DB specializations — replace mock IDs with real ones by name match
 if (specializations.length > 0) {
 specializations.forEach(s => {
 const found = all.find(x => x.name === s.name);
 if (found) {
 found.specialization_id = s.specialization_id;
 found.description = s.description || found.description;
 } else {
 all.push(s);
 }
 });
 }
 return all;
 }, [specializations]);

 // Helper: check if a specialization ID or name is covered by any existing service
 const isSpecLinkedToService = (id) => {
 const spec = displaySpecs.find(x => x.specialization_id === id);
 const specName = spec?.name || (typeof id === 'string' && id.startsWith('NEW:') ? id.replace('NEW:', '') : null);
 return services.some(svc => {
 // Check by ID
 if (svc.specializations?.some(x => x.specialization_id === id)) return true;
 if (svc.specialization_id === id) return true;
 // Check by name (handles cases where DB IDs match names from services)
 if (specName && svc.specializations?.some(x =>
 x.name?.toLowerCase() === specName.toLowerCase() ||
 x.specialization_name?.toLowerCase() === specName.toLowerCase()
 )) return true;
 return false;
 });
 };

 const list = useMemo(() =>
 records.filter(d => `${d.first_name} ${d.last_name} ${d.email} ${d.license_number} ${d.specialization?.name}`.toLowerCase().includes(query.toLowerCase())),
 [records, query]);

 const openAdd = () => {
 setFormData(BLANK);
 setFormErrors({});
 setShowNewSpec(false);
 setNewSpecName('');
 setModal('add');
 };

 const openEdit = (d) => {
 setFormData({ 
 ...d, 
 specialization_ids: d.specializations?.map(s => s.specialization_id) || (d.specialization_id ? [d.specialization_id] : [])
 });
 setFormErrors({});
 setShowNewSpec(false);
 setNewSpecName('');
 setModal('edit');
 };

 const handleField = (e) => {
 const { name, value, type, files } = e.target;
 if (type === 'file') {
 if (name === 'attachments') {
 setFormData(p => ({ ...p, attachments: Array.from(files) }));
 } else {
 setFormData(p => ({ ...p, [name]: files[0] }));
 }
 } else {
 setFormData(p => ({ ...p, [name]: name === 'contact_number' ? value.replace(/\D/g,'') : value }));
 }
 setFormErrors(p => ({ ...p, [name]: '' }));
 };

 const handleMail = async (e) => {
 e.preventDefault();
 if (!mailData.subject || !mailData.message) return alert("Please fill in both subject and message.");
 
 setSendingMail(true);
 try {
 await adminApi.sendDoctorEmail(formData.doctor_id, mailData);
 alert("Email sent successfully!");
 setMailData({ subject: '', message: '' });
 } catch (err) {
 console.error(err);
 alert("Failed to send email.");
 } finally {
 setSendingMail(false);
 }
 };

 const save = async (e) => {
 e.preventDefault();
 setSaving(true); setFormErrors({});

 try {
 const currentSpecIds = [];
 for (const entry of formData.specialization_ids) {
 if (typeof entry === 'string' && entry.startsWith('NEW:')) {
 const name = entry.replace('NEW:', '');
 const res = await adminApi.createSpecialization({ name });
 currentSpecIds.push(res.specialization.specialization_id);
 } else {
 currentSpecIds.push(entry);
 }
 }

 if (modal === 'edit' && currentSpecIds.length === 0) {
 setFormErrors({ specialization_ids: 'At least one specialization is required.' });
 setSaving(false);
 return;
 }

 const fd = new FormData();
 Object.keys(formData).forEach(key => {
 if (key === 'specialization_ids') {
 currentSpecIds.forEach(id => fd.append('specialization_ids[]', id));
 } else if (key === 'attachments') {
 formData[key].forEach(file => fd.append('attachments[]', file));
 } else if (key === 'photo') {
 if (formData[key]) fd.append('photo', formData[key]);
 } else if (key !== 'doctor_id') {
 fd.append(key, formData[key] || '');
 }
 });

 if (modal === 'edit') fd.append('_method', 'PUT');

 const res = modal === 'add' 
 ? await adminApi.createDoctor(fd) 
 : await adminApi.updateDoctor(formData.doctor_id, fd);
 
 if (modal === 'add') {
 setCredentials({ doctor: res.doctor, tempPassword: res.temp_password });
 }
 setModal(null);
 setShowNewSpec(false);
 setNewSpecName('');
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
 alert(`Doctor status successfully updated to ${newStatus}.`);
 } catch(e) { 
 console.error(e); 
 alert("Failed to update doctor status.");
 }
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
 <p className="text-4xl mb-3"></p>
 <p className="text-gray-500 dark:text-gray-400">No doctors found.</p>
 <button onClick={openAdd} className="mt-4 text-primary font-medium hover:underline">Add the first doctor →</button>
 </div>
 ) : (
 <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
 {list.map(d => (
 <div key={d.doctor_id} className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
 <div className="flex justify-between gap-3">
 <div className="flex gap-4">
 <div className="h-14 w-14 rounded-2xl bg-teal-100 dark:bg-teal-900/40 border border-teal-200 dark:border-teal-800 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
 {d.profile_picture ? (
 <img 
 src={`${import.meta.env.VITE_BACKEND_URL}/storage/${d.profile_picture}`} 
 className="w-full h-full object-cover" 
 onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=Dr+${d.first_name}+${d.last_name}&background=random`; }}
 />
 ) : (
 <span className="text-teal-600 dark:text-teal-400 font-bold text-lg">{(d.first_name?.[0] || "") + (d.last_name?.[0] || "")}</span>
 )}
 </div>
 <div>
 <h2 className="text-lg font-bold text-gray-900 dark:text-white">Dr. {d.first_name} {d.last_name}</h2>
 <div className="flex flex-wrap gap-1 mt-1">
 {d.specializations?.length > 0 ? d.specializations.map(s => (
 <span key={s.specialization_id} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded font-medium border border-slate-200 dark:border-slate-700">{s.name}</span>
 )) : <span className="text-sm text-slate-500 font-medium">{d.specialization?.name || 'No specialization'}</span>}
 </div>
 <p className="text-[10px] text-teal-600 font-bold uppercase tracking-widest mt-1">{d.license_number}</p>
 </div>
 </div>
 <span className={`h-fit text-xs px-2.5 py-1 rounded-full font-medium ${d.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
 {d.status}
 </span>
 </div>
 <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-4 text-sm">
 <p><span className="text-gray-500">Email:</span> <span className="font-medium">{d.email}</span></p>
 <p><span className="text-gray-500">Contact:</span> <span className="font-medium">{d.contact_number}</span></p>
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
 {modal === 'edit' && (
 <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 mb-6 shadow-sm">
 <div className="h-16 w-16 rounded-2xl bg-teal-100 dark:bg-teal-900/40 border-2 border-white dark:border-slate-700 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
 {formData.profile_picture ? (
 <img 
 src={`${import.meta.env.VITE_BACKEND_URL}/storage/${formData.profile_picture}`} 
 className="w-full h-full object-cover" 
 onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=Dr+${formData.first_name}+${formData.last_name}&background=random`; }}
 />
 ) : (
 <span className="text-teal-600 dark:text-teal-400 font-bold text-xl">{(formData.first_name?.[0] || "") + (formData.last_name?.[0] || "")}</span>
 )}
 </div>
 <div>
 <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">Dr. {formData.first_name} {formData.last_name}</h3>
 <p className="text-xs text-teal-600 dark:text-teal-400 font-bold uppercase tracking-widest mt-0.5">{formData.license_number}</p>
 <p className="text-[10px] text-slate-500 mt-1 italic">Authorized Practitioner</p>
 </div>
 </div>
 )}
 <form onSubmit={save} className="space-y-4">
 {formErrors.general && (
 <div className="bg-red-50 dark:bg-red-900/20 text-red-600 text-sm p-3 rounded-lg border border-red-200 dark:border-red-800">{formErrors.general}</div>
 )}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {[
 { label:'First Name', name:'first_name', required:true },
 { label:'Last Name', name:'last_name', required:true },
 ...(modal === 'edit' ? [
 { label:'PRC License No.', name:'license_number', required:true },
 { label:'Contact Number', name:'contact_number', required:true },
 ] : []),
 { label:'Email Address', name:'email', type:'email', required:true },
 ].map(f => (
 <div key={f.name}>
 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{f.label}{f.required && <span className="text-red-500 ml-1">*</span>}</label>
 <input name={f.name} type={f.type||'text'} value={formData[f.name]||''} onChange={handleField} required={f.required}
 className={`w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30 dark:bg-slate-800 dark:border-slate-700 dark:text-white ${formErrors[f.name] ? 'border-red-400' : 'border-gray-300 dark:border-slate-700'}`} />
 {formErrors[f.name] && <p className="text-xs text-red-500 mt-1">{formErrors[f.name]}</p>}
 </div>
 ))}
 {modal === 'edit' && (
 <>
 <div>
 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Profile Picture</label>
 <input type="file" name="photo" accept="image/*" onChange={handleField}
 className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Attachments (Multi-file)</label>
 <input type="file" name="attachments" multiple onChange={handleField}
 className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
 <p className="text-[10px] text-slate-400 mt-1 italic">Certificates, IDs, or other docs.</p>
 </div>
 <div>
 <div className="flex items-center justify-between mb-2">
 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Specializations <span className="text-red-500">*</span></label>
 {!showNewSpec && (
 <button type="button" onClick={() => setShowNewSpec(true)} className="text-[10px] bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-bold hover:bg-primary/20 transition-all border border-primary/20 shadow-sm">
 + Other Specialization
 </button>
 )}
 </div>
 <div className="space-y-3">
 <div className="flex flex-wrap gap-2 mb-2 p-3 border border-gray-100 dark:border-slate-800 rounded-xl bg-gray-50/30 dark:bg-slate-900/30">
 {formData.specialization_ids.length === 0 && <span className="text-gray-400 text-xs italic">No specializations linked yet.</span>}
 {formData.specialization_ids.map(id => {
 const sp = displaySpecs.find(x => x.specialization_id === id);
 const isNew = typeof id === 'string' && id.startsWith('NEW:');
 const label = isNew ? id.replace('NEW:', '') : (sp?.name || 'Unknown');
 const isLinkedToService = isSpecLinkedToService(id);
 return (
 <span key={id} className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg border shadow-sm transition-all animate-in zoom-in-95 ${isLinkedToService ? 'bg-primary/10 text-primary border-primary/20' : 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800'}`}>
 {!isLinkedToService && !isNew && <span title="Not linked to any service"></span>}
 {label}
 <button type="button" onClick={() => setFormData(p => ({ ...p, specialization_ids: p.specialization_ids.filter(x => x !== id) }))} className="ml-1 hover:text-red-500 font-bold">×</button>
 </span>
 );
 })}
 </div>
 
 {!showNewSpec ? (
 <div className="space-y-3 relative group">
 <div className="relative">
 <select value="" onChange={e => {
 const val = parseInt(e.target.value);
 if (val && !formData.specialization_ids.includes(val)) {
 setFormData(p => ({ ...p, specialization_ids: [...p.specialization_ids, val] }));
 }
 }}
 className={`w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30 dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm shadow-sm transition-all ${formErrors.specialization_ids ? 'border-red-400' : 'border-gray-300 dark:border-slate-700'}`}>
 <option value="">— Browse All Specializations —</option>
 {Object.entries(
 displaySpecs
 .filter(s => !formData.specialization_ids.includes(s.specialization_id))
 .reduce((acc, sp) => {
 const cat = sp.description || 'General Medicine & Primary Care';
 if (!acc[cat]) acc[cat] = [];
 acc[cat].push(sp);
 return acc;
 }, {})
 ).map(([cat, items]) => (
 <optgroup key={cat} label={cat.toUpperCase()}>
 {items.map(s => (
 <option key={s.specialization_id} value={s.specialization_id}>{s.name}</option>
 ))}
 </optgroup>
 ))}
 </select>
 </div>
 
 {formData.specialization_ids.length > 0 && formData.specialization_ids.some(id => !isSpecLinkedToService(id) && !(typeof id === 'string' && id.startsWith('NEW:'))) && (
 <div className="text-[11px] text-amber-700 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl border border-amber-200 dark:border-amber-800 font-bold shadow-sm flex items-start gap-2 leading-relaxed">
 <span className="text-lg mt-[-2px]"></span>
 <span>
 One or more specializations are not yet linked to a service.
 <br/>
 <span className="text-amber-600/70 font-medium italic">Please ensure at least one service exists for these fields.</span>
 </span>
 </div>
 )}
 </div>
 ) : (
 <div className="bg-primary/5 dark:bg-primary/10 p-5 rounded-2xl border border-primary/20 space-y-3 shadow-xl">
 <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
 <span className="w-2 h-2 bg-primary rounded-full animate-ping"/>
 Register Custom Field
 </p>
 <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
 <div className="flex-1 relative">
 <input 
 autoFocus 
 placeholder="Type specialization name here..." 
 value={newSpecName} 
 onChange={e => setNewSpecName(e.target.value)}
 onKeyDown={e => {
 if (e.key === 'Enter') {
 e.preventDefault();
 if (newSpecName.trim()) {
 const newId = `NEW:${newSpecName.trim()}`;
 if (!formData.specialization_ids?.includes(newId)) {
 setFormData(p => ({ ...p, specialization_ids: [...(p.specialization_ids||[]), newId] }));
 }
 setNewSpecName('');
 setShowNewSpec(false);
 }
 }
 }}
 className="w-full border border-primary/30 dark:border-primary/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 dark:bg-slate-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500" 
 />
 </div>
 <div className="flex gap-2">
 <button 
 type="button" 
 onClick={() => {
 if (!newSpecName.trim()) return;
 const newId = `NEW:${newSpecName.trim()}`;
 if (!formData.specialization_ids?.includes(newId)) {
 setFormData(p => ({ ...p, specialization_ids: [...(p.specialization_ids||[]), newId] }));
 }
 setNewSpecName('');
 setShowNewSpec(false);
 }} 
 className="flex-1 sm:flex-none bg-primary text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 shadow-lg shadow-primary/10 whitespace-nowrap"
 >
 Confirm
 </button>
 <button 
 type="button" 
 onClick={() => { setShowNewSpec(false); setNewSpecName(''); }} 
 className="flex-1 sm:flex-none px-3 text-[10px] font-black text-gray-500 dark:text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest bg-gray-100 dark:bg-slate-800 sm:bg-transparent sm:dark:bg-transparent rounded-xl sm:rounded-none"
 >
 Cancel
 </button>
 </div>
 </div>
 {!newSpecName.trim() && <p className="text-[10px] text-red-500 dark:text-red-400 font-bold italic px-1 animate-bounce"> Please enter a name or click cancel</p>}
 </div>
 )}
 {formErrors.specialization_ids && <p className="text-xs text-red-500 mt-2 font-bold flex items-center gap-1 px-1 tracking-tight"> {formErrors.specialization_ids}</p>}
 </div>
 </div>
 </>
 )}
 </div>
 <button type="submit" disabled={saving} className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50 shadow-lg shadow-primary/20">
 {saving ? 'Saving...' : modal === 'add' ? 'Create Doctor Account' : 'Save Changes'}
 </button>
 </form>

 {modal === 'edit' && (
 <>
 <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
 <div className="flex items-center gap-2 mb-4">
 <div className="h-8 w-1 bg-rose-500 rounded-full"/>
 <h4 className="text-sm font-bold uppercase tracking-widest text-slate-800 dark:text-slate-200">Reset Password</h4>
 </div>
 <p className="text-xs text-slate-500 mb-4">Generate a new temporary password and email it to this doctor.</p>
 <button 
 type="button"
 onClick={async () => {
 if(!confirm("Are you sure you want to reset this doctor's password?")) return;
 try {
 setSaving(true);
 const res = await adminApi.resetDoctorPassword(formData.doctor_id);
 setCredentials({ doctor: formData, tempPassword: res.temp_password });
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

 <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800">
 <div className="flex items-center gap-2 mb-6">
 <div className="h-8 w-1 bg-primary rounded-full"/>
 <h4 className="text-sm font-bold uppercase tracking-widest text-slate-800 dark:text-slate-200">Contact Doctor</h4>
 </div>
 
 <div className="bg-slate-50 dark:bg-slate-900/40 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
 <div className="space-y-4">
 <div>
 <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5 ml-1">Email Subject</label>
 <input 
 placeholder="Enter subject here..."
 value={mailData.subject}
 onChange={e => setMailData(p => ({ ...p, subject: e.target.value }))}
 className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 dark:bg-slate-800 dark:text-white transition-all" 
 />
 </div>
 <div>
 <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5 ml-1">Message Body</label>
 <textarea 
 rows={4}
 placeholder="Type your message to the doctor here..."
 value={mailData.message}
 onChange={e => setMailData(p => ({ ...p, message: e.target.value }))}
 className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 dark:bg-slate-800 dark:text-white transition-all resize-none" 
 />
 </div>
 <button 
 type="button"
 onClick={handleMail}
 disabled={sendingMail || !mailData.subject || !mailData.message}
 className="w-full bg-slate-900 dark:bg-primary text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:opacity-90 transition disabled:opacity-30 flex items-center justify-center gap-2 shadow-xl"
 >
 {sendingMail ? (
 <>
 <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
 Sending...
 </>
 ) : (
 <>🚀 Send Message to Inbox</>
 )}
 </button>
 </div>
 </div>
 </div>
 </>
 )}
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
