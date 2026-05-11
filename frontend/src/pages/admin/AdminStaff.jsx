import { useEffect, useMemo, useState } from "react";
import { staffSeed } from "../../data/adminMockData";
import { Badge, Modal, PageHeader, SelectInput, TextInput, Toolbar } from "../../components/admin/AdminUI";
import * as adminApi from "../../api/adminApi";

const blank = { First_Name: "", Last_Name: "", Role: "Receptionist", Contact_Number: "", Email: "", Account_Status: "Active" };

export default function AdminStaff() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(null);
  const [notice, setNotice] = useState("");
  const [usingLocal, setUsingLocal] = useState(false);

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    try {
      const data = await adminApi.getStaff();
      setRecords(data);
    } catch (e) {
      console.warn("API unavailable, falling back to local data");
      const saved = localStorage.getItem("admin_staff");
      setRecords(saved ? JSON.parse(saved) : staffSeed);
      setUsingLocal(true);
    } finally {
      setLoading(false);
    }
  };

  const saveLocal = (newRecords) => {
    setRecords(newRecords);
    localStorage.setItem("admin_staff", JSON.stringify(newRecords));
  };

  const list = useMemo(() =>
    records.filter(s => JSON.stringify(s).toLowerCase().includes(query.toLowerCase())),
    [records, query]
  );

  const nextId = () => records.length ? Math.max(...records.map(r => Number(r.Staff_ID) || 0)) + 1 : 1;

  const save = async () => {
    if (modal.mode === "add") {
      const newRecord = { ...modal.data, Staff_ID: nextId(), Created_At: new Date().toISOString().slice(0, 10) };
      if (!usingLocal) {
        try {
          await adminApi.createStaff(newRecord);
          loadStaff();
        } catch (e) {
          saveLocal([...records, newRecord]);
        }
      } else {
        saveLocal([...records, newRecord]);
      }
    } else {
      if (!usingLocal) {
        try {
          await adminApi.updateStaff(modal.data.Staff_ID, modal.data);
          loadStaff();
        } catch (e) {
          saveLocal(records.map(r => r.Staff_ID === modal.data.Staff_ID ? { ...r, ...modal.data } : r));
        }
      } else {
        saveLocal(records.map(r => r.Staff_ID === modal.data.Staff_ID ? { ...r, ...modal.data } : r));
      }
    }
    setNotice(modal.mode === "add" ? "Staff member added successfully." : "Staff record updated.");
    setModal(null);
  };

  const toggleStatus = async (s) => {
    const newStatus = s.Account_Status === "Active" ? "Inactive" : "Active";
    if (!usingLocal) {
      try {
        await adminApi.updateStaff(s.Staff_ID, { Account_Status: newStatus });
        loadStaff();
        return;
      } catch (e) { /* fall through */ }
    }
    saveLocal(records.map(r => r.Staff_ID === s.Staff_ID ? { ...r, Account_Status: newStatus } : r));
  };

  const markResigned = async (s) => {
    if (!confirm(`Mark ${s.First_Name} ${s.Last_Name} as Resigned?`)) return;
    if (!usingLocal) {
      try {
        await adminApi.updateStaff(s.Staff_ID, { Account_Status: "Resigned" });
        loadStaff();
        return;
      } catch (e) { /* fall through */ }
    }
    saveLocal(records.map(r => r.Staff_ID === s.Staff_ID ? { ...r, Account_Status: "Resigned" } : r));
    setNotice(`${s.First_Name} ${s.Last_Name} has been marked as resigned.`);
  };

  if (loading) return <div className="p-10 text-center">Loading staff...</div>;

  return (
    <div>
      <PageHeader title="Staff Management" subtitle="Manage clinic admin, receptionist, cashier, and queue manager accounts." actionLabel="Add Staff" onAction={() => setModal({ mode: "add", data: blank })} />

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

      <Toolbar query={query} setQuery={setQuery} label="Search staff name, role, email..." />

      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 overflow-x-auto shadow-sm">
        <table className="w-full text-sm">
          <thead className="text-left bg-slate-50 dark:bg-slate-800 text-slate-500">
            <tr>
              <th className="p-4">Name</th><th>Role</th><th>Email</th><th>Contact</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr><td colSpan="6" className="p-8 text-center text-slate-500">No staff records found.</td></tr>
            ) : (
              list.map(s => (
                <tr key={s.Staff_ID} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-semibold">{s.First_Name} {s.Last_Name}</td>
                  <td>{s.Role}</td>
                  <td>{s.Email}</td>
                  <td>{s.Contact_Number}</td>
                  <td><Badge>{s.Account_Status}</Badge></td>
                  <td>
                    <div className="flex gap-2 p-3 flex-wrap">
                      <button onClick={() => setModal({ mode: "edit", data: s })} className="px-3 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors text-xs">Edit</button>
                      <button onClick={() => toggleStatus(s)} className="px-3 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors text-xs">Toggle</button>
                      <button onClick={() => markResigned(s)} className="px-3 py-2 rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition-colors text-xs">Resign</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title={modal.mode === "add" ? "Add Staff" : "Edit Staff"} onClose={() => setModal(null)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput label="First Name" value={modal.data.First_Name} onChange={v => setModal({ ...modal, data: { ...modal.data, First_Name: v } })} />
            <TextInput label="Last Name" value={modal.data.Last_Name} onChange={v => setModal({ ...modal, data: { ...modal.data, Last_Name: v } })} />
            <SelectInput label="Role" value={modal.data.Role} onChange={v => setModal({ ...modal, data: { ...modal.data, Role: v } })} options={["Admin", "Receptionist", "Queue Manager", "Cashier"]} />
            <SelectInput label="Status" value={modal.data.Account_Status} onChange={v => setModal({ ...modal, data: { ...modal.data, Account_Status: v } })} options={["Active", "Inactive", "Resigned"]} />
            <TextInput label="Contact" value={modal.data.Contact_Number} onChange={v => setModal({ ...modal, data: { ...modal.data, Contact_Number: v } })} />
            <TextInput label="Email" value={modal.data.Email} onChange={v => setModal({ ...modal, data: { ...modal.data, Email: v } })} />
            <button onClick={save} className="md:col-span-2 rounded-xl bg-teal-500 hover:bg-teal-600 transition-colors text-white py-3 font-medium">Save Staff</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
