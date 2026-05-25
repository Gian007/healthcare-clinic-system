import { useEffect, useMemo, useState } from 'react';
import { FaEye as Eye, FaSearch as Search } from 'react-icons/fa';
import { getAppointments, createServiceRequest } from '../../api/doctorApi';
import { getServices, getDoctors } from '../../api/publicApi';
import { Badge, Card, Modal, PageHeader } from '../../components/doctor/DoctorUI';

export default function DoctorAppointments() {
 const [rows, setRows] = useState([]);
 const [q, setQ] = useState('');
 const [loading, setLoading] = useState(true);
 const [selected, setSelected] = useState(null);

 // Form states for service recommendations
 const [allServices, setAllServices] = useState([]);
 const [allDoctors, setAllDoctors] = useState([]);
 const [recommendType, setRecommendType] = useState('procedure'); // 'procedure', 'followup', 'referral'
 const [referredDoctorId, setReferredDoctorId] = useState('');
 const [selectedServiceIds, setSelectedServiceIds] = useState([]);
 const [remarks, setRemarks] = useState('');
 const [priority, setPriority] = useState('normal');
 const [preferredSchedule, setPreferredSchedule] = useState('');
 const [submitting, setSubmitting] = useState(false);
 const [recommendSuccess, setRecommendSuccess] = useState(false);

 useEffect(() => {
 loadAppointments();
 getServices()
 .then(res => setAllServices(res || []))
 .catch(console.error);
 getDoctors()
 .then(res => setAllDoctors(res || []))
 .catch(console.error);
 }, []);

 useEffect(() => {
 if (selected) {
 setRecommendType('procedure');
 setReferredDoctorId('');
 setSelectedServiceIds([]);
 setRemarks('');
 setPriority('normal');
 setPreferredSchedule('');
 setRecommendSuccess(false);
 }
 }, [selected]);

 const loadAppointments = async () => {
 setLoading(true);
 try {
 const data = await getAppointments();
 setRows(data || []);
 } catch (error) {
 console.error("Failed to load appointments:", error);
 } finally {
 setLoading(false);
 }
 };

 const handleRecommendSubmit = async (e) => {
 e.preventDefault();
 
 let serviceIds = [];
 if (recommendType === 'procedure') {
 serviceIds = selectedServiceIds;
 } else if (recommendType === 'followup') {
 const followupService = allServices.find(s => 
 (s.service_type === 'doctor_requested' || s.service_type === 'consultation') && 
 (s.name.toLowerCase().includes('follow-up') || s.name.toLowerCase().includes('checkup'))
 );
 if (followupService) {
 serviceIds = [followupService.id || followupService.service_id];
 } else {
 const genConsult = allServices.find(s => s.name.toLowerCase().includes('general'));
 if (genConsult) serviceIds = [genConsult.id || genConsult.service_id];
 }
 } else if (recommendType === 'referral') {
 const refDoc = allDoctors.find(d => String(d.doctor_id) === String(referredDoctorId));
 if (!refDoc) {
 alert("Please select a doctor to refer to.");
 return;
 }
 
 const refSpecializationId = refDoc.specialization_id;
 const matchingService = allServices.find(s => 
 s.service_type === 'consultation' && 
 (s.required_specialization === refSpecializationId || s.required_specialization_id === refSpecializationId)
 );
 
 if (matchingService) {
 serviceIds = [matchingService.id || matchingService.service_id];
 } else {
 const genConsult = allServices.find(s => s.name.toLowerCase().includes('general'));
 if (genConsult) serviceIds = [genConsult.id || genConsult.service_id];
 }
 }

 if (serviceIds.length === 0) {
 alert("Please select at least one procedure or referred doctor.");
 return;
 }

 setSubmitting(true);
 setRecommendSuccess(false);
 try {
 await createServiceRequest({
 patient_id: selected.patient_id,
 referred_doctor_id: recommendType === 'referral' ? referredDoctorId : null,
 related_appointment_id: selected.appointment_id,
 remarks,
 priority,
 service_ids: serviceIds,
 preferred_schedule: preferredSchedule
 });
 setRecommendSuccess(true);
 setSelectedServiceIds([]);
 setRemarks('');
 setPriority('normal');
 setReferredDoctorId('');
 setPreferredSchedule('');
 setTimeout(() => setRecommendSuccess(false), 5000);
 } catch (err) {
 console.error(err);
 alert(err.response?.data?.message || 'Failed to submit recommendation.');
 } finally {
 setSubmitting(false);
 }
 };

 const filtered = useMemo(() => rows.filter(r =>
 `${r.patient?.first_name || ''} ${r.patient?.last_name || ''} ${r.patient?.patient_number || ''} ${r.service?.service_name || ''} ${r.booking_status || ''}`
 .toLowerCase()
 .includes(q.toLowerCase())
 ), [rows, q]);

 // Filtered lists for rendering
 const procedureServices = useMemo(() => {
 return allServices.filter(s => 
 s.service_type === 'doctor_requested' && 
 !s.name.toLowerCase().includes('follow-up') && 
 !s.name.toLowerCase().includes('checkup')
 );
 }, [allServices]);

 const otherDoctors = useMemo(() => {
 if (!selected) return allDoctors;
 return allDoctors.filter(d => d.doctor_id !== selected.doctor_id && d.status === 'Active');
 }, [allDoctors, selected]);

 const estimatedCost = useMemo(() => {
 if (recommendType === 'procedure') {
 return selectedServiceIds.reduce((sum, id) => {
 const s = allServices.find(srv => (srv.id || srv.service_id) === id);
 return sum + (s ? Number(s.price || s.base_fee) : 0);
 }, 0);
 }
 if (recommendType === 'followup') {
 const s = allServices.find(srv => 
 (srv.service_type === 'doctor_requested' || srv.service_type === 'consultation') && 
 (srv.name.toLowerCase().includes('follow-up') || srv.name.toLowerCase().includes('checkup'))
 );
 return s ? Number(s.price || s.base_fee) : 400;
 }
 if (recommendType === 'referral') {
 const doc = allDoctors.find(d => String(d.doctor_id) === String(referredDoctorId));
 if (doc) {
 if (doc.consultation_fee) return Number(doc.consultation_fee);
 const refSpecializationId = doc.specialization_id;
 const s = allServices.find(srv => 
 srv.service_type === 'consultation' && 
 (srv.required_specialization === refSpecializationId || srv.required_specialization_id === refSpecializationId)
 );
 if (s) return Number(s.price || s.base_fee);
 }
 return 500;
 }
 return 0;
 }, [recommendType, selectedServiceIds, referredDoctorId, allServices, allDoctors]);

 return (
 <div>
 <PageHeader title="Appointments" subtitle="View patient appointment details. Status is updated automatically from queue completion." />

 <Card className="p-5 overflow-x-auto">
 <div className="flex flex-col md:flex-row justify-between gap-3 mb-6">
 <h2 className="font-bold">All Appointments</h2>
 <div className="relative">
 <Search size={16} className="absolute left-3 top-3 text-slate-400" />
 <input
 value={q}
 onChange={e => setQ(e.target.value)}
 placeholder="Search patients..."
 className="pl-10 pr-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 outline-none w-full md:w-72"
 />
 </div>
 </div>

 {loading ? (
 <div className="text-center py-10">Loading...</div>
 ) : filtered.length === 0 ? (
 <div className="text-center py-10 text-slate-450">No appointments found.</div>
 ) : (
 <table className="w-full text-left border-collapse text-xs">
 <thead>
 <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold">
 <th className="py-3 px-2">Patient</th>
 <th className="py-3 px-2">Date & Time</th>
 <th className="py-3 px-2">Service</th>
 <th className="py-3 px-2">Room</th>
 <th className="py-3 px-2">Status</th>
 <th className="py-3 px-2 text-right">Actions</th>
 </tr>
 </thead>
 <tbody>
 {filtered.map(r => (
 <tr key={r.appointment_id} className="border-b border-slate-50 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
 <td className="py-3 px-2 font-bold text-slate-800 dark:text-slate-200">
 <div>{patientName(r.patient)}</div>
 <div className="text-[10px] text-slate-400 mt-0.5">{r.patient?.patient_number}</div>
 </td>
 <td className="py-3 px-2">
 <div>{r.appointment_date}</div>
 <div className="text-[10px] text-slate-400 mt-0.5">{r.start_time} - {r.end_time}</div>
 </td>
 <td className="py-3 px-2 font-semibold">{r.service?.name || r.service?.service_name}</td>
 <td className="py-3 px-2 text-slate-500">{r.room || 'Room A'}</td>
 <td className="py-3 px-2">
 <Badge tone={statusTone(r.booking_status)}>{r.booking_status}</Badge>
 </td>
 <td className="py-3 px-2 text-right">
 <button
 onClick={() => setSelected(r)}
 className="bg-teal-500/10 hover:bg-teal-500/25 text-teal-600 dark:text-teal-400 px-3 py-1.5 rounded-lg font-bold transition"
 >
 <Eye size={12} className="inline mr-1" /> View Details
 </button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 )}
 </Card>

 {/* Patient & Consultation Details Modal */}
 {selected && (
 <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Consultation Details">
 <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-1">
 {/* Patient Header */}
 <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
 <div className="w-12 h-12 rounded-full bg-teal-500/10 text-teal-600 font-bold flex items-center justify-center text-lg shrink-0">
 {initials(selected.patient)}
 </div>
 <div>
 <h3 className="font-extrabold text-slate-900 dark:text-white">{patientName(selected.patient)}</h3>
 <p className="text-xs text-slate-400 mt-0.5">{selected.patient?.patient_number} • {selected.patient?.sex} • {selected.patient?.birth_date}</p>
 </div>
 </div>

 {/* Visit Details */}
 <div className="grid grid-cols-2 gap-4">
 <Info label="Service Type" value={selected.service?.name || selected.service?.service_name} />
 <Info label="Appointment Date" value={selected.appointment_date} />
 <Info label="Consultation Time" value={`${selected.start_time} - ${selected.end_time}`} />
 <Info label="Room assigned" value={selected.room || 'Clinic Room'} />
 <div className="col-span-2">
 <Info label="Patient Complaint / Notes" value={selected.reason_for_visit || 'None provided'} />
 </div>
 </div>

 {/* Recommend Clinical Procedure Box */}
 <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 p-5 rounded-2xl space-y-4">
 <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
 <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Recommend Clinical Procedure</h3>
 <p className="text-[11px] text-slate-400 mt-0.5">Determine next steps, diagnostics, specialist referrals, or procedures.</p>
 </div>

 {recommendSuccess && (
 <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl p-3 text-xs font-bold text-center">
 Recommendation submitted successfully!
 </div>
 )}

 <form onSubmit={handleRecommendSubmit} className="space-y-4">
 {/* 1. Recommendation Type Selection */}
 <div>
 <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Recommendation Type</label>
 <div className="grid grid-cols-3 gap-2">
 <button
 type="button"
 onClick={() => setRecommendType('procedure')}
 className={`py-2 px-1 text-[11px] font-bold rounded-xl border text-center transition-all ${
 recommendType === 'procedure'
 ? "bg-teal-600 text-white border-teal-650 shadow-sm"
 : "bg-white hover:bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-350 dark:border-slate-700"
 }`}
 >
 Procedures / Labs
 </button>
 <button
 type="button"
 onClick={() => setRecommendType('followup')}
 className={`py-2 px-1 text-[11px] font-bold rounded-xl border text-center transition-all ${
 recommendType === 'followup'
 ? "bg-teal-600 text-white border-teal-650 shadow-sm"
 : "bg-white hover:bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-350 dark:border-slate-700"
 }`}
 >
 Follow-Up
 </button>
 <button
 type="button"
 onClick={() => setRecommendType('referral')}
 className={`py-2 px-1 text-[11px] font-bold rounded-xl border text-center transition-all ${
 recommendType === 'referral'
 ? "bg-teal-600 text-white border-teal-650 shadow-sm"
 : "bg-white hover:bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-350 dark:border-slate-700"
 }`}
 >
 Refer Doctor
 </button>
 </div>
 </div>

 {/* 2. Type Conditional Content */}
 {recommendType === 'procedure' && (
 <div>
 <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5">Select Procedure(s)</label>
 <div className="max-h-40 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-xl p-2 bg-white dark:bg-slate-850 space-y-1.5">
 {procedureServices.map(s => {
 const isSelected = selectedServiceIds.includes(s.id || s.service_id);
 return (
 <label key={s.id || s.service_id} className="flex items-center gap-2 cursor-pointer p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
 <input 
 type="checkbox" 
 checked={isSelected}
 onChange={() => {
 setSelectedServiceIds(prev => 
 isSelected 
 ? prev.filter(id => id !== (s.id || s.service_id))
 : [...prev, s.id || s.service_id]
 );
 }}
 className="rounded text-teal-600 focus:ring-teal-500/20"
 />
 <div className="flex-1 flex justify-between items-center text-xs">
 <span className="font-semibold text-slate-700 dark:text-slate-350">{s.name || s.service_name}</span>
 <span className="font-bold text-teal-605 dark:text-teal-400">₱{Number(s.price || s.base_fee).toFixed(2)}</span>
 </div>
 </label>
 );
 })}
 </div>
 </div>
 )}

 {recommendType === 'followup' && (
 <div className="p-3 bg-teal-500/5 border border-teal-500/10 rounded-xl text-[11px] text-slate-500 dark:text-slate-400 text-left">
 This will recommend a <strong>Follow-Up Consultation</strong> with you for review (e.g. return visit in 7 days).
 </div>
 )}

 {recommendType === 'referral' && (
 <div className="space-y-3">
 <div>
 <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Select Specialist Doctor</label>
 <select
 value={referredDoctorId}
 onChange={e => setReferredDoctorId(e.target.value)}
 required
 className="w-full text-xs border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
 >
 <option value="">-- Select Specialist --</option>
 {otherDoctors.map(d => (
 <option key={d.doctor_id} value={d.doctor_id}>
 Dr. {d.first_name} {d.last_name} ({d.specialization?.specialization_name || 'Specialist'})
 </option>
 ))}
 </select>
 </div>
 </div>
 )}

 {/* 3. Cost Estimator */}
 {estimatedCost > 0 && (
 <div className="flex justify-between items-center bg-teal-500/5 dark:bg-teal-500/10 border border-teal-500/10 rounded-xl px-4 py-2 text-xs">
 <span className="font-semibold text-slate-500">Estimated Total Cost:</span>
 <span className="font-black text-teal-600 dark:text-teal-400 text-sm">
 ₱{estimatedCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
 </span>
 </div>
 )}

 {/* 4. Priority */}
 <div>
 <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5">Priority Level</label>
 <div className="flex gap-4">
 <label className="flex items-center gap-2 text-xs cursor-pointer">
 <input 
 type="radio" 
 name="priority" 
 value="normal" 
 checked={priority === 'normal'}
 onChange={() => setPriority('normal')}
 className="text-teal-650 focus:ring-teal-500/20"
 />
 <span>Normal</span>
 </label>
 <label className="flex items-center gap-2 text-xs cursor-pointer">
 <input 
 type="radio" 
 name="priority" 
 value="urgent" 
 checked={priority === 'urgent'}
 onChange={() => setPriority('urgent')}
 className="text-teal-650 focus:ring-teal-500/20"
 />
 <span className="font-bold text-red-500">Urgent</span>
 </label>
 </div>
 </div>

 {/* Preferred Schedule */}
 <div>
 <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Preferred Schedule / Timeline (optional)</label>
 <input 
 type="text"
 value={preferredSchedule}
 onChange={e => setPreferredSchedule(e.target.value)}
 placeholder="e.g. Return in 7 days, 2026-06-02, or Next week"
 className="w-full text-xs border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-teal-500/20"
 />
 </div>

 {/* 5. Remarks */}
 <div>
 <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Reason / Clinical Notes</label>
 <textarea 
 value={remarks}
 onChange={e => setRemarks(e.target.value)}
 placeholder="Provide detailed clinical notes, instructions, or evaluation purpose..."
 rows={2.5}
 className="w-full text-xs border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-teal-500/20 resize-none"
 />
 </div>

 <button 
 type="submit" 
 disabled={submitting || (recommendType === 'procedure' && selectedServiceIds.length === 0) || (recommendType === 'referral' && !referredDoctorId)}
 className="w-full bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold py-2.5 rounded-xl transition disabled:opacity-40"
 >
 {submitting ? 'Submitting...' : 'Send Recommendation'}
 </button>
 </form>
 </div>
 </div>
 </Modal>
 )}
 </div>
 );
}

function Info({ label, value }) {
 return (
 <div className="rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 p-3 text-left">
 <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
 <p className="mt-1 font-semibold text-slate-800 dark:text-slate-100 break-words">{value}</p>
 </div>
 );
}

function patientName(patient) {
 if (!patient) return 'Unknown Patient';
 return [patient.first_name, patient.middle_name, patient.last_name].filter(Boolean).join(' ');
}

function initials(patient) {
 if (!patient) return '?';
 return `${patient.first_name?.[0] || ''}${patient.last_name?.[0] || ''}` || '?';
}

function statusTone(status) {
 if (status === 'Pending') return 'yellow';
 if (status === 'Completed') return 'green';
 if (status === 'Cancelled' || status === 'No Show') return 'red';
 return 'blue';
}
