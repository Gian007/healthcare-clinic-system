import { useEffect, useState } from 'react';
import { FaPlusSquare as Activity, FaUsers as Users } from 'react-icons/fa';
import { Card, Badge, Button, PageHeader } from '../../components/doctor/DoctorUI';
import { Link } from 'react-router-dom';
import * as doctorApi from '../../api/doctorApi';

export default function DoctorDashboard() {
  const [data, setData] = useState({
    appointments_today: [],
    queues_today: [],
    stats: { total_appointments: 0, completed: 0, waiting: 0 }
  });
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const res = await doctorApi.getDashboard();
      setData(res);
    } catch (error) {
      console.error("Failed to load doctor dashboard:", error);
    }
  };

  useEffect(() => {
    loadData().finally(() => setLoading(false));

    const interval = setInterval(() => {
      loadData();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="p-10 text-center">Loading dashboard...</div>;
  }

  const { appointments_today, queues_today, stats } = data;
  const waiting = stats.waiting;
  const activeQueue = queues_today.filter(q => !['Done', 'Cancelled'].includes(q.queue_status));
  const current = queues_today.find(q => q.queue_status === 'Serving') || queues_today.find(q => q.queue_status === 'Waiting');

  return <div>
    <PageHeader title="Dashboard" subtitle={new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} />
    <div className="rounded-2xl p-6 md:p-8 bg-gradient-to-r from-teal-600 to-cyan-600 text-white mb-6">
      <div className="flex justify-between gap-4"><div><p className="text-white/80">Current Status</p><h2 className="text-3xl font-bold mt-1">Available</h2></div><Badge tone="teal">On Duty</Badge></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-8">
        <Info label="Waiting" value={waiting} /><Info label="Completed" value={stats.completed} /><Info label="Start Time" value="9:00 AM" /><Info label="End Time" value="5:00 PM" />
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      <Mini title="Today's Appointments" value={stats.total_appointments} icon={<Activity />} />
      <Mini title="Current Queue" value={current ? `Q-${current.queue_number}` : '---'} icon={<Users />} />
    </div>
    <div className="grid lg:grid-cols-2 gap-6">
      <Card className="p-5">
        <div className="flex justify-between mb-5">
          <h2 className="font-bold">Today's Appointments</h2>
          <Link to="/doctor/appointments"><Button variant="outline">View All</Button></Link>
        </div>
        <div className="space-y-3">
          {appointments_today.length === 0 ? (
            <div className="text-center text-slate-500 py-4">No appointments for today.</div>
          ) : (
            appointments_today.slice(0,4).map(a => (
              <div key={a.appointment_id} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl flex justify-between items-center group hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-teal-100 dark:bg-teal-900/40 border border-teal-200 dark:border-teal-800 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                    {a.patient?.profile_picture ? (
                      <img 
                        src={`${import.meta.env.VITE_BACKEND_URL}/storage/${a.patient.profile_picture}`} 
                        className="w-full h-full object-cover" 
                        onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${a.patient.first_name}+${a.patient.last_name}&background=random`; }}
                      />
                    ) : (
                      <span className="text-teal-600 dark:text-teal-400 font-bold text-xs">{(a.patient?.first_name?.[0] || "") + (a.patient?.last_name?.[0] || "")}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white leading-tight">{a.patient?.first_name} {a.patient?.last_name}</p>
                    <p className="text-[10px] text-slate-500 font-bold tracking-tighter uppercase">{a.service?.service_name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{a.start_time}</p>
                  </div>
                </div>
                <Badge tone={a.booking_status === 'Pending' ? 'yellow' : 'green'}>{a.booking_status}</Badge>
              </div>
            ))
          )}
        </div>
      </Card>
      
      <Card className="p-5">
        <div className="flex justify-between mb-5">
          <h2 className="font-bold">Current Queue</h2>
          <Link to="/doctor/queue"><Button variant="outline">Manage Queue</Button></Link>
        </div>
        <div className="space-y-3">
          {activeQueue.length === 0 ? (
             <div className="text-center text-slate-500 py-4">No one is in the queue.</div>
          ) : (
            activeQueue.slice(0,3).map(q => (
              <div key={q.queue_id} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl flex justify-between items-center group hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-teal-100 dark:bg-teal-900/40 border border-teal-200 dark:border-teal-800 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                    {q.patient?.profile_picture ? (
                      <img 
                        src={`${import.meta.env.VITE_BACKEND_URL}/storage/${q.patient.profile_picture}`} 
                        className="w-full h-full object-cover" 
                        onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${q.patient.first_name}+${q.patient.last_name}&background=random`; }}
                      />
                    ) : (
                      <span className="text-teal-600 dark:text-teal-400 font-bold text-xs">{(q.patient?.first_name?.[0] || "") + (q.patient?.last_name?.[0] || "")}</span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                       <span className="w-8 h-4 rounded bg-teal-600 text-[10px] text-white flex items-center justify-center font-bold">Q-{q.queue_number}</span>
                       <p className="font-bold text-slate-900 dark:text-white leading-tight">{q.patient?.first_name} {q.patient?.last_name}</p>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">{new Date(q.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
                </div>
                <Badge tone={q.queue_status === 'Active' || q.queue_status === 'Serving' ? 'blue' : 'yellow'}>{q.queue_status}</Badge>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  </div>;
}
function Info({label,value}){return <div><p className="text-xs text-white/70">{label}</p><p className="text-xl font-bold">{value}</p></div>}
function Mini({title,value,icon}){return <Card className="p-5 flex items-center justify-between"><div><p className="text-sm text-slate-500">{title}</p><h3 className="text-2xl font-bold mt-2">{value}</h3></div><div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 grid place-items-center">{icon}</div></Card>}
