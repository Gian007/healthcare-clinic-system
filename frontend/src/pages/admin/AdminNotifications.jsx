import { useEffect, useState } from "react";
import { PageHeader, Modal } from "../../components/admin/AdminUI";
import * as adminApi from "../../api/adminApi";
import * as notifApi from "../../api/notificationApi";

const TYPE_ICONS = { success: '', info: '', warning: '', danger: '' };
const TYPE_COLORS = {
 success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
 info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
 warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
 danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function AdminNotifications() {
 const [notifications, setNotifications] = useState([]);
 const [loading, setLoading] = useState(true);

 // Announcement modal state
 const [showBroadcast, setShowBroadcast] = useState(false);
 const [broadcastForm, setBroadcastForm] = useState({ title: '', type: 'info', body: '' });
 const [broadcasting, setBroadcasting] = useState(false);
 const [error, setError] = useState('');
 const [success, setSuccess] = useState('');

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

 const handleBroadcastSubmit = async (e) => {
 e.preventDefault();
 setBroadcasting(true);
 setError('');
 setSuccess('');
 try {
 await adminApi.broadcastAnnouncement(broadcastForm);
 setSuccess('Announcement broadcasted successfully to all active accounts!');
 setBroadcastForm({ title: '', type: 'info', body: '' });
 setTimeout(() => {
 setShowBroadcast(false);
 setSuccess('');
 load();
 }, 1500);
 } catch (err) {
 setError(err.response?.data?.message || 'Failed to send broadcast.');
 } finally {
 setBroadcasting(false);
 }
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
 <div className="flex items-center gap-3">
 <button 
 onClick={() => setShowBroadcast(true)}
 className="px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-2xl shadow-lg hover:opacity-95 flex items-center gap-2 transition duration-300"
 >
 📢 Broadcast Announcement
 </button>
 {unreadCount > 0 && (
 <button onClick={handleMarkAllRead}
 className="px-4 py-2.5 rounded-2xl border border-primary/30 text-sm font-medium text-primary hover:bg-primary/5 transition">
 Mark all as read
 </button>
 )}
 </div>
 </div>

 <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
 {loading ? (
 <div className="p-10 text-center">
 <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
 </div>
 ) : notifications.length === 0 ? (
 <div className="p-12 text-center">
 <p className="text-4xl mb-3"></p>
 <p className="text-gray-500 dark:text-gray-400">No notifications yet.</p>
 </div>
 ) : (
 <div className="divide-y divide-gray-100 dark:divide-slate-800">
 {notifications.map(n => (
 <div key={n.notif_id}
 className={`flex items-start gap-4 p-5 transition ${!n.is_read ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''}`}>
 <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 ${TYPE_COLORS[n.type] || TYPE_COLORS.info}`}>
 {TYPE_ICONS[n.type] || ''}
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

 {showBroadcast && (
 <Modal title="📢 Broadcast General Announcement" onClose={() => setShowBroadcast(false)}>
 <form onSubmit={handleBroadcastSubmit} className="space-y-4">
 {error && (
 <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900/50 text-xs font-bold">
 {error}
 </div>
 )}
 {success && (
 <div className="p-3 bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 rounded-xl border border-green-100 dark:border-green-900/50 text-xs font-bold animate-pulse">
 {success}
 </div>
 )}
 
 <div>
 <label className="block text-xs font-black text-slate-400 dark:text-slate-300 uppercase tracking-wider mb-2">Announcement Title</label>
 <input 
 type="text"
 required
 placeholder="e.g., Clinic System Update, Free Medical Mission Notice"
 value={broadcastForm.title}
 onChange={e => setBroadcastForm(prev => ({ ...prev, title: e.target.value }))}
 className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-primary transition"
 />
 </div>

 <div>
 <label className="block text-xs font-black text-slate-400 dark:text-slate-300 uppercase tracking-wider mb-2">Alert / Theme Category</label>
 <select
 value={broadcastForm.type}
 onChange={e => setBroadcastForm(prev => ({ ...prev, type: e.target.value }))}
 className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-primary transition cursor-pointer"
 >
 <option value="info"> General Info (Blue Accent)</option>
 <option value="success"> Success Announcement (Green Accent)</option>
 <option value="warning"> Schedule Warning (Yellow Accent)</option>
 <option value="danger"> Critical / Closure Alert (Red Accent)</option>
 </select>
 </div>

 <div>
 <label className="block text-xs font-black text-slate-400 dark:text-slate-300 uppercase tracking-wider mb-2">Announcement Message</label>
 <textarea
 required
 rows={4}
 placeholder="Type the message body here. Every registered patient, doctor, and staff member will receive this in their notifications generally..."
 value={broadcastForm.body}
 onChange={e => setBroadcastForm(prev => ({ ...prev, body: e.target.value }))}
 className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-primary transition resize-none"
 />
 </div>

 <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
 <button 
 type="button"
 onClick={() => setShowBroadcast(false)}
 className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:opacity-90 transition"
 >
 Cancel
 </button>
 <button 
 type="submit"
 disabled={broadcasting}
 className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-primary text-white hover:opacity-95 disabled:opacity-50 transition shadow-lg shadow-primary/20"
 >
 {broadcasting ? 'Broadcasting...' : '📢 Send Announcement'}
 </button>
 </div>
 </form>
 </Modal>
 )}
 </div>
 );
}
