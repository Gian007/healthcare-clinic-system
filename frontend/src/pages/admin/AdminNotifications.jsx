import { useEffect, useState } from "react";
import { PageHeader, Modal } from "../../components/admin/AdminUI";
import * as adminApi from "../../api/adminApi";
import * as notifApi from "../../api/notificationApi";

const TYPE_ICONS = { success: '✅', info: '🔔', warning: '⚠️', danger: '❌' };
const TYPE_COLORS = {
  success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  info:    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  danger:  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

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
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Notifications
            {unreadCount > 0 && <span className="ml-2 text-sm bg-primary text-white px-2 py-0.5 rounded-full">{unreadCount}</span>}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Admin notifications and system alerts</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead}
            className="px-4 py-2 rounded-lg border border-primary/30 text-sm font-medium text-primary hover:bg-primary/5 transition">
            Mark all as read
          </button>
        )}
      </div>

      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-4xl mb-3">🔔</p>
            <p className="text-gray-500 dark:text-gray-400">No notifications yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-slate-800">
            {notifications.map(n => (
              <div key={n.notif_id}
                className={`flex items-start gap-4 p-5 transition ${!n.is_read ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 ${TYPE_COLORS[n.type] || TYPE_COLORS.info}`}>
                  {TYPE_ICONS[n.type] || '🔔'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <p className={`font-semibold ${!n.is_read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                      {n.title}
                      {!n.is_read && <span className="ml-2 inline-block w-2 h-2 bg-primary rounded-full align-middle" />}
                    </p>
                    <span className="text-xs text-gray-400 shrink-0">
                      {new Date(n.created_at).toLocaleString('en-US', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{n.body}</p>
                  {!n.is_read && (
                    <button onClick={() => handleMarkRead(n.notif_id)}
                      className="mt-2 text-xs text-primary hover:underline">
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
