import { useEffect, useState, useRef, useMemo } from 'react';
import { FaUser as User, FaFileAlt as FileText, FaPhone as Phone, FaEnvelope as Mail, FaCamera as Camera, FaSpinner as Loader2, FaCheckCircle as CheckCircle2, FaLock as Lock } from 'react-icons/fa';
import { Button, Card, PageHeader } from '../../components/doctor/DoctorUI';
import { useAuth } from '../../state/auth';
import * as doctorApi from '../../api/doctorApi';
import ImageCropper from '../../components/ImageCropper';

export default function DoctorProfile(){
 const { user, fetchUser } = useAuth();
 const fileInputRef = useRef(null);
 
 const [form, setForm] = useState({
 first_name: '',
 last_name: '',
 license_number: '',
 contact_number: '',
 email: '',
 years_of_experience: '',
 consultation_fee: '',
 specialization_ids: [],
 });

 const [specializations, setSpecs] = useState([]);
 const [showNewSpec, setShowNewSpec] = useState(false);
 const [newSpecName, setNewSpecName] = useState('');

 const [passwords, setPasswords] = useState({
 current_password: '',
 password: '',
 password_confirmation: ''
 });

 const [loading, setLoading] = useState(false);
 const [passwordLoading, setPasswordLoading] = useState(false);
 const [uploading, setUploading] = useState(false);
 const [cropImage, setCropImage] = useState(null);
 const [success, setSuccess] = useState('');
 const [errors, setErrors] = useState({});

 useEffect(() => {
 doctorApi.getSpecializations().then(setSpecs).catch(console.error);
 }, []);

 useEffect(() => {
 if (user) {
 setForm({
 first_name: user.first_name || '',
 last_name: user.last_name || '',
 license_number: user.license_number || '',
 contact_number: user.contact_number || '',
 email: user.email || '',
 years_of_experience: user.years_of_experience || '',
 consultation_fee: user.consultation_fee || '',
 specialization_ids: user.specializations?.map(s => s.specialization_id) || (user.specialization_id ? [user.specialization_id] : []),
 });
 }
 }, [user]);

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

 if (specializations.length > 0) {
 specializations.forEach(s => {
 const found = all.find(x => x.name === s.specialization_name || x.name === s.name);
 if (found) {
 found.specialization_id = s.specialization_id;
 found.description = s.description || found.description;
 } else {
 all.push({ specialization_id: s.specialization_id, name: s.specialization_name || s.name, description: s.description });
 }
 });
 }
 return all;
 }, [specializations]);

 const update = (key, val) => setForm({ ...form, [key]: val });
 
 const handleSave = async () => {
 try {
 setLoading(true);
 setErrors({});
 await doctorApi.updateProfile(form);
 await fetchUser();
 setSuccess('Profile updated successfully!');
 setTimeout(() => setSuccess(''), 3000);
 } catch (error) {
 setErrors(error.response?.data?.errors || { general: 'Failed to save profile.' });
 } finally {
 setLoading(false);
 }
 };

 const handlePasswordSave = async (e) => {
 e.preventDefault();
 if (passwords.password !== passwords.password_confirmation) {
 setErrors({ password_confirmation: "Passwords do not match." });
 return;
 }
 try {
 setPasswordLoading(true);
 setErrors({});
 await doctorApi.updatePassword(passwords);
 setPasswords({ current_password: '', password: '', password_confirmation: '' });
 setSuccess('Password changed successfully!');
 setTimeout(() => setSuccess(''), 3000);
 } catch (error) {
 setErrors(error.response?.data?.errors || { password_general: error.response?.data?.message || 'Failed to change password.' });
 } finally {
 setPasswordLoading(false);
 }
 };

 const handlePhotoSelect = (e) => {
 const file = e.target.files?.[0];
 if (!file) return;
 const reader = new FileReader();
 reader.onload = () => setCropImage(reader.result);
 reader.readAsDataURL(file);
 e.target.value = null;
 };

 const handleCropComplete = async (blob) => {
 setCropImage(null);
 setUploading(true);
 const fd = new FormData();
 fd.append('photo', blob, 'profile.jpg');
 try {
 await doctorApi.uploadPhoto(fd);
 await fetchUser();
 setSuccess('Profile photo updated!');
 setTimeout(() => setSuccess(''), 3000);
 } catch (error) {
 alert("Failed to upload photo.");
 } finally {
 setUploading(false);
 }
 };

 const pfp = user?.profile_picture 
 ? `${import.meta.env.VITE_BACKEND_URL}/storage/${user.profile_picture}` 
 : `https://ui-avatars.com/api/?name=${user?.first_name}+${user?.last_name}&background=random`;

 return (
 <div className="max-w-5xl mx-auto">
 {cropImage && <ImageCropper image={cropImage} onCancel={() => setCropImage(null)} onCropComplete={handleCropComplete} />}
 
 <PageHeader title="Account Settings" subtitle="Manage your doctor profile, email, and security." />

 {success && (
 <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 text-emerald-800 dark:text-emerald-400 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 animate-duration-300">
 <CheckCircle2 size={20} />
 <span className="font-bold text-sm">{success}</span>
 </div>
 )}

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 
 {/* Left Column - Forms */}
 <div className="lg:col-span-2 space-y-6">
 <Card className="p-6">
 <h2 className="text-lg font-bold mb-6">Personal Information</h2>
 {errors.general && <div className="mb-4 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 p-3 rounded-lg border border-red-200 dark:border-red-800">{errors.general}</div>}
 
 <div className="grid md:grid-cols-2 gap-5">
 <div>
 <Input label="First Name" value={form.first_name} onChange={v => update('first_name', v)} />
 {errors.first_name && <p className="text-xs text-red-500 mt-1">{errors.first_name}</p>}
 </div>
 <div>
 <Input label="Last Name" value={form.last_name} onChange={v => update('last_name', v)} />
 {errors.last_name && <p className="text-xs text-red-500 mt-1">{errors.last_name}</p>}
 </div>
 <div>
 <Input label="License Number" value={form.license_number} onChange={v => update('license_number', v)} />
 {errors.license_number && <p className="text-xs text-red-500 mt-1">{errors.license_number}</p>}
 </div>
 <div>
 <Input label="Contact Number" value={form.contact_number} onChange={v => update('contact_number', v)} />
 {errors.contact_number && <p className="text-xs text-red-500 mt-1">{errors.contact_number}</p>}
 </div>
 <div className="md:col-span-2">
 <Input label="Email Address" value={form.email} onChange={v => update('email', v)} />
 {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
 </div>
 <div>
 <Input type="number" label="Years of Experience" value={form.years_of_experience} onChange={v => update('years_of_experience', v)} />
 {errors.years_of_experience && <p className="text-xs text-red-500 mt-1">{errors.years_of_experience}</p>}
 </div>
 <div>
 <Input type="number" label="Consultation Fee ($)" value={form.consultation_fee} onChange={v => update('consultation_fee', v)} />
 {errors.consultation_fee && <p className="text-xs text-red-500 mt-1">{errors.consultation_fee}</p>}
 </div>
 <div className="md:col-span-2">
 <div className="flex items-center justify-between mb-2">
 <p className="font-bold text-xs text-slate-500 uppercase tracking-wide">Specializations</p>
 {!showNewSpec && (
 <button type="button" onClick={() => setShowNewSpec(true)} className="text-[10px] bg-teal-500/10 text-teal-600 dark:text-teal-400 px-3 py-1.5 rounded-lg font-bold hover:bg-teal-500/20 transition-all border border-teal-500/20 shadow-sm">
 + Other Specialization
 </button>
 )}
 </div>
 
 <div className="space-y-3">
 <div className="flex flex-wrap gap-2 mb-2 p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/30 dark:bg-slate-800/30">
 {(form.specialization_ids || []).length === 0 && <span className="text-slate-400 text-xs italic">No specializations linked yet.</span>}
 {(form.specialization_ids || []).map(id => {
 const sp = displaySpecs.find(x => x.specialization_id === id);
 const isNew = typeof id === 'string' && id.startsWith('NEW:');
 const label = isNew ? id.replace('NEW:', '') : (sp?.name || 'Unknown');
 return (
 <span key={id} className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-sm transition-all animate-in zoom-in-95">
 {label}
 <button type="button" onClick={() => setForm(p => ({ ...p, specialization_ids: (p.specialization_ids || []).filter(x => x !== id) }))} className="ml-1 hover:text-red-500 font-bold">×</button>
 </span>
 );
 })}
 </div>
 
 {!showNewSpec ? (
 <div className="space-y-3 relative group">
 <div className="relative flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all">
 <select value="" onChange={e => {
 const val = parseInt(e.target.value);
 if (val && !(form.specialization_ids || []).includes(val)) {
 update('specialization_ids', [...(form.specialization_ids || []), val]);
 }
 }}
 className="w-full bg-transparent py-3 outline-none text-sm font-medium text-slate-900 dark:text-white border-none focus:ring-0">
 <option value="" className="dark:bg-slate-800">— Browse All Specializations —</option>
 {Object.entries(
 displaySpecs
 .filter(s => !(form.specialization_ids || []).includes(s.specialization_id))
 .reduce((acc, sp) => {
 const cat = sp.description || 'General Medicine & Primary Care';
 if (!acc[cat]) acc[cat] = [];
 acc[cat].push(sp);
 return acc;
 }, {})
 ).map(([cat, items]) => (
 <optgroup key={cat} label={cat.toUpperCase()} className="dark:bg-slate-800">
 {items.map(s => (
 <option key={s.specialization_id} value={s.specialization_id} className="dark:bg-slate-800">{s.name}</option>
 ))}
 </optgroup>
 ))}
 </select>
 </div>
 </div>
 ) : (
 <div className="bg-teal-500/5 dark:bg-teal-500/10 p-5 rounded-2xl border border-teal-500/20 space-y-3 shadow-xl">
 <p className="text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-[0.2em] flex items-center gap-2">
 <span className="w-2 h-2 bg-teal-500 rounded-full animate-ping"/>
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
 if (!(form.specialization_ids || []).includes(newId)) {
 update('specialization_ids', [...(form.specialization_ids || []), newId]);
 }
 setNewSpecName('');
 setShowNewSpec(false);
 }
 }
 }}
 className="w-full border border-teal-500/30 dark:border-teal-500/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500/20 dark:bg-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500" 
 />
 </div>
 <div className="flex gap-2">
 <button 
 type="button" 
 onClick={() => {
 if (!newSpecName.trim()) return;
 const newId = `NEW:${newSpecName.trim()}`;
 if (!(form.specialization_ids || []).includes(newId)) {
 update('specialization_ids', [...(form.specialization_ids || []), newId]);
 }
 setNewSpecName('');
 setShowNewSpec(false);
 }} 
 className="flex-1 sm:flex-none bg-teal-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:opacity-90 shadow-lg"
 >
 Confirm
 </button>
 <button 
 type="button" 
 onClick={() => { setShowNewSpec(false); setNewSpecName(''); }} 
 className="flex-1 sm:flex-none px-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest"
 >
 Cancel
 </button>
 </div>
 </div>
 {!newSpecName.trim() && <p className="text-[10px] text-red-500 dark:text-red-400 font-bold italic px-1"> Please enter a name or click cancel</p>}
 </div>
 )}
 {errors.specialization_ids && <p className="text-xs text-red-500 mt-2 font-bold flex items-center gap-1 px-1"> {errors.specialization_ids}</p>}
 </div>
 </div>
 </div>
 
 <div className="mt-8 flex justify-end gap-3">
 <Button onClick={handleSave} disabled={loading}>
 {loading && <Loader2 className="animate-spin mr-2" size={16} />}
 Save Changes
 </Button>
 </div>
 </Card>

 <Card className="p-6">
 <h2 className="text-lg font-bold mb-6">Change Password</h2>
 {errors.password_general && <div className="mb-4 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 p-3 rounded-lg border border-red-200 dark:border-red-800">{errors.password_general}</div>}
 
 <div className="space-y-5 max-w-md">
 <div>
 <Input type="password" label="Current Password" value={passwords.current_password} onChange={v => setPasswords(p => ({ ...p, current_password: v }))} />
 {errors.current_password && <p className="text-xs text-red-500 mt-1">{errors.current_password}</p>}
 </div>
 <div>
 <Input type="password" label="New Password" value={passwords.password} onChange={v => setPasswords(p => ({ ...p, password: v }))} />
 {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
 </div>
 <div>
 <Input type="password" label="Confirm New Password" value={passwords.password_confirmation} onChange={v => setPasswords(p => ({ ...p, password_confirmation: v }))} />
 {errors.password_confirmation && <p className="text-xs text-red-500 mt-1">{errors.password_confirmation}</p>}
 </div>
 </div>
 
 <div className="mt-8">
 <Button onClick={handlePasswordSave} disabled={passwordLoading}>
 {passwordLoading && <Loader2 className="animate-spin mr-2" size={16} />}
 Update Password
 </Button>
 </div>
 </Card>
 </div>

 {/* Right Column - Profile Card */}
 <div>
 <Card className="p-6 text-center">
 <div className="relative mx-auto w-32 h-32 mb-4 group">
 <div className="w-full h-full rounded-full overflow-hidden border-4 border-slate-50 dark:border-slate-800 shadow-xl bg-slate-100 flex items-center justify-center">
 {uploading ? (
 <Loader2 className="animate-spin text-teal-600" size={32} />
 ) : (
 <img src={pfp} className="w-full h-full object-cover animate-in fade-in" />
 )}
 </div>
 <button 
 onClick={() => fileInputRef.current?.click()}
 className="absolute bottom-0 right-0 p-2.5 bg-teal-600 text-white rounded-full shadow-lg hover:scale-110 transition-transform border-4 border-white dark:border-slate-900 animate-in zoom-in"
 >
 <Camera size={18} />
 </button>
 <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoSelect} />
 </div>
 
 <h3 className="font-bold text-xl">{user?.first_name} {user?.last_name}</h3>
 <p className="text-teal-600 font-semibold text-sm mb-6 uppercase tracking-wider">{user?.specialization?.specialization_name || 'Medical Doctor'}</p>
 
 <div className="space-y-3 text-left">
 <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
 <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Doctor ID</p>
 <p className="text-sm font-bold text-slate-900 dark:text-white">{user?.doctor_id || 'DOC-DEFAULT'}</p>
 </div>
 <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
 <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Email Address</p>
 <p className="text-sm font-medium text-slate-900 dark:text-white break-all">{user?.email}</p>
 </div>
 <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
 <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Contact Number</p>
 <p className="text-sm font-medium text-slate-900 dark:text-white">{user?.contact_number || '—'}</p>
 </div>
 </div>
 </Card>
 </div>

 </div>
 </div>
 );
}

function Input({ label, value, onChange, type = "text" }) {
 return (
 <label className="block">
 <p className="font-bold text-xs text-slate-500 uppercase mb-2 tracking-wide">{label}</p>
 <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all">
 <input 
 type={type}
 value={value} 
 onChange={e => onChange(e.target.value)} 
 className="w-full bg-transparent py-3 outline-none text-sm font-medium text-slate-900 dark:text-white"
 />
 </div>
 </label>
 );
}
