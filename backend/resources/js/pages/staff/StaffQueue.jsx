import { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import StaffTableBadge from "../../components/staff/StaffTableBadge";
import * as staffApi from "../../api/staffApi";

export default function StaffQueue() {
  const { dark } = useOutletContext();

  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctorFilter, setDoctorFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      const data = await staffApi.getQueue();
      setQueue(data || []);
    } catch (error) {
      console.error("Failed to fetch queue:", error);
    } finally {
      setLoading(false);
    }
  };

  const pageTitle = dark ? "text-white" : "text-gray-900";
  const muted = dark ? "text-gray-400" : "text-gray-500";
  const card = dark
    ? "bg-gray-900 border-gray-800 text-white"
    : "bg-white border-gray-200 text-gray-900";
  const subCard = dark
    ? "bg-gray-800 border-gray-700 text-white"
    : "bg-teal-50 border-teal-100 text-gray-900";
  const input = dark
    ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
    : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400";
  const tableHead = dark
    ? "bg-gray-800 text-gray-300"
    : "bg-gray-50 text-gray-500";
  const divide = dark ? "divide-gray-800" : "divide-gray-100";

  async function updateStatus(queueId, nextStatus) {
    try {
      await staffApi.updateQueueStatus(queueId, { queue_status: nextStatus });
      fetchQueue();
    } catch (error) {
      alert("Failed to update status");
    }
  }

  const filtered = queue.filter((q) => {
    const dName = q.doctor ? `Dr. ${q.doctor.last_name}` : 'No Doctor';
    const matchDoctor = doctorFilter === "All" || dName.includes(doctorFilter);
    const matchStatus = statusFilter === "All" || q.queue_status === statusFilter;
    const matchSearch =
      (q.patient?.first_name + " " + q.patient?.last_name).toLowerCase().includes(search.toLowerCase()) ||
      q.queue_number.toString().includes(search) ||
      (q.patient?.patient_number || "").toLowerCase().includes(search.toLowerCase());

    return matchDoctor && matchStatus && matchSearch;
  });

  const doctorsList = useMemo(() => {
    const list = [];
    queue.forEach(q => {
      if (q.doctor && !list.some(d => d.id === q.doctor.doctor_id)) {
        list.push({ id: q.doctor.doctor_id, name: `Dr. ${q.doctor.last_name}` });
      }
    });
    return list;
  }, [queue]);

  const queueGroups = useMemo(() => {
    return doctorsList.map((d) => {
      const list = queue.filter((q) => q.doctor_id === d.id);
      const now = list.find((q) => q.queue_status === "Serving");
      const next = list.filter((q) => q.queue_status === "Waiting").slice(0, 3);
      return { ...d, list, now, next };
    });
  }, [queue, doctorsList]);

  return (
    <div>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className={`text-2xl font-semibold ${pageTitle}`}>
            Queue Management
          </h1>
          <p className={`text-sm ${muted}`}>Multiple doctor queue monitoring</p>
        </div>

        <Link
          to="/staff/walk-in"
          className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
        >
          Add Walk-in
        </Link>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {queueGroups.map((d) => (
          <div
            key={d.id}
            className={`overflow-hidden rounded-2xl border shadow-sm ${card}`}
          >
            <div className="bg-gradient-to-r from-teal-600 to-teal-500 p-5 text-white">
              <div className="flex justify-between">
                <div>
                  <h2 className="font-semibold">{d.name}</h2>
                  <p className="text-xs opacity-90">Live Queue</p>
                </div>
              </div>
            </div>

            <div className="p-5">
              <p className={`text-xs ${muted}`}>Now Serving</p>

              <div
                className={`mt-2 rounded-xl border p-4 text-2xl font-bold text-teal-700 ${subCard}`}
              >
                {d.now ? `Q-${d.now.queue_number}` : "Idle"}
              </div>

              <p className={`mt-4 text-xs font-medium ${muted}`}>Next Patients</p>

              <div className="mt-2 space-y-2">
                {d.next.length ? (
                  d.next.map((p) => (
                    <div key={p.queue_id} className="flex justify-between items-center gap-3 text-sm">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className="h-6 w-6 rounded-full bg-teal-100 dark:bg-teal-900/40 border border-teal-200 dark:border-teal-800 flex items-center justify-center shrink-0 overflow-hidden text-[8px] font-bold shadow-sm">
                          {p.patient?.profile_picture ? (
                            <img 
                              src={`${import.meta.env.VITE_BACKEND_URL}/storage/${p.patient.profile_picture}`} 
                              className="w-full h-full object-cover" 
                              onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${p.patient.first_name}+${p.patient.last_name}&background=random`; }}
                            />
                          ) : (
                            <span className="text-teal-600 dark:text-teal-400">{(p.patient?.first_name?.[0] || "") + (p.patient?.last_name?.[0] || "")}</span>
                          )}
                        </div>
                        <span className={`truncate font-medium ${muted}`}>{p.patient?.first_name} {p.patient?.last_name}</span>
                      </div>
                      <span className="font-bold text-teal-600 dark:text-teal-400 shrink-0">Q-{p.queue_number}</span>
                    </div>
                  ))
                ) : (
                  <p className={`text-sm ${muted}`}>No waiting patients</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={`mt-6 rounded-2xl border p-4 shadow-sm ${card}`}>
        <div className="grid gap-3 md:grid-cols-[1fr_160px_160px]">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by patient, queue number..."
            className={`rounded-lg border px-4 py-2 text-sm ${input}`}
          />

          <select
            value={doctorFilter}
            onChange={(e) => setDoctorFilter(e.target.value)}
            className={`rounded-lg border px-3 py-2 text-sm ${input}`}
          >
            <option>All</option>
            {doctorsList.map((d) => (
              <option key={d.id} value={d.name}>{d.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`rounded-lg border px-3 py-2 text-sm ${input}`}
          >
            <option>All</option>
            <option>Waiting</option>
            <option>Serving</option>
            <option>Done</option>
            <option>Cancelled</option>
          </select>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className={tableHead}>
              <tr>
                <th className="px-4 py-3">Queue Number</th>
                <th className="px-4 py-3">Patient Name</th>
                <th className="px-4 py-3">Doctor</th>
                <th className="px-4 py-3">Check-in Time</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>

            <tbody className={`divide-y ${divide}`}>
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">Loading queue...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">No matching queues found.</td></tr>
              ) : (
                filtered.map((q) => (
                  <tr key={q.queue_id}>
                    <td className="px-4 py-3 font-semibold">Q-{q.queue_number}</td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="grid h-8 w-8 place-items-center rounded-full bg-teal-100 text-xs font-bold text-teal-700">
                          {q.patient?.first_name ? q.patient.first_name[0] : '?'}
                        </div>
                        <span>{q.patient?.first_name} {q.patient?.last_name}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3">{q.doctor ? `Dr. ${q.doctor.last_name}` : 'N/A'}</td>
                    <td className="px-4 py-3">{new Date(q.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</td>
                    <td className="px-4 py-3">
                      <StaffTableBadge status={q.queue_status} />
                    </td>

                    <td className="px-4 py-3">
                      {q.queue_status === "Waiting" && (
                        <button
                          onClick={() => updateStatus(q.queue_id, "Serving")}
                          className="rounded-md bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"
                        >
                          Start Serving
                        </button>
                      )}

                      {q.queue_status === "Serving" && (
                        <button
                          onClick={() => updateStatus(q.queue_id, "Done")}
                          className="rounded-md bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700"
                        >
                          Complete
                        </button>
                      )}

                      {q.queue_status === "Done" && (
                        <span className={`text-xs ${muted}`}>Finished</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}