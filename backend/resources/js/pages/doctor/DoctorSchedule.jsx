import { useEffect, useState } from 'react';
import { Clock, CalendarDays, MapPin, Hash } from 'lucide-react';
import { Card, Badge, PageHeader } from '../../components/doctor/DoctorUI';
import * as doctorApi from '../../api/doctorApi';

export default function DoctorSchedule() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    doctorApi.getSchedules()
      .then(setSchedules)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalSlots = schedules.reduce((acc, curr) => acc + (curr.max_patients || 0), 0);
  const workDays = schedules.filter(s => s.schedule_status === 'Active').length;

  const formatTime = (t) => {
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 || 12;
    return `${displayH}:${m.toString().padStart(2, '0')} ${period}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <PageHeader 
        title="My Schedule" 
        subtitle="Your weekly rotation as configured by the administration" 
      />

      {schedules.length === 0 ? (
        <Card className="p-12 text-center">
           <CalendarDays className="mx-auto h-12 w-12 text-slate-300 mb-4" />
           <h3 className="text-lg font-bold text-slate-800 dark:text-white">No Schedules Found</h3>
           <p className="text-slate-500 mt-1">Please contact the administrator to set your regular working hours.</p>
        </Card>
      ) : (
        <>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {schedules.map((s) => (
              <Card key={s.schedule_id} className="p-6 hover:border-primary/30 transition-all">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{s.day_of_week}</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Regular Rotation</p>
                  </div>
                  <Badge tone={s.schedule_status === 'Active' ? 'green' : 'gray'}>
                    {s.schedule_status}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-600">
                      <Clock size={16} />
                    </div>
                    <span className="text-sm font-bold">{formatTime(s.start_time)} - {formatTime(s.end_time)}</span>
                  </div>

                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                      <Hash size={16} />
                    </div>
                    <span className="text-sm font-bold">Max Patients: {s.max_patients}</span>
                  </div>

                  {s.room && (
                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
                        <MapPin size={16} />
                      </div>
                      <span className="text-sm font-bold">Room: {s.room}</span>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                   <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Slot Duration</span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{s.slot_minutes} mins / patient</span>
                   </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-8 mt-8 bg-gradient-to-br from-primary/5 to-transparent border-primary/10 shadow-lg shadow-primary/5">
            <div className="grid md:grid-cols-3 gap-8">
              <Stat label="Active Days" value={`${workDays} days / week`} color="text-emerald-500" />
              <Stat label="Total Weekly Capacity" value={`${totalSlots} Patients`} color="text-primary" />
              <Stat label="System Status" value="Synced" color="text-blue-500" />
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div className="flex flex-col">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{label}</p>
      <p className={`text-2xl font-black ${color} tracking-tighter`}>{value}</p>
    </div>
  );
}
