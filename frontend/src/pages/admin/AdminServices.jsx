import { useEffect, useMemo, useState } from "react";
import { servicesSeed } from "../../data/adminMockData";
import { Badge, Modal, PageHeader, SelectInput, TextInput, Toolbar } from "../../components/admin/AdminUI";
import * as adminApi from "../../api/adminApi";

const blank = { Service_Name: "", Description: "", Base_Fee: 0, Estimated_Duration: "30 mins", Service_Status: "Active" };

export default function AdminServices() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(null);
  const [notice, setNotice] = useState("");
  const [usingLocal, setUsingLocal] = useState(false);

  useEffect(() => { loadServices(); }, []);

  const loadServices = async () => {
    try {
      const data = await adminApi.getServices();
      setRecords(data);
    } catch (e) {
      console.warn("API unavailable, falling back to local data");
      const saved = localStorage.getItem("admin_services");
      setRecords(saved ? JSON.parse(saved) : servicesSeed);
      setUsingLocal(true);
    } finally {
      setLoading(false);
    }
  };

  const saveLocal = (newRecords) => {
    setRecords(newRecords);
    localStorage.setItem("admin_services", JSON.stringify(newRecords));
  };

  const list = useMemo(() =>
    records.filter(s => JSON.stringify(s).toLowerCase().includes(query.toLowerCase())),
    [records, query]
  );

  const nextId = () => records.length ? Math.max(...records.map(r => Number(r.Service_ID) || 0)) + 1 : 1;

  const save = async () => {
    if (modal.mode === "add") {
      const newRecord = { ...modal.data, Service_ID: nextId() };
      if (!usingLocal) {
        try { await adminApi.createService(newRecord); loadServices(); setModal(null); setNotice("Service added successfully."); return; } catch (e) { /* fall through */ }
      }
      saveLocal([...records, newRecord]);
    } else {
      if (!usingLocal) {
        try { await adminApi.updateService(modal.data.Service_ID, modal.data); loadServices(); setModal(null); setNotice("Service updated."); return; } catch (e) { /* fall through */ }
      }
      saveLocal(records.map(r => r.Service_ID === modal.data.Service_ID ? { ...r, ...modal.data } : r));
    }
    setNotice(modal.mode === "add" ? "Service added successfully." : "Service updated.");
    setModal(null);
  };

  const toggleStatus = async (s) => {
    const newStatus = s.Service_Status === "Active" ? "Inactive" : "Active";
    if (!usingLocal) {
      try { await adminApi.updateService(s.Service_ID, { Service_Status: newStatus }); loadServices(); return; } catch (e) { /* fall through */ }
    }
    saveLocal(records.map(r => r.Service_ID === s.Service_ID ? { ...r, Service_Status: newStatus } : r));
  };

  const deleteRecord = async (s) => {
    if (!confirm(`Delete service "${s.Service_Name}"?`)) return;
    if (!usingLocal) {
      try { await adminApi.deleteService(s.Service_ID); loadServices(); setNotice("Service deleted."); return; } catch (e) { /* fall through */ }
    }
    saveLocal(records.filter(r => r.Service_ID !== s.Service_ID));
    setNotice(`"${s.Service_Name}" has been removed.`);
  };

  if (loading) return <div className="p-10 text-center">Loading services...</div>;

  return (
    <div>
      <PageHeader title="Services" subtitle="Manage clinic services, base fee, estimated duration, and availability." actionLabel="Add Service" onAction={() => setModal({ mode: "add", data: blank })} />

      {notice && (
        <div className="mb-4 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 p-4 flex justify-between items-center">
          <span>{notice}</span>
          <button onClick={() => setNotice("")} className="text-lg leading-none hover:opacity-70">×</button>
        </div>
      )}

      {usingLocal && (
        <div className="mb-4 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 p-3 text-sm">
          ⚠ Backend not connected. Changes are saved to local storage.
        </div>
      )}

      <Toolbar query={query} setQuery={setQuery} label="Search service name, fee, duration..." />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {list.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-10 text-center text-slate-500">No services found.</div>
        ) : (
          list.map(s => (
            <div key={s.Service_ID} className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between">
                <h2 className="font-bold text-lg">{s.Service_Name}</h2>
                <Badge>{s.Service_Status}</Badge>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 min-h-10">{s.Description}</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3">
                  <p className="text-xs text-slate-500">Base Fee</p>
                  <b>₱{s.Base_Fee}</b>
                </div>
                <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3">
                  <p className="text-xs text-slate-500">Duration</p>
                  <b>{s.Estimated_Duration}</b>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={() => setModal({ mode: "edit", data: s })} className="px-3 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors text-xs">Edit</button>
                <button onClick={() => toggleStatus(s)} className="px-3 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors text-xs">Toggle</button>
                <button onClick={() => deleteRecord(s)} className="px-3 py-2 rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition-colors text-xs">Delete</button>
              </div>
            </div>
          ))
        )}
      </div>

      {modal && (
        <Modal title={modal.mode === "add" ? "Add Service" : "Edit Service"} onClose={() => setModal(null)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput label="Service Name" value={modal.data.Service_Name} onChange={v => setModal({ ...modal, data: { ...modal.data, Service_Name: v } })} />
            <TextInput label="Base Fee" type="number" value={modal.data.Base_Fee} onChange={v => setModal({ ...modal, data: { ...modal.data, Base_Fee: Number(v) } })} />
            <TextInput label="Estimated Duration" value={modal.data.Estimated_Duration} onChange={v => setModal({ ...modal, data: { ...modal.data, Estimated_Duration: v } })} />
            <SelectInput label="Status" value={modal.data.Service_Status} onChange={v => setModal({ ...modal, data: { ...modal.data, Service_Status: v } })} options={["Active", "Inactive"]} />
            <div className="md:col-span-2">
              <TextInput label="Description" value={modal.data.Description} onChange={v => setModal({ ...modal, data: { ...modal.data, Description: v } })} />
            </div>
            <button onClick={save} className="md:col-span-2 rounded-xl bg-teal-500 hover:bg-teal-600 transition-colors text-white py-3 font-medium">Save Service</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
