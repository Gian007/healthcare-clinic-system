import { useEffect, useState } from "react";
import AnnouncementCard from "../components/AnnouncementCard";
import * as publicApi from "../api/publicApi";

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi.getAnnouncements()
      .then(setAnnouncements)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-neutralbg dark:bg-slate-950 min-h-screen transition-colors">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Announcements</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Stay updated with the latest news and information
        </p>

        {loading ? (
          <div className="mt-6 space-y-4 max-w-4xl">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-white dark:bg-slate-900 rounded-xl animate-pulse border border-slate-100 dark:border-slate-800" />
            ))}
          </div>
        ) : announcements.length === 0 ? (
          <div className="mt-10 max-w-4xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-12 text-center text-gray-500 dark:text-gray-400 shadow-sm">
            <p>No announcements at this time.</p>
          </div>
        ) : (
          <div className="mt-6 space-y-4 max-w-4xl">
            {announcements.map((a) => (
              <AnnouncementCard key={a.id} item={a} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
