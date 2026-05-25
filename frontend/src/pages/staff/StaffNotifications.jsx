import { useEffect, useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import * as notifApi from "../../api/notificationApi";

const TYPE_ICONS = { success: '', info: '', warning: '', danger: '' };
const TYPE_COLORS = {
 success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
 info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
 warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
 danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function StaffNotifications() {
 const { dark } = useOutletContext();
 const navigate = useNavigate();
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

 const muted = dark ? "text-gray-400" : "text-gray-500";
 const card = dark ? "bg-gray-900 border-gray-800 text-white" : "bg-white border-gray-200 text-gray-900";

 return (
 <div>
 <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
 <div>
 <h1 className={`text-2xl font-semibold ${dark ? "text-white" : "text-gray-900"}`}>
 Notifications
 {unreadCount > 0 && (
 <span className="ml-2 text-sm bg-primary text-white px-2 py-0.5 rounded-full">{unreadCount}</span>
 )}
 </h1>
 <p className={`text-sm ${muted}`}>Real-time clinic alerts and updates</p>
 </div>
 {unreadCount > 0 && (
 <button onClick={handleMarkAllRead}
 className="rounded-lg border border-primary/30 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 transition">
 Mark all as read
 </button>
 )}
 </div>

 <div className={`mt-6 rounded-2xl border shadow-sm overflow-hidden ${card}`}>
 {loading ? (
 <div className="p-10 text-center">
 <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
 </div>
 ) : notifications.length === 0 ? (
 <div className="p-10 text-center text-gray-500 dark:text-gray-400">
 <p className="text-4xl mb-3"></p>
 <p>No notifications yet.</p>
 </div>
 ) : (
 <div className="divide-y divide-gray-100 dark:divide-gray-800">
 {notifications.map(n => (
 <div key={n.notif_id}
 className={`flex items-start gap-4 p-5 transition ${!n.is_read ? (dark ? 'bg-blue-950/20' : 'bg-blue-50/50') : ''}`}>
 <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 ${TYPE_COLORS[n.type] || TYPE_COLORS.info}`}>
 {TYPE_ICONS[n.type] || ''}
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex items-start justify-between gap-2 flex-wrap">
 <p className={`font-semibold ${!n.is_read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
 {n.title}
 {!n.is_read && <span className="ml-2 inline-block w-2 h-2 bg-primary rounded-full align-middle" />}
 </p>
 <span className={`text-xs ${muted} shrink-0`}>
 {new Date(n.created_at).toLocaleString('en-US', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}
 </span>
 </div>
 <p className={`text-sm mt-1 ${muted}`}>{n.body}</p>
 <div className="flex flex-col gap-2 mt-2">
 {n.link && n.link.includes('/staff/patients?review=') && (
 <div className="mb-1">
 <button
 onClick={() => {
 if (!n.is_read) handleMarkRead(n.notif_id);
 navigate(n.link);
 }}
 className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary/90 transition shadow-sm cursor-pointer"
 >
 <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
 </svg>
 Review Documents
 </button>
 </div>
 )}
 <div className="flex gap-4 items-center">
 {!n.is_read && (
 <button onClick={() => handleMarkRead(n.notif_id)}
 className="text-xs text-primary hover:underline">
 Mark as read
 </button>
 )}
 {n.link && !n.link.includes('/staff/patients?review=') && (
 <button onClick={() => {
 if (!n.is_read) handleMarkRead(n.notif_id);
 navigate(n.link);
 }}
 className="text-xs text-teal-600 hover:underline font-medium">
 Go to Page →
 </button>
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