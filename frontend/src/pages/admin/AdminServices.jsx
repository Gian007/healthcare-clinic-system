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

const BLANK = { service_name: '', description: '', duration_mins: 30 };

export default function AdminServices() {
  const [services, setServices]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [query, setQuery]         = useState('');
  const [modal, setModal]         = useState(null); // 'add' | { service }
  const [formData, setFormData]   = useState(BLANK);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving]       = useState(false);
  const [success, setSuccess]     = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => { fetch(); }, []);

  const fetch = () => {
    setLoading(true);
    adminApi.getServices()
      .then(setServices)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const list = useMemo(() =>
    services.filter(s => `${s.service_name} ${s.description}`.toLowerCase().includes(query.toLowerCase())),
  [services, query]);

  const openAdd = () => { setFormData(BLANK); setFormErrors({}); setModal('add'); };
  const openEdit = (s) => { setFormData({ service_name: s.service_name, description: s.description||'', duration_mins: s.duration_mins }); setFormErrors({}); setModal({ service: s }); };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true); setFormErrors({});
    try {
      if (modal === 'add') {
        await adminApi.createService(formData);
        setSuccess('Service created successfully!');
      } else {
        await adminApi.updateService(modal.service.service_id, formData);
        setSuccess('Service updated successfully!');
      }
      setModal(null);
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
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{s.description || 'No description'}</p>
                  <p className="text-xs text-teal-600 mt-2 font-medium">⏱️ {s.duration_mins} minutes</p>
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea value={formData.description} rows={3} onChange={e => setFormData(p => ({...p, description: e.target.value}))}
                className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30 dark:bg-slate-800 dark:text-white resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (minutes) <span className="text-red-500">*</span></label>
              <input required type="number" min="5" value={formData.duration_mins} onChange={e => setFormData(p => ({...p, duration_mins: Number(e.target.value)}))}
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
