import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import StaffTableBadge from "../../components/staff/StaffTableBadge";
import * as staffApi from "../../api/staffApi";

export default function StaffDashboard() {
 const { dark } = useOutletContext();
 const [data, setData] = useState({
 appointments_today: [],
 queues_today: [],
 stats: { total_appointments: 0, active_queues: 0, total_patients: 0, walkins_today: 0 }
 });
 const [loading, setLoading] = useState(true);

 const loadData = async () => {
 try {
 const res = await staffApi.getDashboardData();
 setData(res);
 } catch (error) {
 console.error("Failed to load staff dashboard:", error);
 }
 };

 useEffect(() => {
 loadData().finally(() => setLoading(false));

 const interval = setInterval(() => {
 loadData();
 }, 10000);

 return () => clearInterval(interval);
 }, []);

 const card = dark
 ? "border-gray-800 bg-gray-900 text-white"
 : "border-gray-200 bg-white text-gray-900";

 const miniCard = dark
 ? "border-gray-800 bg-gray-950 text-white hover:bg-gray-800"
 : "border-gray-200 bg-white text-gray-900 hover:bg-teal-50";

 const muted = dark ? "text-gray-400" : "text-gray-500";

 if (loading) {
 return <div className="p-10 text-center">Loading dashboard...</div>;
 }

 const { stats, queues_today, appointments_today } = data;

 const summaryStats = [
 { label: "Total Patients", value: stats.total_patients, sub: "Registered", icon: "👥", link: "/staff/patients" },
 { label: "Active Queues", value: stats.active_queues, sub: "Currently waiting", icon: "", link: "/staff/queue" },
 { label: "Today's Appointments", value: stats.total_appointments, sub: "Scheduled", icon: "", link: "/staff/appointments" },
 { label: "Pending Verifications", value: stats.pending_verifications || 0, sub: "Requires review", icon: "🔍", link: "/staff/patients" },
 { label: "Walk-ins Today", value: stats.walkins_today, sub: "Unscheduled", icon: "🚶", link: "/staff/walk-in" },
 ];

 const quickLinks = [
 {
 title: "Manage Queue",
 desc: "View and manage current queue status",
 path: "/staff/queue",
 icon: "📋",
 },
 {
 title: "Register Walk-in",
 desc: "Add new walk-in patient to queue",
 path: "/staff/walk-in",
 icon: "🚶",
 },
 {
 title: "View Appointments",
 desc: "Check today's appointment schedule",
 path: "/staff/appointments",
 icon: "",
 },
 ];

 return (
 <div className="space-y-6">
 <div>
 <h1 className={`text-2xl font-semibold ${dark ? "text-white" : "text-gray-900"}`}>
 Dashboard
 </h1>
 <p className={`text-sm ${muted}`}>Clinic front desk overview - {new Date().toLocaleDateString()}</p>
 </div>

 <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
 {summaryStats.map((stat) => (
 <Link
 key={stat.label}
 to={stat.link}
 className={`rounded-2xl border p-5 shadow-sm block transition-all hover:-translate-y-1 hover:shadow-md ${card}`}
 >
 <div className="flex items-start justify-between gap-4">
 <div>
 <p className={`text-sm ${muted}`}>{stat.label}</p>
 <h2 className="mt-3 text-3xl font-bold">{stat.value}</h2>
 <p className="mt-2 text-xs font-medium text-teal-600">
 {stat.sub}
 </p>
 </div>

 <div className="grid h-11 w-11 place-items-center rounded-full bg-teal-100 text-lg">
 {stat.icon}
 </div>
 </div>
 </Link>
 ))}
 </div>

 <section className={`rounded-2xl border p-5 shadow-sm ${card}`}>
 <h2 className="font-semibold">Quick Access</h2>

 <div className="mt-4 grid gap-4 md:grid-cols-3">
 {quickLinks.map((item) => (
 <Link
 key={item.title}
 to={item.path}
 className={`rounded-2xl border p-5 transition hover:border-teal-500 ${miniCard}`}
 >
 <div className="grid h-12 w-12 place-items-center rounded-full bg-teal-100 text-xl">
 {item.icon}
 </div>

 <h3 className="mt-6 font-semibold">{item.title}</h3>
 <p className={`mt-1 text-sm ${muted}`}>{item.desc}</p>
 </Link>
 ))}
 </div>
 </section>

 <section className={`rounded-2xl border p-5 shadow-sm ${card}`}>
 <div className="flex items-center justify-between">
 <h2 className="font-semibold">Recent Queue Activity</h2>
 <Link
 to="/staff/queue"
 className="text-sm font-medium text-teal-600 hover:underline"
 >
 View Full Queue
 </Link>
 </div>

 <div className={`mt-4 divide-y ${dark ? "divide-gray-800" : "divide-gray-100"}`}>
 {queues_today.length === 0 ? (
 <div className="py-8 text-center text-gray-500">No queues for today.</div>
 ) : (
 queues_today.slice(0, 5).map((q) => (
 <div
 key={q.queue_id}
 className="flex items-center justify-between gap-4 py-4"
 >
 <div className="flex items-center gap-3">
 <div className="h-8 w-8 rounded-full bg-teal-100 dark:bg-teal-900/40 border border-teal-200 dark:border-teal-800 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
 {q.patient?.profile_picture ? (
 <img 
 src={`${import.meta.env.VITE_BACKEND_URL}/storage/${q.patient.profile_picture}`} 
 className="w-full h-full object-cover" 
 onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${q.patient.first_name}+${q.patient.last_name}&background=random`; }}
 />
 ) : (
 <span className="text-teal-600 dark:text-teal-400 font-bold text-[9px]">{(q.patient?.first_name?.[0] || "") + (q.patient?.last_name?.[0] || "")}</span>
 )}
 </div>
 <div>
 <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">Q-{q.queue_number} - {q.patient?.first_name} {q.patient?.last_name}</p>
 <p className={`text-[10px] ${muted} mt-0.5`}>{q.doctor ? `Dr. ${q.doctor.last_name}` : 'No Doctor'} • {q.queue_source}</p>
 </div>
 </div>

 <div className="flex items-center gap-3">
 <p className="hidden text-xs text-gray-400 sm:block">
 {new Date(q.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
 </p>
 <StaffTableBadge status={q.queue_status} />
 </div>
 </div>
 ))
 )}
 </div>
 </section>
 </div>
 );
}