import { useEffect, useMemo, useState } from "react";
import { PageHeader, Toolbar, Modal } from "../../components/admin/AdminUI";
import * as adminApi from "../../api/adminApi";
import { FaCheckCircle, FaTrash, FaEdit } from "react-icons/fa";

function SuccessModal({ message, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 w-full max-w-sm text-center">
        <FaCheckCircle className="text-green-500 text-4xl mx-auto mb-3" />
        <p className="font-semibold text-gray-900 dark:text-white">{message}</p>
        <button onClick={onClose} className="mt-4 w-full bg-primary text-white py-2.5 rounded-xl font-medium">OK</button>
      </div>
    </div>
  );
}

const BLANK = { 
  service_name: '', 
  description: '', 
  duration_mins: 30, 
  base_fee: 0, 
  specialization_ids: [],
  service_type: 'consultation',
  requires_doctor: true,
  is_publicly_bookable: true,
  requirements_notes: '',
  is_active: true
};

export default function AdminServices() {
  const [services, setServices]   = useState([]);
  const [specs, setSpecs]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [query, setQuery]         = useState('');
  const [modal, setModal]         = useState(null); // 'add' | { service }
  const [formData, setFormData]   = useState(BLANK);
  const [showNewSpec, setShowNewSpec] = useState(false);
  const [newSpecName, setNewSpecName] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving]       = useState(false);
  const [success, setSuccess]     = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [specSearch, setSpecSearch] = useState('');

  useEffect(() => { 
    fetch(); 
    adminApi.getSpecializations()
      .then(res => {
        if (res && res.length > 0) setSpecs(res);
      })
      .catch(e => {
        console.error("Failed to load specs, using fallback", e);
      });
  }, []);

  // Medical Specialization Registry
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
        // Prevent duplicates from multiple categories
        if (!all.find(x => x.name === name)) {
          all.push({ specialization_id: idCounter++, name, description: r.cat });
        }
      });
    });

    // Merge with API specs if any, giving priority to API IDs for existing data
    if (specs.length > 0) {
      specs.forEach(s => {
        const found = all.find(x => x.name === s.name);
        if (found) {
           found.specialization_id = s.specialization_id;
           found.description = s.description || found.description;
        } else {
           all.push(s);
        }
      });
    }
    return all.sort((a,b) => a.name.localeCompare(b.name));
  }, [specs]);

  const fetch = () => {
    setLoading(true);
    adminApi.getServices()
      .then(setServices)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const list = useMemo(() =>
    services.filter(s => `${s.service_name} ${s.description} ${s.specializations?.map(x=>x.name).join(' ')}`.toLowerCase().includes(query.toLowerCase())),
  [services, query]);

  const openAdd = () => { 
    setFormData(BLANK); 
    setFormErrors({}); 
    setShowNewSpec(false); 
    setNewSpecName(''); 
    setModal('add'); 
  };
  const openEdit = (s) => { 
    setFormData({ 
      service_name: s.name || s.service_name, 
      description: s.description||'', 
      duration_mins: s.estimated_duration || 30, 
      base_fee: s.price || s.base_fee || 0, 
      specialization_ids: s.specializations?.map(x => x.specialization_id) || (s.required_specialization ? [s.required_specialization] : (s.specialization_id ? [s.specialization_id] : [])),
      service_type: s.service_type || 'consultation',
      requires_doctor: s.requires_doctor ?? true,
      is_publicly_bookable: s.is_publicly_bookable ?? true,
      requirements_notes: s.requirements_notes || '',
      is_active: s.is_active ?? true
    }); 
    setFormErrors({}); 
    setShowNewSpec(false); 
    setNewSpecName(''); 
    setModal({ service: s }); 
  };

  const handleServiceTypeChange = (type) => {
    setFormData(p => ({
      ...p,
      service_type: type,
      requires_doctor: type === 'consultation' ? true : type === 'direct_service' ? false : p.requires_doctor,
      is_publicly_bookable: type !== 'doctor_requested'
    }));
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true); setFormErrors({});
    try {
      // Resolve each selected entry to a backend-compatible format.
      // Mock IDs (>=999000) are converted to 'NEW:name' so the backend does firstOrCreate.
      // Real DB IDs are passed as-is. NEW: strings are passed as-is.
      const resolvedIds = formData.specialization_ids.map(entry => {
        // Mock ID from the client registry — convert to name string
        if (typeof entry === 'number' && entry >= 999000) {
          const foundSpec = displaySpecs.find(x => x.specialization_id === entry);
          return foundSpec ? 'NEW:' + foundSpec.name : null;
        }
        // Real DB ID — pass through as number
        if (typeof entry === 'number') return entry;
        // Already a NEW: string
        if (typeof entry === 'string') return entry;
        return null;
      }).filter(Boolean);

      const payload = { 
        ...formData, 
        name: formData.service_name,
        specialization_ids: resolvedIds 
      };

      if (modal === 'add') {
        await adminApi.createService(payload);
        setSuccess('Service created successfully!');
      } else {
        await adminApi.updateService(modal.service.service_id, payload);
        setSuccess('Service updated successfully!');
      }
      setModal(null);
      setShowNewSpec(false);
      setNewSpecName('');
      // Refresh specializations list so newly created ones appear with real IDs
      adminApi.getSpecializations().then(res => { if (res?.length > 0) setSpecs(res); }).catch(() => {});
      fetch();
    } catch(err) {
      if (err.response?.data?.errors) {
        const e = {};
        Object.entries(err.response.data.errors).forEach(([k,v]) => e[k] = v[0]);
        setFormErrors(e);
      } else {
        setFormErrors({ general: err.response?.data?.message || 'Failed to save. Please try again.' });
      }
    }
    setSaving(false);
  };

  const deleteService = async () => {
    if (!confirmDelete) return;
    try {
      await adminApi.deleteService(confirmDelete.service_id);
      setSuccess('Service deleted.');
      setConfirmDelete(null);
      fetch();
    } catch(e) { console.error(e); }
  };

  return (
    <div>
      {success && <SuccessModal message={success} onClose={() => setSuccess('')} />}

      <PageHeader title="Manage Services" subtitle="Services offered by the clinic from the database." actionLabel="+ Add Service" onAction={openAdd} />
      <Toolbar query={query} setQuery={setQuery} label="Search services..." />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 animate-pulse">
              <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mb-3"/>
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-full mb-2"/>
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2"/>
            </div>
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-12 text-center">
          <p className="text-4xl mb-3">🩺</p>
          <p className="text-gray-500 dark:text-gray-400">
            {services.length === 0 ? 'No services added yet.' : 'No services match your search.'}
          </p>
          {services.length === 0 && (
            <button onClick={openAdd} className="mt-4 text-primary font-medium hover:underline">Add the first service →</button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {list.map(s => (
            <div key={s.service_id || s.id} className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{s.name || s.service_name}</h3>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {s.specializations?.length > 0 ? s.specializations.map(sp => (
                      <span key={sp.specialization_id} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded font-bold border border-slate-200 dark:border-slate-700">{sp.name}</span>
                    )) : s.specialization ? (
                      <span key={s.specialization.specialization_id} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded font-bold border border-slate-200 dark:border-slate-700">{s.specialization.name || s.specialization.specialization_name}</span>
                    ) : (
                      <span className="text-[10px] bg-gray-100 dark:bg-slate-800 text-gray-500 px-1.5 py-0.5 rounded font-bold border border-gray-200 dark:border-slate-700">No Specialization Required</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{s.description || 'No description'}</p>
                  <p className="text-xs text-teal-650 mt-2 font-medium">⏱️ {s.estimated_duration} mins • ₱{s.price || s.base_fee}</p>
                  
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1 text-xs text-gray-500 dark:text-gray-450">
                    <div><span className="font-medium text-slate-500 dark:text-slate-450">Type:</span> <span className="font-bold text-gray-700 dark:text-gray-300 capitalize">{s.service_type === 'direct_service' ? 'Direct Service' : s.service_type === 'doctor_requested' ? 'Doctor Requested Only' : 'Consultation'}</span></div>
                    <div><span className="font-medium text-slate-500 dark:text-slate-450">Requires Doctor:</span> <span className="font-bold text-gray-750 dark:text-gray-300">{s.requires_doctor ? 'Yes' : 'No'}</span></div>
                    <div><span className="font-medium text-slate-500 dark:text-slate-450">Publicly Bookable:</span> <span className="font-bold text-gray-750 dark:text-gray-300">{s.is_publicly_bookable ? 'Yes' : 'No'}</span></div>
                    <div><span className="font-medium text-slate-500 dark:text-slate-450">Status:</span> <span className={`font-bold ${s.is_active ? 'text-green-600' : 'text-red-500'}`}>{s.is_active ? 'Active' : 'Inactive'}</span></div>
                    {s.requirements_notes && <div><span className="font-medium text-slate-500 dark:text-slate-450">Requirements:</span> <span className="italic text-gray-650 dark:text-gray-400">{s.requirements_notes}</span></div>}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => openEdit(s)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition">
                    <FaEdit />
                  </button>
                  <button onClick={() => setConfirmDelete(s)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition">
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modal !== null && (
        <Modal title={modal === 'add' ? 'Add New Service' : 'Edit Service'} onClose={() => setModal(null)}>
          <form onSubmit={save} className="space-y-4">
            {formErrors.general && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{formErrors.general}</div>}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Service Name <span className="text-red-500">*</span></label>
              <input required value={formData.service_name} onChange={e => setFormData(p => ({...p, service_name: e.target.value}))}
                className={`w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30 dark:bg-slate-800 dark:border-slate-700 dark:text-white ${formErrors.service_name ? 'border-red-400' : 'border-gray-300 dark:border-slate-700'}`} />
              {formErrors.service_name && <p className="text-xs text-red-500 mt-1">{formErrors.service_name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Service Type <span className="text-red-500">*</span></label>
              <select 
                value={formData.service_type} 
                onChange={e => handleServiceTypeChange(e.target.value)}
                className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30 dark:bg-slate-800 dark:text-white"
              >
                <option value="consultation">Consultation</option>
                <option value="direct_service">Direct Service</option>
                <option value="doctor_requested">Doctor Requested Only</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Required Specialization</label>
              <select
                value={formData.specialization_ids[0] || ''}
                onChange={e => {
                  const val = e.target.value;
                  setFormData(p => ({ 
                    ...p, 
                    specialization_ids: val ? [Number(val)] : [] 
                  }));
                }}
                className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30 dark:bg-slate-800 dark:text-white"
              >
                <option value="">None / Not Applicable</option>
                {displaySpecs.map(sp => (
                  <option key={sp.specialization_id} value={sp.specialization_id}>
                    {sp.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea value={formData.description} rows={2} onChange={e => setFormData(p => ({...p, description: e.target.value}))}
                className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30 dark:bg-slate-800 dark:text-white resize-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (mins) <span className="text-red-500">*</span></label>
                <input required type="number" min="5" value={formData.duration_mins} onChange={e => setFormData(p => ({...p, duration_mins: Number(e.target.value)}))}
                  className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30 dark:bg-slate-800 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Base Fee (₱) <span className="text-red-500">*</span></label>
                <input required type="number" min="0" value={formData.base_fee} onChange={e => setFormData(p => ({...p, base_fee: Number(e.target.value)}))}
                  className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30 dark:bg-slate-800 dark:text-white" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Requirements / Notes</label>
              <textarea value={formData.requirements_notes} rows={2} onChange={e => setFormData(p => ({...p, requirements_notes: e.target.value}))}
                placeholder="e.g. Bring school ID, fast for 12 hours before test"
                className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30 dark:bg-slate-800 dark:text-white resize-none" />
            </div>

            <div className="space-y-2 pt-2">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.requires_doctor} 
                  onChange={e => setFormData(p => ({ ...p, requires_doctor: e.target.checked }))}
                  className="w-4 h-4 rounded text-primary focus:ring-primary/30"
                />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Requires Doctor Consultation</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.is_publicly_bookable} 
                  onChange={e => setFormData(p => ({ ...p, is_publicly_bookable: e.target.checked }))}
                  className="w-4 h-4 rounded text-primary focus:ring-primary/30"
                />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Publicly Bookable by Patients</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.is_active} 
                  onChange={e => setFormData(p => ({ ...p, is_active: e.target.checked }))}
                  className="w-4 h-4 rounded text-primary focus:ring-primary/30"
                />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Service is Active / Available</span>
              </label>
            </div>

            <button type="submit" disabled={saving} className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50 mt-4">
              {saving ? 'Saving...' : modal === 'add' ? 'Create Service' : 'Save Changes'}
            </button>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-sm text-center">
            <FaTrash className="text-red-500 text-4xl mx-auto mb-3" />
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Delete Service?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">"{confirmDelete.service_name}" will be permanently deleted.</p>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 border border-gray-300 dark:border-slate-700 py-2.5 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition">Cancel</button>
              <button onClick={deleteService} className="flex-1 bg-red-500 text-white py-2.5 rounded-xl font-medium hover:bg-red-600 transition">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
