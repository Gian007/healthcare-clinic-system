import { useEffect, useMemo, useState } from "react";
import { schedulesSeed } from "../../data/adminMockData";
import { Badge, Modal, PageHeader, SelectInput, TextInput, Toolbar } from "../../components/admin/AdminUI";
import * as adminApi from "../../api/adminApi";

const blank = { Doctor_Name: "Dr. Alyssa Santos", Day_Of_Week: "Monday", Start_Time: "08:00", End_Time: "16:00", Slot_Limit: 20, Schedule_Status: "Active" };

export default function AdminSchedules() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(null);
  const [notice, setNotice] = useState("");
  const [usingLocal, setUsingLocal] = useState(false);

  useEffect(() => { loadSchedules(); }, []);

  const loadSchedules = async () => {
    try {
      const data = await adminApi.getSchedules();
      setRecords(data);
    } catch (e) {
      console.warn("API unavailable, falling back to local data");
      const saved = localStorage.getItem("admin_schedules");
      setRecords(saved ? JSON.parse(saved) : schedulesSeed);
      setUsingLocal(true);
    } finally {
      setLoading(false);
    }
  };

  const saveLocal = (newRecords) => {
    setRecords(newRecords);
    localStorage.setItem("admin_schedules", JSON.stringify(newRecords));
  };

  const list = useMemo(() =>
    records.filter(s => JSON.stringify(s).toLowerCase().includes(query.toLowerCase())),
    [records, query]
  );

  const nextId = () => records.length ? Math.max(...records.map(r => Number(r.Schedule_ID) || 0)) + 1 : 1;

  const save = async () => {
    if (modal.mode === "add") {
      const newRecord = { ...modal.data, Schedule_ID: nextId() };
      if (!usingLocal) {
        try { await adminApi.createSchedule(newRecord); loadSchedules(); setModal(null); setNotice("Schedule added."); return; } catch (e) { /* fall through */ }
      }
      saveLocal([...records, newRecord]);
    } else {
      if (!usingLocal) {
        try { await adminApi.updateSchedule(modal.data.Schedule_ID, modal.data); loadSchedules(); setModal(null); setNotice("Schedule updated."); return; } catch (e) { /* fall through */ }
      }
      saveLocal(records.map(r => r.Schedule_ID === modal.data.Schedule_ID ? { ...r, ...modal.data } : r));
    }
    setNotice(modal.mode === "add" ? "Schedule added." : "Schedule updated.");
    setModal(null);
  };

  const deleteRecord = async (s) => {
    if (!confirm(`Delete schedule for ${s.Doctor_Name} on ${s.Day_Of_Week}?`)) return;
    if (!usingLocal) {
      try { await adminApi.deleteSchedule(s.Schedule_ID); loadSchedules(); setNotice("Schedule deleted."); return; } catch (e) { /* fall through */ }
    }
    saveLocal(records.filter(r => r.Schedule_ID !== s.Schedule_ID));
    setNotice("Schedule removed.");
  };

  if (loading) return <div className="p-10 text-center">Loading schedules...</div>;

  return (
    <div>
      <PageHeader title="Schedules" subtitle="Doctor schedule records mapped to Doctor_Schedule table." actionLabel="Add Schedule" onAction={() => setModal({ mode: "add", data: blank })} />

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

      <Toolbar query={query} setQuery={setQuery} label="Search doctor, day, time, status..." />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {list.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-10 text-center text-slate-500">No schedules found.</div>
        ) : (
          list.map(s => (
            <div key={s.Schedule_ID} className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between gap-2">
                <h2 className="font-bold">{s.Day_Of_Week}</h2>
                <Badge>{s.Schedule_Status}</Badge>
              </div>
              <p className="mt-2 text-sm text-slate-500">{s.Doctor_Name}</p>
              <div className="mt-4 rounded-xl bg-slate-50 dark:bg-slate-800 p-4">
                <p className="text-xs text-slate-500">Time</p>
                <b>{s.Start_Time} - {s.End_Time}</b>
                <p className="text-xs text-slate-500 mt-2">Slot Limit: {s.Slot_Limit}</p>
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={() => setModal({ mode: "edit", data: s })} className="px-3 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors text-xs">Edit</button>
                <button onClick={() => deleteRecord(s)} className="px-3 py-2 rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition-colors text-xs">Delete</button>
              </div>
            </div>
          ))
        )}
      </div>

      {modal && (
        <Modal title={modal.mode === "add" ? "Add Schedule" : "Edit Schedule"} onClose={() => setModal(null)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput label="Doctor Name" value={modal.data.Doctor_Name} onChange={v => setModal({ ...modal, data: { ...modal.data, Doctor_Name: v } })} />
            <SelectInput label="Day" value={modal.data.Day_Of_Week} onChange={v => setModal({ ...modal, data: { ...modal.data, Day_Of_Week: v } })} options={["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]} />
            <TextInput label="Start Time" type="time" value={modal.data.Start_Time} onChange={v => setModal({ ...modal, data: { ...modal.data, Start_Time: v } })} />
            <TextInput label="End Time" type="time" value={modal.data.End_Time} onChange={v => setModal({ ...modal, data: { ...modal.data, End_Time: v } })} />
            <TextInput label="Slot Limit" type="number" value={modal.data.Slot_Limit} onChange={v => setModal({ ...modal, data: { ...modal.data, Slot_Limit: Number(v) } })} />
            <SelectInput label="Status" value={modal.data.Schedule_Status} onChange={v => setModal({ ...modal, data: { ...modal.data, Schedule_Status: v } })} options={["Active", "Day Off", "Inactive"]} />
            <button onClick={save} className="md:col-span-2 rounded-xl bg-teal-500 hover:bg-teal-600 transition-colors text-white py-3 font-medium">Save Schedule</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
