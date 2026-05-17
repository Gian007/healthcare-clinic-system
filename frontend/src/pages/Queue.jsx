import { useEffect, useState, useMemo } from "react";
import { FaClock, FaHeartbeat } from "react-icons/fa";
import * as publicApi from "../api/publicApi";

export default function Queue() {
  const [queue, setQueue] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="bg-neutralbg dark:bg-slate-950 min-h-[calc(100vh-72px)] transition-colors">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-3 bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 rounded-2xl mb-3 border border-teal-100 dark:border-teal-900/30">
            <FaHeartbeat className="text-2xl animate-pulse" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Live Queue Status</h1>
          <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">Real-time clinic queue updates by consulting room</p>
        </div>

        {loading ? (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-white dark:bg-slate-900 rounded-2xl animate-pulse border border-slate-100 dark:border-slate-800/80" />
            ))}
          </div>
        ) : activeQueues.length === 0 ? (
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
        )}
      </div>
    </div>
  );
}
