import { useEffect, useState } from "react";
import { FaClock } from "react-icons/fa";
import QueueCard from "../components/QueueCard";
import * as publicApi from "../api/publicApi";

export default function Queue() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi.getQueue()
      .then(res => {
        // Assume res is ordered by time.
        // We will filter In Progress or Completed (recent) for now serving.
        setQueue(res);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const nowServing = queue.find(q => q.status === 'In Progress') || queue.find(q => q.status === 'Completed');
  const upcomingQueue = queue.filter(q => q.status === 'Confirmed' || q.status === 'Pending').map((q, i) => ({
    pos: i + 1,
    number: q.queue_number,
    name: q.patient_name,
    eta: (i + 1) * 15 // naive estimation
  }));

  return (
    <div className="bg-neutralbg dark:bg-slate-950 min-h-[calc(100vh-72px)] transition-colors">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Live Queue Status</h1>
          <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">Real-time clinic queue updates for today</p>
        </div>

        <div className="mt-8 max-w-2xl mx-auto">
          {loading ? (
            <div className="space-y-6">
              <div className="h-32 bg-primary/20 dark:bg-primary/10 rounded-2xl animate-pulse" />
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-16 bg-white dark:bg-slate-900 rounded-xl animate-pulse border border-slate-100 dark:border-slate-800" />)}
              </div>
            </div>
          ) : queue.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              <p>No active queue at the moment.</p>
            </div>
          ) : (
            <>
              {/* NOW SERVING */}
              {nowServing ? (
                <div className="bg-primary text-white rounded-2xl shadow-md p-6 flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase opacity-90 font-semibold">Now Serving</div>
                    <div className="text-3xl font-semibold mt-1">{nowServing.queue_number}</div>
                    <div className="text-sm opacity-95 mt-1">{nowServing.patient_name}</div>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                    {nowServing.patient_name[0]}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 rounded-2xl p-6 text-center shadow-inner">
                  <div className="text-sm font-medium">No patient currently being served.</div>
                </div>
              )}

              {/* UPCOMING */}
              <div className="mt-6">
                <div className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold mb-3">
                  <FaClock className="text-primary" /> Upcoming Queue
                </div>

                <div className="space-y-3">
                  {upcomingQueue.length === 0 ? (
                    <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-5 bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800">
                      No upcoming patients in the queue.
                    </div>
                  ) : (
                    upcomingQueue.map((q) => (
                      <QueueCard key={q.number} item={q} />
                    ))
                  )}
                </div>

                <div className="mt-6 bg-primary/10 text-gray-700 dark:text-gray-300 text-xs text-center py-4 rounded-xl">
                  Queue times are estimates and may vary. Thank you for your patience.
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
