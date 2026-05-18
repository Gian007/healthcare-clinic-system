import { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import StaffTableBadge from "../../components/staff/StaffTableBadge";
import * as staffApi from "../../api/staffApi";
import * as publicApi from "../../api/publicApi";
import { useAuth } from "../../state/auth";
import { FaClock, FaRegBuilding } from "react-icons/fa";

export default function StaffQueue() {
  const { dark } = useOutletContext() || {};
  const { user } = useAuth();

  const isStaff = user?.role === "staff";
  const isAdmin = user?.role === "admin";

  const [queue, setQueue] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctorFilter, setDoctorFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("queues"); // "queues" or "directory"

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      const [qData, dData] = await Promise.all([
        staffApi.getQueue(),
        publicApi.getDoctors()
      ]);
      setQueue(qData || []);
      setDoctors(dData || []);
    } catch (error) {
      console.error("Failed to fetch queue and doctors:", error);
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
    if (!isStaff) return; // Strict front-end guard
    try {
      await staffApi.updateQueueStatus(queueId, { queue_status: nextStatus });
      fetchQueue();
    } catch (error) {
      alert("Failed to update status");
    }
  }

  const todayWeekday = useMemo(() => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[new Date().getDay()];
  }, []);

  const activeSchedules = useMemo(() => {
    const list = [];
    // 1. Add doctors with active schedules today
    doctors.forEach(doc => {
      doc.schedules?.forEach(sch => {
        if (sch.day_of_week === todayWeekday && sch.schedule_status === "Active") {
          list.push({
            id: doc.doctor_id,
            name: `Dr. ${doc.last_name}`,
            room: sch.room || "General Room",
            specialization: doc.specialization?.specialization_name || "General Practice"
          });
        }
      });
    });

    // 2. Add doctors from the queue who have active items but might not have standard schedules
    queue.forEach(q => {
      if (q.doctor && !list.some(d => d.id === q.doctor_id)) {
        list.push({
          id: q.doctor_id,
          name: `Dr. ${q.doctor.last_name}`,
          room: q.doctor.schedules?.find(s => s.day_of_week === todayWeekday)?.room || "Consultation Room",
          specialization: q.doctor.specialization?.specialization_name || "Specialist"
        });
      }
    });
    return list;
  }, [doctors, queue, todayWeekday]);

  // List of doctors for the filter dropdown
  const doctorsList = activeSchedules;

  const queueGroups = useMemo(() => {
    return activeSchedules.map((d) => {
      const list = queue.filter((q) => q.doctor_id === d.id && q.queue_status !== "Cancelled" && q.queue_status !== "Done")
        .sort((a, b) => (a.priority_number ?? a.queue_number) - (b.priority_number ?? b.queue_number));
      const now = list.find((q) => q.queue_status === "Serving" || q.queue_status === "Active");
      const next = list.filter((q) => q.queue_status === "Waiting");
      return { ...d, list, now, next };
    });
  }, [queue, activeSchedules]);

  // Group today's doctor schedules by Room
  const roomGroups = useMemo(() => {
    const groups = {};
    doctors.forEach(doc => {
      doc.schedules?.forEach(sch => {
        if (sch.day_of_week === todayWeekday && sch.schedule_status === "Active") {
          const rName = sch.room || "General Consultation Room";
          if (!groups[rName]) {
            groups[rName] = [];
          }
          groups[rName].push({
            doctor_id: doc.doctor_id,
            name: `Dr. ${doc.first_name} ${doc.last_name}`,
            specialization: doc.specialization?.specialization_name || "General Practice",
            start_time: sch.start_time,
            end_time: sch.end_time,
            lunch_start: sch.lunch_start,
            lunch_end: sch.lunch_end,
            break1_start: sch.break1_start,
            break1_end: sch.break1_end,
            break2_start: sch.break2_start,
            break2_end: sch.break2_end,
            slot_limit: sch.slot_limit
          });
        }
      });
    });

    // Merge in any doctor from today's queue not covered in the active schedules fetch
    queue.forEach(q => {
      if (q.doctor) {
        const todaySched = q.doctor.schedules?.find(s => s.day_of_week === todayWeekday);
        const rName = todaySched?.room || "Consultation Room";
        if (!groups[rName]) {
          groups[rName] = [];
        }
        if (!groups[rName].some(d => d.doctor_id === q.doctor_id)) {
          groups[rName].push({
            doctor_id: q.doctor_id,
            name: `Dr. ${q.doctor.first_name} ${q.doctor.last_name}`,
            specialization: q.doctor.specialization?.specialization_name || "Specialist",
            start_time: todaySched?.start_time || "09:00",
            end_time: todaySched?.end_time || "17:00",
            slot_limit: todaySched?.slot_limit || 8
          });
        }
      }
    });

    return Object.entries(groups).map(([room, list]) => ({
      room,
      doctorsList: list.sort((a, b) => a.start_time.localeCompare(b.start_time))
    }));
  }, [doctors, queue, todayWeekday]);

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

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className={`text-2xl font-semibold ${pageTitle}`}>
            Queue Management
          </h1>
          <p className={`text-sm ${muted}`}>Multiple active consulting room queues</p>
        </div>

        {isStaff && (
          <Link
            to="/staff/walk-in"
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 font-bold shadow-md shadow-teal-600/10"
          >
            Add Walk-in
          </Link>
        )}
      </div>

      {/* Tab Selector */}
      <div className="mt-6 flex justify-start">
        <div className="inline-flex rounded-xl bg-gray-100 dark:bg-slate-900 p-1 border border-gray-200/50 dark:border-slate-800">
          <button
            onClick={() => setActiveTab("queues")}
            className={`rounded-lg px-5 py-2 text-xs font-bold transition-all duration-200 flex items-center gap-2 ${
              activeTab === "queues"
                ? "bg-teal-600 text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400"
            }`}
          >
            🔄 Live Queues
          </button>
          <button
            onClick={() => setActiveTab("directory")}
            className={`rounded-lg px-5 py-2 text-xs font-bold transition-all duration-200 flex items-center gap-2 ${
              activeTab === "directory"
                ? "bg-teal-600 text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400"
            }`}
          >
            <FaRegBuilding /> Room Schedules Directory
          </button>
        </div>
      </div>

      {loading ? (
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-white dark:bg-slate-900 rounded-2xl animate-pulse border border-slate-100 dark:border-slate-800/80" />
          ))}
        </div>
      ) : activeTab === "queues" ? (
        /* ================= TAB 1: LIVE QUEUES & CONTROL ================= */
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {queueGroups.map((d) => (
              <div
                key={d.id}
                className={`overflow-hidden rounded-2xl border shadow-sm flex flex-col justify-between ${card}`}
              >
                <div className="bg-gradient-to-r from-teal-600 to-teal-500 p-5 text-white shrink-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="font-semibold text-lg">{d.name}</h2>
                      <p className="text-xs opacity-90 truncate mt-0.5">{d.specialization}</p>
                    </div>
                    <span className="text-[10px] bg-white/20 uppercase tracking-widest font-black px-2.5 py-1 rounded-md shrink-0">
                      {d.room}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <p className={`text-[10px] uppercase tracking-wider font-bold ${muted}`}>Now Serving</p>
                    <div
                      className={`mt-2 rounded-xl border p-4 text-2xl font-black text-center text-teal-700 dark:text-teal-400 ${subCard}`}
                    >
                      {d.now ? `Q-${d.now.queue_number}` : "Idle"}
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-gray-100 dark:border-slate-800/40">
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${muted} mb-2`}>Next Patients</p>
                    <div className="space-y-2">
                      {d.next.length ? (
                        d.next.slice(0, 3).map((p) => (
                          <div key={p.queue_id} className="flex justify-between items-center gap-3 text-xs">
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
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="font-bold text-teal-600 dark:text-teal-400">Q-{p.queue_number}</span>
                              {isStaff && (
                                <button
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to remove ${p.patient?.first_name} ${p.patient?.last_name} from the queue?`)) {
                                      updateStatus(p.queue_id, "Cancelled");
                                    }
                                  }}
                                  className="text-red-500 hover:text-red-700 font-bold p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/20 text-[10px] transition"
                                  title="Remove patient"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className={`text-xs italic ${muted} text-center py-2`}>No waiting patients</p>
                      )}
                    </div>
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
                <option value="All">All Doctors</option>
                {doctorsList.map((d) => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`rounded-lg border px-3 py-2 text-sm ${input}`}
              >
                <option value="All">All Status</option>
                <option value="Waiting">Waiting</option>
                <option value="Serving">Serving</option>
                <option value="Done">Done</option>
                <option value="Cancelled">Cancelled</option>
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
                  {filtered.length === 0 ? (
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
                          <div className="flex gap-2">
                            {isStaff && q.queue_status === "Waiting" && (
                              <button
                                onClick={() => updateStatus(q.queue_id, "Serving")}
                                className="rounded-md bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700 font-bold"
                              >
                                Start Serving
                              </button>
                            )}

                            {isStaff && q.queue_status === "Serving" && (
                              <button
                                onClick={() => updateStatus(q.queue_id, "Done")}
                                className="rounded-md bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700 font-bold"
                              >
                                Complete
                              </button>
                            )}

                            {isStaff && ["Waiting", "Serving"].includes(q.queue_status) && (
                              <button
                                onClick={() => {
                                  if (confirm(`Are you sure you want to remove this patient from the queue?`)) {
                                    updateStatus(q.queue_id, "Cancelled");
                                  }
                                }}
                                className="rounded-md bg-rose-600 px-3 py-1 text-xs text-white hover:bg-rose-700 font-bold"
                              >
                                Remove
                              </button>
                            )}

                            {isAdmin && ["Waiting", "Serving"].includes(q.queue_status) && (
                              <span className={`text-xs italic ${muted}`}>Monitoring Only</span>
                            )}

                            {q.queue_status === "Done" && (
                              <span className={`text-xs ${muted}`}>Finished</span>
                            )}

                            {q.queue_status === "Cancelled" && (
                              <span className="text-xs text-rose-500 font-semibold">Removed</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* ================= TAB 2: ROOM DIRECTORY ================= */
        roomGroups.length === 0 ? (
          <div className="text-center text-gray-500 py-16 max-w-md mx-auto">
            <p className="text-5xl mb-4">🏢</p>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Schedules Today</h3>
            <p className="text-sm text-gray-500 mt-1">There are no consulting rooms scheduled for today.</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {roomGroups.map((group) => (
              <div 
                key={group.room} 
                className={`border rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between transition-all ${card}`}
              >
                {/* Header */}
                <div className="bg-gradient-to-br from-slate-700 to-slate-600 p-5 text-white shrink-0">
                  <span className="text-[10px] bg-white/20 uppercase tracking-widest font-black px-2.5 py-1 rounded-lg">
                    Location Directory
                  </span>
                  <h2 className="font-black text-xl mt-2 tracking-tight">{group.room}</h2>
                  <p className="text-xs opacity-90 mt-0.5">{group.doctorsList.length} Scheduled Doctor(s) Today</p>
                </div>

                {/* Scheduled Doctors List */}
                <div className="p-5 flex-1 space-y-6">
                  {group.doctorsList.map((doc, index) => (
                    <div 
                      key={doc.doctor_id} 
                      className={`pb-5 ${index < group.doctorsList.length - 1 ? 'border-b border-gray-100 dark:border-slate-800/50' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-9 w-9 rounded-full bg-teal-100 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-sm shrink-0">
                          {doc.name.replace("Dr. ", "")[0]}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-gray-900 dark:text-white leading-tight truncate">{doc.name}</h3>
                          <p className="text-[11px] text-teal-600 dark:text-teal-400 font-medium truncate">{doc.specialization}</p>
                        </div>
                      </div>

                      <div className="mt-4 space-y-1.5 text-xs text-gray-600 dark:text-slate-400">
                        <div className="flex justify-between bg-gray-50 dark:bg-slate-800/30 px-3 py-2 rounded-xl border border-gray-100/30 dark:border-slate-800/10">
                          <span className="font-semibold">Shift Hours:</span>
                          <span className="text-gray-950 dark:text-white font-bold">{doc.start_time} - {doc.end_time}</span>
                        </div>
                        {doc.lunch_start && doc.lunch_end && (
                          <div className="flex justify-between px-3 text-[11px]">
                            <span>🥪 Lunch Break:</span>
                            <span className="font-semibold text-gray-800 dark:text-slate-300">{doc.lunch_start} - {doc.lunch_end}</span>
                          </div>
                        )}
                        {((doc.break1_start && doc.break1_end) || (doc.break2_start && doc.break2_end)) && (
                          <div className="flex justify-between px-3 text-[11px]">
                            <span>☕ Tea Breaks:</span>
                            <span className="font-semibold text-gray-800 dark:text-slate-300">
                              {doc.break1_start && `${doc.break1_start}-${doc.break1_end}`}
                              {doc.break1_start && doc.break2_start && " | "}
                              {doc.break2_start && `${doc.break2_start}-${doc.break2_end}`}
                            </span>
                          </div>
                        )}
                        {doc.slot_limit && (
                          <div className="flex justify-between px-3 text-[11px]">
                            <span>🎯 Patient Cap:</span>
                            <span className="font-semibold text-gray-800 dark:text-slate-300">{doc.slot_limit} Slots</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}