import { FaClock } from "react-icons/fa";
import QueueCard from "../components/QueueCard";
import { nowServing, upcomingQueue } from "../data/queue";

export default function Queue() {
  return (
    <div className="bg-neutralbg min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            Live Queue Status
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Real-time queue updates and estimated wait times
          </p>
        </div>

        <div className="mt-8 max-w-2xl mx-auto">
          {/* NOW SERVING */}
          <div className="bg-primary text-white rounded-2xl shadow-md p-6 flex items-center justify-between">
            <div>
              <div className="text-xs uppercase opacity-90 font-semibold">
                Now Serving
              </div>
              <div className="text-3xl font-semibold mt-1">{nowServing.number}</div>
              <div className="text-sm opacity-95 mt-1">{nowServing.name}</div>
            </div>

            <div className="w-16 h-16 rounded-full bg-white/90" />
          </div>

          {/* UPCOMING */}
          <div className="mt-6">
            <div className="flex items-center gap-2 text-gray-900 font-semibold mb-3">
              <FaClock className="text-primary" />
              Upcoming Queue
            </div>

            <div className="space-y-3">
              {upcomingQueue.map((q) => (
                <QueueCard key={q.number} item={q} />
              ))}
            </div>

            <div className="mt-6 bg-primary/10 text-gray-700 text-xs text-center py-4 rounded-xl">
              Queue times are estimates and may vary. Thank you for your patience.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
