import { useEffect, useState } from "react";
import * as notifApi from "../../api/notificationApi";
import * as publicApi from "../../api/publicApi";
import { FaBell, FaBullhorn, FaCheckCircle, FaInfoCircle, FaCalendarCheck } from "react-icons/fa";

export default function PatientNotifications() {
  const [activeTab, setActiveTab] = useState('specific'); // 'specific' | 'general'
  const [notifications, setNotifications] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      notifApi.getNotifications(),
      publicApi.getAnnouncements()
    ]).then(([notifs, annos]) => {
      setNotifications(notifs);
      setAnnouncements(annos);
    }).catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await notifApi.markRead(id);
      setNotifications(prev => prev.map(n => n.notif_id === id ? { ...n, is_read: true } : n));
    } catch (e) { console.error(e); }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'success': return <FaCheckCircle className="text-green-500" />;
      case 'info':    return <FaInfoCircle className="text-blue-500" />;
      case 'warning': return <FaInfoCircle className="text-amber-500" />;
      case 'booking': return <FaCalendarCheck className="text-primary" />;
      default:        return <FaBell className="text-gray-400" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Stay updated with clinic news and your activities.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-slate-800 mb-6">
        <button
          onClick={() => setActiveTab('specific')}
          className={`px-6 py-3 text-sm font-bold transition-colors relative ${activeTab === 'specific' ? 'text-primary' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Specific (For You)
          {notifications.filter(n => !n.is_read).length > 0 && (
            <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{notifications.filter(n => !n.is_read).length}</span>
          )}
          {activeTab === 'specific' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
        </button>
        <button
          onClick={() => setActiveTab('general')}
          className={`px-6 py-3 text-sm font-bold transition-colors relative ${activeTab === 'general' ? 'text-primary' : 'text-gray-500 hover:text-gray-700'}`}
        >
          General (Announcements)
          {activeTab === 'general' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-white dark:bg-slate-900 rounded-2xl animate-pulse border border-gray-100 dark:border-slate-800" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {activeTab === 'specific' ? (
            notifications.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-gray-200 dark:border-slate-800">
                <FaBell className="text-4xl text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No personal notifications yet.</p>
              </div>
            ) : (
              notifications.map(n => (
                <div 
                  key={n.notif_id} 
                  className={`bg-white dark:bg-slate-900 p-5 rounded-2xl border transition-all ${!n.is_read ? 'border-primary/30 bg-primary/5' : 'border-gray-100 dark:border-slate-800'}`}
                  onClick={() => !n.is_read && handleMarkRead(n.notif_id)}
                >
                  <div className="flex gap-4">
                    <div className="mt-1 h-10 w-10 shrink-0 rounded-xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 flex items-center justify-center text-lg shadow-sm">
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className={`font-bold leading-tight ${!n.is_read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>{n.title}</h3>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap">{new Date(n.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">{n.body}</p>
                      {!n.is_read && (
                        <button className="mt-3 text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Mark as read</button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )
          ) : (
            announcements.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-gray-200 dark:border-slate-800">
                <FaBullhorn className="text-4xl text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No clinic announcements yet.</p>
              </div>
            ) : (
              announcements.map(a => (
                <div key={a.announcement_id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 hover:shadow-md transition-shadow">
                  <div className="flex gap-4">
                    <div className="mt-1 h-10 w-10 shrink-0 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 flex items-center justify-center text-lg shadow-sm">
                      <FaBullhorn />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">{a.title}</h3>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap">{new Date(a.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed whitespace-pre-wrap">{a.content}</p>
                      {a.image_path && (
                        <img 
                          src={`${import.meta.env.VITE_BACKEND_URL}/storage/${a.image_path}`} 
                          className="mt-4 rounded-xl max-h-60 w-auto object-cover border border-gray-100 dark:border-slate-800"
                          alt="Announcement"
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      )}
    </div>
  );
}
