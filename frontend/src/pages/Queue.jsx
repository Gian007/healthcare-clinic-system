import { useEffect, useState, useMemo } from "react";
import { FaClock, FaHeartbeat, FaRegBuilding } from "react-icons/fa";
import * as publicApi from "../api/publicApi";

export default function Queue() {
  const [queue, setQueue] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("queues"); // "queues" or "directory"

  useEffect(() => {
    Promise.all([publicApi.getQueue(), publicApi.getDoctors()])
      .then(([q, d]) => {
        setQueue(q || []);
        setDoctors(d || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const todayWeekday = useMemo(() => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[new Date().getDay()];
  }, []);

  const activeQueues = useMemo(() => {
    const list = [];
    // 1. Group by active schedules for today
    doctors.forEach(doc => {
      doc.schedules?.forEach(sch => {
        if (sch.day_of_week === todayWeekday && sch.schedule_status === "Active") {
          list.push({
            doctor_id: doc.doctor_id,
            name: `Dr. ${doc.first_name} ${doc.last_name}`,
            room: sch.room || "General Room",
            specialization: doc.specialization?.specialization_name || "General Practitioner"
          });
        }
      });
    });

    // 2. Fallback to active queue items in case some doctor schedule isn't loaded but they have patients
    queue.forEach(q => {
      if (q.doctor && !list.some(d => d.doctor_id === q.doctor_id)) {
        list.push({
          doctor_id: q.doctor_id,
          name: `Dr. ${q.doctor.first_name} ${q.doctor.last_name}`,
          room: q.doctor.schedules?.find(s => s.day_of_week === todayWeekday)?.room || "Consultation Room",
          specialization: q.doctor.specialization?.specialization_name || "Specialist"
        });
      }
    });

    // 3. Map now serving and waiting list for each queue
    return list.map(qGroup => {
      const activeList = queue.filter(q => q.doctor_id === qGroup.doctor_id && q.queue_status !== "Cancelled" && q.queue_status !== "Done");
      const now = activeList.find(q => q.queue_status === "Serving" || q.queue_status === "Active");
      const next = activeList.filter(q => q.queue_status === "Waiting");
      return {
        ...qGroup,
        now,
        next
      };
    });
  }, [doctors, queue, todayWeekday]);

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

  return (
    <div className="bg-neutralbg dark:bg-slate-950 min-h-[calc(100vh-72px)] transition-colors">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-3 bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 rounded-2xl mb-3 border border-teal-100 dark:border-teal-900/30">
            <FaHeartbeat className="text-2xl animate-pulse" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Live Queue Status</h1>
          <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">Real-time clinic queue updates and room schedules</p>
        </div>

        {/* Tab Toggle Navigation */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex rounded-xl bg-gray-200/50 dark:bg-slate-900 p-1 border border-gray-300/30 dark:border-slate-800/80 shadow-inner">
            <button
              onClick={() => setActiveTab("queues")}
              className={`rounded-lg px-6 py-2 text-xs font-bold transition-all duration-200 flex items-center gap-2 ${
                activeTab === "queues"
                  ? "bg-teal-600 text-white shadow-md scale-100"
                  : "text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400"
              }`}
            >
              🔄 Live Queues
            </button>
            <button
              onClick={() => setActiveTab("directory")}
              className={`rounded-lg px-6 py-2 text-xs font-bold transition-all duration-200 flex items-center gap-2 ${
                activeTab === "directory"
                  ? "bg-teal-600 text-white shadow-md scale-100"
                  : "text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400"
              }`}
            >
              <FaRegBuilding /> Room Directory & Schedules
            </button>
          </div>
        </div>

        {loading ? (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-white dark:bg-slate-900 rounded-2xl animate-pulse border border-slate-100 dark:border-slate-800/80" />
            ))}
          </div>
        ) : activeTab === "queues" ? (
          /* ================= TAB 1: LIVE QUEUES ================= */
          activeQueues.length === 0 ? (
            <div className="text-center text-gray-500 py-16 max-w-md mx-auto">
              <p className="text-5xl mb-4">🪑</p>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Active Consultations</h3>
              <p className="text-sm text-gray-500 mt-1">There are no scheduled clinical consultation rooms active at the moment.</p>
            </div>
          ) : (
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {activeQueues.map((group) => (
                <div 
                  key={group.doctor_id} 
                  className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/60 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between"
                >
                  {/* Header */}
                  <div className="bg-gradient-to-br from-teal-600 to-teal-500 p-5 text-white flex flex-col justify-between min-h-[110px]">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] bg-white/20 uppercase tracking-widest font-black px-2.5 py-1 rounded-lg">
                        {group.room}
                      </span>
                    </div>
                    <div className="mt-3">
                      <h2 className="font-bold text-lg leading-tight">{group.name}</h2>
                      <p className="text-xs opacity-90 truncate mt-0.5">{group.specialization}</p>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    {/* Now Serving */}
                    <div>
                      <p className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-widest">Now Serving</p>
                      {group.now ? (
                        <div className="mt-2 bg-teal-50 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/30 text-teal-700 dark:text-teal-300 rounded-xl p-4 text-center shadow-sm">
                          <div className="text-3xl font-black tracking-tight">Q-{group.now.queue_number}</div>
                          <div className="text-xs font-semibold mt-1 truncate">
                            {group.now.patient ? `${group.now.patient.first_name} ${group.now.patient.last_name}` : "Walk-in Patient"}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-2 bg-gray-50/50 dark:bg-slate-800/30 border border-gray-100 dark:border-slate-800/40 text-gray-400 dark:text-slate-500 rounded-xl p-4 text-center font-bold text-xs uppercase tracking-wider">
                          Room Idle
                        </div>
                      )}
                    </div>

                    {/* Up Next */}
                    <div className="mt-6 border-t border-gray-50 dark:border-slate-800/50 pt-4">
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-widest mb-2">
                        <FaClock className="text-teal-500/80" /> Up Next
                      </div>
                      <div className="space-y-2">
                        {group.next.length > 0 ? (
                          group.next.slice(0, 3).map((p, idx) => (
                            <div 
                              key={p.queue_id} 
                              className="flex justify-between items-center bg-gray-50 dark:bg-slate-800/10 border border-gray-100/50 dark:border-slate-800/10 rounded-xl px-3.5 py-2.5 text-xs"
                            >
                              <span className="font-semibold text-gray-700 dark:text-slate-300 truncate">
                                {idx + 1}. {p.patient ? `${p.patient.first_name} ${p.patient.last_name}` : "Walk-in Patient"}
                              </span>
                              <span className="font-bold text-teal-600 dark:text-teal-400 shrink-0">
                                Q-{p.queue_number}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-gray-400 dark:text-slate-500 italic text-center py-2">
                            Queue is empty
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* ================= TAB 2: ROOM DIRECTORY ================= */
          roomGroups.length === 0 ? (
            <div className="text-center text-gray-500 py-16 max-w-md mx-auto">
              <p className="text-5xl mb-4">🏢</p>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Schedules Today</h3>
              <p className="text-sm text-gray-500 mt-1">There are no consulting rooms scheduled for today.</p>
            </div>
          ) : (
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {roomGroups.map((group) => (
                <div 
                  key={group.room} 
                  className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/60 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between transition-all hover:shadow-md"
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
    </div>
  );
}
