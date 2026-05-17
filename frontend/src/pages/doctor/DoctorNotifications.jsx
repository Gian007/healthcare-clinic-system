import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import * as notifApi from "../../api/notificationApi";

const TYPE_ICONS = { success: '✅', info: '🔔', warning: '⚠️', danger: '❌' };
const TYPE_COLORS = {
  success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  info:    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  danger:  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function DoctorNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);

  const load = () => {
    notifApi.getNotifications()
      .then(setNotifications)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleMarkRead = async (id) => {
    await notifApi.markRead(id);
    setNotifications(prev => prev.map(n => n.notif_id === id ? { ...n, is_read: true } : n));
  };

  const handleMarkAllRead = async () => {
    await notifApi.markAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 text-sm bg-teal-600 text-white px-2 py-0.5 rounded-full">{unreadCount}</span>
            )}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Real-time alerts, system broadcasts, and schedule updates</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead}
            className="rounded-2xl border border-teal-600/30 px-5 py-2 text-sm font-semibold text-teal-600 dark:text-teal-400 hover:bg-teal-600/5 transition">
            Mark all as read
          </button>
        )}
      </div>

      <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center">
            <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            <p className="text-4xl mb-3">🔔</p>
            <p className="font-semibold">No notifications at this time.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.map(n => (
              <div key={n.notif_id}
                className={`flex items-start gap-4 p-5 transition ${!n.is_read ? 'bg-teal-50/20 dark:bg-teal-950/5' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 ${TYPE_COLORS[n.type] || TYPE_COLORS.info}`}>
                  {TYPE_ICONS[n.type] || '🔔'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <p className={`font-semibold ${!n.is_read ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                      {n.title}
                      {!n.is_read && <span className="ml-2 inline-block w-2 h-2 bg-teal-600 rounded-full align-middle" />}
                    </p>
                    <span className="text-xs text-slate-400 shrink-0">
                      {new Date(n.created_at).toLocaleString('en-US', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm mt-1 text-slate-500 dark:text-slate-400 leading-relaxed">{n.body}</p>
                  <div className="flex gap-4 mt-2">
                    {!n.is_read && (
                      <button onClick={() => handleMarkRead(n.notif_id)}
                        className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-bold">
                        Mark as read
                      </button>
                    )}
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
