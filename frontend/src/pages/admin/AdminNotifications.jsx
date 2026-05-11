import { useEffect, useMemo, useState } from "react";
import { notificationsSeed } from "../../data/adminMockData";
import { Badge, Modal, PageHeader, SelectInput, TextInput, Toolbar } from "../../components/admin/AdminUI";
import * as adminApi from "../../api/adminApi";

const blank = { Template_Name: "", Event_Trigger: "", Message_Subject: "", Message_Body: "", Channel: "Email", Status: "Active" };

export default function AdminNotifications() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(null);
  const [notice, setNotice] = useState("");
  const [usingLocal, setUsingLocal] = useState(false);

  useEffect(() => { loadTemplates(); }, []);

  const loadTemplates = async () => {
    try {
      const data = await adminApi.getNotificationTemplates();
      setRecords(data);
    } catch (e) {
      console.warn("API unavailable, falling back to local data");
      const saved = localStorage.getItem("admin_notifications");
      setRecords(saved ? JSON.parse(saved) : notificationsSeed);
      setUsingLocal(true);
    } finally {
      setLoading(false);
    }
  };

  const saveLocal = (newRecords) => {
    setRecords(newRecords);
    localStorage.setItem("admin_notifications", JSON.stringify(newRecords));
  };

  const list = useMemo(() =>
    records.filter(n => JSON.stringify(n).toLowerCase().includes(query.toLowerCase())),
    [records, query]
  );

  const nextId = () => records.length ? Math.max(...records.map(r => Number(r.Template_ID) || 0)) + 1 : 1;

  const save = async () => {
    if (modal.mode === "add") {
      const newRecord = { ...modal.data, Template_ID: nextId() };
      if (!usingLocal) {
        try { await adminApi.createNotificationTemplate(newRecord); loadTemplates(); setModal(null); setNotice("Template added."); return; } catch (e) { /* fall through */ }
      }
      saveLocal([...records, newRecord]);
    } else {
      if (!usingLocal) {
        try { await adminApi.updateNotificationTemplate(modal.data.Template_ID, modal.data); loadTemplates(); setModal(null); setNotice("Template updated."); return; } catch (e) { /* fall through */ }
      }
      saveLocal(records.map(r => r.Template_ID === modal.data.Template_ID ? { ...r, ...modal.data } : r));
    }
    setNotice(modal.mode === "add" ? "Template added." : "Template updated.");
    setModal(null);
  };

  const toggleStatus = async (n) => {
    const newStatus = n.Status === "Active" ? "Inactive" : "Active";
    if (!usingLocal) {
      try { await adminApi.updateNotificationTemplate(n.Template_ID, { Status: newStatus }); loadTemplates(); return; } catch (e) { /* fall through */ }
    }
    saveLocal(records.map(r => r.Template_ID === n.Template_ID ? { ...r, Status: newStatus } : r));
  };

  const deleteRecord = async (n) => {
    if (!confirm(`Delete template "${n.Template_Name}"?`)) return;
    if (!usingLocal) {
      try { await adminApi.deleteNotificationTemplate(n.Template_ID); loadTemplates(); setNotice("Template deleted."); return; } catch (e) { /* fall through */ }
    }
    saveLocal(records.filter(r => r.Template_ID !== n.Template_ID));
    setNotice(`"${n.Template_Name}" has been removed.`);
  };

  if (loading) return <div className="p-10 text-center">Loading notification templates...</div>;

  return (
    <div>
      <PageHeader title="Notification Templates" subtitle="Automated message templates for appointment, queue, and warning alerts." actionLabel="Add Template" onAction={() => setModal({ mode: "add", data: blank })} />

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

      <Toolbar query={query} setQuery={setQuery} label="Search template, trigger, channel..." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {list.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-10 text-center text-slate-500">No templates found.</div>
        ) : (
          list.map(n => (
            <div key={n.Template_ID} className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow">
              <div className="flex justify-between">
                <h2 className="font-bold text-lg">{n.Template_Name}</h2>
                <Badge>{n.Status}</Badge>
              </div>
              <p className="text-sm text-slate-500 mt-1">Trigger: {n.Event_Trigger}</p>
              <div className="mt-4 rounded-xl bg-slate-50 dark:bg-slate-800 p-4">
                <b>{n.Message_Subject}</b>
                <p className="text-sm mt-1 text-slate-600 dark:text-slate-300">{n.Message_Body}</p>
                <p className="text-xs text-slate-500 mt-2">Channel: {n.Channel}</p>
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={() => setModal({ mode: "edit", data: n })} className="px-3 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors text-xs">Edit</button>
                <button onClick={() => toggleStatus(n)} className="px-3 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors text-xs">Toggle</button>
                <button onClick={() => deleteRecord(n)} className="px-3 py-2 rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition-colors text-xs">Delete</button>
              </div>
            </div>
          ))
        )}
      </div>

      {modal && (
        <Modal title={modal.mode === "add" ? "Add Template" : "Edit Template"} onClose={() => setModal(null)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput label="Template Name" value={modal.data.Template_Name} onChange={v => setModal({ ...modal, data: { ...modal.data, Template_Name: v } })} />
            <TextInput label="Event Trigger" value={modal.data.Event_Trigger} onChange={v => setModal({ ...modal, data: { ...modal.data, Event_Trigger: v } })} />
            <TextInput label="Subject" value={modal.data.Message_Subject} onChange={v => setModal({ ...modal, data: { ...modal.data, Message_Subject: v } })} />
            <SelectInput label="Channel" value={modal.data.Channel} onChange={v => setModal({ ...modal, data: { ...modal.data, Channel: v } })} options={["Email", "SMS", "Email/SMS"]} />
            <div className="md:col-span-2">
              <TextInput label="Message Body" value={modal.data.Message_Body} onChange={v => setModal({ ...modal, data: { ...modal.data, Message_Body: v } })} />
            </div>
            <SelectInput label="Status" value={modal.data.Status} onChange={v => setModal({ ...modal, data: { ...modal.data, Status: v } })} options={["Active", "Inactive"]} />
            <button onClick={save} className="md:col-span-2 rounded-xl bg-teal-500 hover:bg-teal-600 transition-colors text-white py-3 font-medium">Save Template</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
