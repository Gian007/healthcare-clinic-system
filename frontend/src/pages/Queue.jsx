import { useEffect, useState, useMemo } from "react";
import { FaClock, FaPlusSquare } from "react-icons/fa";
import * as publicApi from "../api/publicApi";
import { useAuth } from "../state/auth";

export default function Queue() {
  const { user } = useAuth();
  const [queue, setQueue] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [q, d] = await Promise.all([publicApi.getQueue(), publicApi.getDoctors()]);
      setQueue(q || []);
      setDoctors(d || []);
    } catch (error) {
      console.error("Failed to fetch queue data:", error);
    }
  };

  useEffect(() => {
    fetchData().finally(() => setLoading(false));

    const interval = setInterval(() => {
      fetchData();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const todayWeekday = useMemo(() => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[new Date().getDay()];
  }, []);

  // Determine active schedules and queues grouped by today's doctor schedules
  const activeQueues = useMemo(() => {
    const todaySchedules = [];
    doctors.forEach(doc => {
      doc.schedules?.forEach(sch => {
        if (sch.day_of_week === todayWeekday && sch.schedule_status === "Active") {
          todaySchedules.push({
            ...sch,
            doctor: doc,
            doctor_id: doc.doctor_id,
            doctorName: `Dr. ${doc.first_name} ${doc.last_name}`,
            specialization: doc.specialization?.specialization_name || "General Practitioner"
          });
        }
      });
    });

    return todaySchedules.map(sch => {
      const activeList = queue.filter(q => q.doctor_id === sch.doctor_id && q.queue_status !== "Cancelled" && q.queue_status !== "Done")
        .sort((a, b) => (a.priority_number ?? a.queue_number) - (b.priority_number ?? b.queue_number));
      const nowServing = activeList.find(q => q.queue_status === "Serving" || q.queue_status === "Active");
      const nextInQueue = activeList.filter(q => q.queue_status === "Waiting");
      const scheduledInQueue = activeList.filter(q => q.queue_status === "Scheduled");

      return {
        scheduleId: sch.schedule_id,
        room: sch.room || "General Room",
        doctorName: sch.doctorName,
        doctorSpecialization: sch.specialization,
        shiftText: `${sch.start_time.slice(0,5)} - ${sch.end_time.slice(0,5)}`,
        now: nowServing,
        next: nextInQueue,
        scheduled: scheduledInQueue
      };
    });
  }, [doctors, queue, todayWeekday]);

  const displayedQueues = useMemo(() => {
    if (user?.role === 'patient') {
      return activeQueues.filter(group => {
        const inNow = group.now?.patient_id === user.patient_id;
        const inNext = group.next.some(q => q.patient_id === user.patient_id);
        const inSched = group.scheduled.some(q => q.patient_id === user.patient_id);
        return inNow || inNext || inSched;
      });
    }
    return activeQueues;
  }, [activeQueues, user]);

  return (
    <div className="bg-neutralbg dark:bg-slate-950 min-h-[calc(100vh-72px)] transition-colors">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="text-center">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Live Queue Status</h1>
          <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">Real-time clinic queue updates</p>
        </div>

        {loading ? (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-white dark:bg-slate-900 rounded-2xl animate-pulse border border-slate-100 dark:border-slate-800/80" />
            ))}
          </div>
        ) : displayedQueues.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-slate-400 py-16 max-w-md mx-auto">
            {user?.role === 'patient' ? (
              <>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Active Queues</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">You do not have any scheduled appointments or active queues for today.</p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Doctor Schedules Today</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">There are no active doctor schedules set up for today.</p>
              </>
            )}
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedQueues.map((group) => (
              <div 
                key={group.scheduleId} 
                className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/60 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between"
              >
                {/* Header */}
                <div className="bg-gradient-to-br from-teal-600 to-teal-500 p-5 text-white flex flex-col justify-between min-h-[110px]">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] bg-white/20 uppercase tracking-widest font-black px-2.5 py-1 rounded-lg">
                      Que Doctor {group.doctorName.replace("Dr. ", "")} Room {group.room}
                    </span>
                    <span className="text-[9px] bg-teal-700/50 uppercase tracking-wider font-extrabold px-2 py-0.5 rounded text-teal-100">
                      {group.shiftText}
                    </span>
                  </div>
                  <div className="mt-3">
                    <h2 className="font-bold text-lg leading-tight">{group.doctorName}</h2>
                    <p className="text-xs opacity-90 truncate mt-0.5">{group.doctorSpecialization}</p>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  {/* Now Serving */}
                  <div>
                    <p className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-widest">Now Serving</p>
                    {group.now ? (
                      <div className={`mt-2 border rounded-xl p-4 text-center shadow-sm ${
                        user?.role === 'patient' && group.now.patient_id && user.patient_id === group.now.patient_id
                          ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400'
                          : 'bg-teal-50 dark:bg-teal-950/20 border-teal-100 dark:border-teal-900/30 text-teal-700 dark:text-teal-300'
                      }`}>
                        <div className="text-3xl font-black tracking-tight">Q-{group.now.queue_number}</div>
                        <div className="text-xs font-semibold mt-1 truncate">
                          {group.now.patient ? `${group.now.patient.first_name} ${group.now.patient.last_name}` : "Walk-in Patient"}
                          {user?.role === 'patient' && group.now.patient_id && user.patient_id === group.now.patient_id && " (You)"}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 bg-gray-50/50 dark:bg-slate-800/30 border border-gray-100 dark:border-slate-800/40 text-gray-400 dark:text-slate-500 rounded-xl p-4 text-center font-bold text-xs uppercase tracking-wider">
                        Waiting for Patient
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
                        group.next.slice(0, 3).map((p, idx) => {
                          const isMe = user?.role === 'patient' && p.patient_id && user.patient_id === p.patient_id;
                          return (
                            <div 
                              key={p.queue_id} 
                              className="flex justify-between items-center bg-gray-50 dark:bg-slate-800/10 border border-gray-100/50 dark:border-slate-800/10 rounded-xl px-3.5 py-2.5 text-xs"
                            >
                              <span className={`font-semibold truncate ${isMe ? 'text-red-600 dark:text-red-500' : 'text-gray-700 dark:text-slate-300'}`}>
                                {idx + 1}. {p.patient ? `${p.patient.first_name} ${p.patient.last_name}` : "Walk-in Patient"}
                                {isMe && " (You)"}
                              </span>
                              <span className={`font-bold shrink-0 ${isMe ? 'text-red-600 dark:text-red-500' : 'text-teal-600 dark:text-teal-400'}`}>
                                Q-{p.queue_number}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-xs text-gray-400 dark:text-slate-500 italic text-center py-2">
                          No patients waiting
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Scheduled / In Queue */}
                  <div className="mt-4 border-t border-gray-50 dark:border-slate-800/50 pt-4">
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-widest mb-2">
                      <FaClock className="text-blue-500/80" /> Scheduled (Not yet tapped in)
                    </div>
                    <div className="space-y-2">
                      {group.scheduled && group.scheduled.length > 0 ? (
                        group.scheduled.slice(0, 3).map((p, idx) => {
                          const isMe = user?.role === 'patient' && p.patient_id && user.patient_id === p.patient_id;
                          return (
                            <div 
                              key={p.queue_id} 
                              className="flex justify-between items-center bg-white dark:bg-slate-900 border border-gray-100/50 dark:border-slate-800/10 rounded-xl px-3.5 py-2.5 text-xs opacity-70"
                            >
                              <span className={`font-semibold truncate ${isMe ? 'text-red-600 dark:text-red-500' : 'text-gray-600 dark:text-slate-400'}`}>
                                {p.patient ? `${p.patient.first_name} ${p.patient.last_name}` : "Walk-in Patient"}
                                {isMe && " (You)"}
                              </span>
                              <span className={`font-bold shrink-0 ${isMe ? 'text-red-600 dark:text-red-500' : 'text-gray-500 dark:text-slate-500'}`}>
                                {p.start_time ? p.start_time.substring(0,5) : '--:--'}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-xs text-gray-400 dark:text-slate-500 italic text-center py-1">
                          No upcoming scheduled patients
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
