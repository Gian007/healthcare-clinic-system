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

const BLANK = { service_name: '', description: '', duration_mins: 30, base_fee: 0, specialization_ids: [] };

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

  // Full Medical Registry Fallback - Loops through every specialization provided by USER
  const displaySpecs = useMemo(() => {
    const registry = [
      { cat: 'Recommended Starter List', names: ["General Medicine", "Pediatrics", "OB-GYNE", "Dentistry", "Dermatology", "ENT", "Orthopedics", "Cardiology", "Ophthalmology", "General Surgery", "Radiology", "Physical Therapy", "Psychiatry"] },
      { cat: 'Core General Specializations', names: ["General Medicine", "Family Medicine", "Internal Medicine", "General Practitioner (GP)", "Pediatrics", "OB-GYNE (Obstetrics and Gynecology)", "Dermatology", "ENT (Ear, Nose, and Throat)", "Ophthalmology", "Orthopedics", "Cardiology", "Neurology", "Psychiatry", "Pulmonology", "Gastroenterology", "Nephrology", "Urology", "Endocrinology", "Rheumatology", "Infectious Disease", "Oncology", "Geriatrics"] },
      { cat: 'Surgical Specializations', names: ["General Surgery", "Cardiothoracic Surgery", "Neurosurgery", "Orthopedic Surgery", "Plastic Surgery", "Vascular Surgery", "Pediatric Surgery", "Urologic Surgery", "Surgical Oncology"] },
      { cat: 'Dental & Oral', names: ["Dentistry", "Orthodontics", "Oral Surgery", "Pediatric Dentistry", "Prosthodontics"] },
      { cat: 'Women & Child Care', names: ["Maternal Care", "Fertility Specialist", "Neonatology", "Pediatric Cardiology", "Pediatric Neurology"] },
      { cat: 'Diagnostic & Imaging', names: ["Radiology", "Ultrasound Specialist", "Pathology", "Laboratory Medicine"] },
      { cat: 'Emergency & Critical Care', names: ["Emergency Medicine", "Trauma Care", "Critical Care Medicine", "Intensive Care Unit (ICU)"] },
      { cat: 'Therapy & Rehabilitation', names: ["Physical Therapy", "Occupational Therapy", "Speech Therapy", "Rehabilitation Medicine"] },
      { cat: 'Mental Health', names: ["Psychology", "Psychiatry", "Behavioral Therapy"] },
      { cat: 'Clinic Support Roles', names: ["Nurse", "Nurse Assistant", "Midwife", "Pharmacist", "Medical Technologist", "Receptionist", "Laboratory Technician", "Radiologic Technologist"] }
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
      service_name: s.service_name, 
      description: s.description||'', 
      duration_mins: s.estimated_duration, 
      base_fee: s.base_fee || 0, 
      specialization_ids: s.specializations?.map(x => x.specialization_id) || (s.specialization_id ? [s.specialization_id] : [])
    }); 
    setFormErrors({}); 
    setShowNewSpec(false); 
    setNewSpecName(''); 
    setModal({ service: s }); 
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true); setFormErrors({});
    try {
      const currentSpecIds = [];
      
      // Separate existing IDs from temporary NEW entries
      for (const entry of formData.specialization_ids) {
        if (typeof entry === 'string' && entry.startsWith('NEW:')) {
          const name = entry.replace('NEW:', '');
          const res = await adminApi.createSpecialization({ name });
          currentSpecIds.push(res.specialization.specialization_id);
        } else {
          currentSpecIds.push(entry);
        }
      }

      if (currentSpecIds.length === 0) {
        setFormErrors({ specialization_ids: 'At least one specialization is required.' });
        setSaving(false);
        return;
      }

      const payload = { 
        ...formData, 
        specialization_ids: currentSpecIds 
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
      fetch();
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
            <div key={s.service_id} className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{s.service_name}</h3>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {s.specializations?.length > 0 ? s.specializations.map(sp => (
                      <span key={sp.specialization_id} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded font-bold border border-slate-200 dark:border-slate-700">{sp.name}</span>
                    )) : <p className="text-xs text-teal-600 font-bold uppercase tracking-wider">{s.specialization?.name || 'No Specialization'}</p>}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{s.description || 'No description'}</p>
                  <p className="text-xs text-teal-600 mt-2 font-medium">⏱️ {s.estimated_duration} mins • ₱{s.base_fee}</p>
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Specializations <span className="text-red-500">*</span></label>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2 mb-2 p-3 border border-gray-200 dark:border-slate-700 rounded-xl min-h-[50px] bg-gray-50/50 dark:bg-slate-800/30">
                  {formData.specialization_ids.length === 0 && <span className="text-gray-400 text-sm italic">No specializations selected.</span>}
                  {formData.specialization_ids.map((id, index) => {
                    const sp = displaySpecs.find(x => x.specialization_id === id);
                    const isNew = typeof id === 'string' && id.startsWith('NEW:');
                    const label = isNew ? id.replace('NEW:', '') : (sp?.name || 'Unknown');
                    return (
                      <span key={id + index} className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-bold px-2.5 py-1.5 rounded-lg border border-primary/20 shadow-sm transition-all hover:bg-primary/20 animate-in zoom-in-95 duration-150">
                        {label}
                        <button type="button" onClick={() => setFormData(p => ({ ...p, specialization_ids: p.specialization_ids.filter(x => x !== id) }))} className="hover:text-red-500 font-bold ml-1 transition-colors">×</button>
                      </span>
                    );
                  })}
                </div>

                {!showNewSpec ? (
                  <div className="space-y-2 relative group">
                    <input 
                      type="text" 
                      placeholder="Search or browse all specializations..." 
                      value={specSearch} 
                      onChange={e => setSpecSearch(e.target.value)}
                      onFocus={() => { if(!specSearch) setSpecSearch(' '); setTimeout(()=>setSpecSearch(''), 10); }}
                      className="w-full border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 dark:bg-slate-800 dark:text-white"
                    />
                    <div className="absolute z-[60] w-full mt-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl shadow-2xl max-h-80 overflow-y-auto hidden group-focus-within:block transition-all border-t-4 border-t-primary">
                      {displaySpecs.filter(sp => 
                        sp.name.toLowerCase().includes(specSearch.toLowerCase()) && 
                        !formData.specialization_ids.includes(sp.specialization_id)
                      ).length === 0 ? (
                        <div className="p-8 text-center bg-slate-50/50 dark:bg-slate-800/20">
                          <p className="text-sm text-slate-500 font-bold mb-4 italic">"{specSearch || 'Type something'}" is not in our medical registry.</p>
                          <button type="button" onClick={() => { setShowNewSpec(true); setNewSpecName(specSearch); setSpecSearch(''); }} className="bg-primary text-white text-xs font-black px-6 py-3 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 uppercase tracking-widest">
                            + Register "{specSearch}" Now
                          </button>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100 dark:divide-slate-800">
                          {Object.entries(
                            displaySpecs.filter(sp => 
                              sp.name.toLowerCase().includes(specSearch.toLowerCase()) && 
                              !formData.specialization_ids.includes(sp.specialization_id)
                            ).reduce((acc, sp) => {
                              const cat = sp.description || 'Medical Registry';
                              if (!acc[cat]) acc[cat] = [];
                              acc[cat].push(sp);
                              return acc;
                            }, {})
                          ).map(([cat, items]) => (
                            <div key={cat} className="group/cat">
                              <div className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800/80 text-[9px] font-black text-primary uppercase tracking-[0.25em] sticky top-0 z-10 border-b border-gray-200 dark:border-slate-700 backdrop-blur-sm shadow-sm">{cat}</div>
                              <div className="py-1">
                                {items.map(sp => (
                                  <button
                                    key={sp.specialization_id}
                                    type="button"
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      setFormData(p => ({ ...p, specialization_ids: [...p.specialization_ids, sp.specialization_id] }));
                                      setSpecSearch('');
                                    }}
                                    className="w-full text-left px-5 py-3.5 hover:bg-primary/10 text-sm dark:text-white transition-all flex items-center justify-between group/item"
                                  >
                                    <div className="flex flex-col">
                                      <span className="font-bold text-slate-700 dark:text-slate-200">{sp.name}</span>
                                      <span className="text-[10px] text-slate-400 group-hover/item:text-primary transition-colors">Click to add to service</span>
                                    </div>
                                    <span className="text-[10px] bg-primary text-white px-2 py-1 rounded-lg font-black opacity-0 group-hover/item:opacity-100 transition-all scale-75 group-hover/item:scale-100">ADD +</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between items-center px-1 pt-1">
                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Registry: {specs.length} fields</p>
                       <button type="button" onClick={() => setShowNewSpec(true)} className="text-[10px] text-primary font-black uppercase tracking-widest hover:underline">+ New Entry</button>
                    </div>
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
                                setFormData(p => ({ ...p, specialization_ids: [...p.specialization_ids, 'NEW:' + newSpecName.trim()] }));
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
                            setFormData(p => ({ ...p, specialization_ids: [...p.specialization_ids, 'NEW:' + newSpecName.trim()] }));
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
                    {!newSpecName.trim() && <p className="text-[10px] text-red-500 dark:text-red-400 font-bold italic px-1">⚠️ Please enter a name or click cancel</p>}
                  </div>
                )}
              </div>
              {formErrors.specialization_ids && <p className="text-xs text-red-500 mt-2 font-bold flex items-center gap-1">⚠️ {formErrors.specialization_ids}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea value={formData.description} rows={3} onChange={e => setFormData(p => ({...p, description: e.target.value}))}
                className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30 dark:bg-slate-800 dark:text-white resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (minutes) <span className="text-red-500">*</span></label>
              <input required type="number" min="5" value={formData.duration_mins} onChange={e => setFormData(p => ({...p, duration_mins: Number(e.target.value)}))}
                className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30 dark:bg-slate-800 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Base Fee (₱) <span className="text-red-500">*</span></label>
              <input required type="number" min="0" value={formData.base_fee} onChange={e => setFormData(p => ({...p, base_fee: Number(e.target.value)}))}
                className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30 dark:bg-slate-800 dark:text-white" />
            </div>
            <button type="submit" disabled={saving} className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50">
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
