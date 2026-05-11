import { useEffect, useState } from 'react';
import { Activity, Users, Clock3, CheckCircle2 } from 'lucide-react';
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

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await doctorApi.getDashboardData();
        setData(res);
      } catch (error) {
        console.error("Failed to load doctor dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return <div className="p-10 text-center">Loading dashboard...</div>;
  }

  const { appointments_today, queues_today, stats } = data;
  const waiting = stats.waiting;
  const current = queues_today.find(q => q.queue_status === 'Active' || q.queue_status === 'Serving');

  return <div>
    <PageHeader title="Dashboard" subtitle={new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} />
    <div className="rounded-2xl p-6 md:p-8 bg-gradient-to-r from-teal-600 to-cyan-600 text-white mb-6">
      <div className="flex justify-between gap-4"><div><p className="text-white/80">Current Status</p><h2 className="text-3xl font-bold mt-1">Available</h2></div><Badge tone="teal">On Duty</Badge></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-8">
        <Info label="Waiting" value={waiting} /><Info label="Completed" value={stats.completed} /><Info label="Start Time" value="9:00 AM" /><Info label="End Time" value="5:00 PM" />
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      <Mini title="Today's Appointments" value={stats.total_appointments} icon={<Activity />} />
      <Mini title="Current Queue" value={current ? `Q-${current.queue_number}` : '---'} icon={<Users />} />
      <Mini title="Patients Today" value={queues_today.length} icon={<Clock3 />} />
      <Mini title="Completed" value={stats.completed} icon={<CheckCircle2 />} />
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
              <div key={a.appointment_id} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl flex justify-between items-center">
                <div>
                  <p className="font-bold">{a.patient?.first_name} {a.patient?.last_name}</p>
                  <p className="text-sm text-slate-500">{a.service?.service_name}</p>
                  <p className="text-xs text-slate-400">{a.start_time}</p>
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
          {queues_today.length === 0 ? (
             <div className="text-center text-slate-500 py-4">No one is in the queue.</div>
          ) : (
            queues_today.slice(0,3).map(q => (
              <div key={q.queue_id} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 grid place-items-center font-bold">{q.queue_number}</div>
                  <div>
                    <p className="font-bold">{q.patient?.first_name} {q.patient?.last_name}</p>
                    <p className="text-sm text-slate-500">{new Date(q.created_at).toLocaleTimeString()}</p>
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
