import { useEffect, useState } from 'react';
import { LogIn, LogOut, Clock3 } from 'lucide-react';
import { attendanceSeed } from '../../data/doctorSeed';
import { loadState, saveState, nowTime } from '../../utils/storage';
import { Badge, Button, Card, PageHeader } from '../../components/doctor/DoctorUI';

export default function DoctorAttendance() {
  const [history, setHistory] = useState(() => loadState('doctor-attendance-history', attendanceSeed));
  const [today, setToday] = useState(() => loadState('doctor-attendance-today', { time_in: '--:--', time_out: '--:--', present: false }));
  
  useEffect(() => saveState('doctor-attendance-history', history), [history]); 
  useEffect(() => saveState('doctor-attendance-today', today), [today]);

  const clockIn = () => {
    setToday({ time_in: nowTime(), time_out: '--:--', present: true });
  };
  
  const clockOut = () => {
    if (today.time_in === '--:--') return; // Cannot clock out without clocking in
    const out = nowTime();
    setToday({ ...today, time_out: out });
    setHistory([{ id: Date.now(), date: new Date().toLocaleDateString(), time_in: today.time_in, time_out: out, total: '8h', status: 'Present' }, ...history]);
  };

  return (
    <div>
      <PageHeader title="Attendance" subtitle="Track your attendance and working hours" />
      <Card className="p-5 mb-6 border-teal-300 dark:border-teal-800">
        <div className="flex justify-between mb-6">
          <h2 className="font-bold">Today's Attendance</h2>
          <Badge tone={today.present ? "green" : "red"}>{today.present ? "Present" : "Absent"}</Badge>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-800 rounded-2xl p-6 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 grid place-items-center">
                <LogIn/>
              </div>
              <div>
                <p className="text-sm text-slate-500">Time In</p>
                <p className="text-2xl font-bold">{today.time_in}</p>
              </div>
            </div>
            {today.time_in === '--:--' && <Button onClick={clockIn}>Clock In</Button>}
          </div>
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-800 rounded-2xl p-6 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-700 grid place-items-center">
                <LogOut/>
              </div>
              <div>
                <p className="text-sm text-slate-500">Time Out</p>
                <p className="text-2xl font-bold">{today.time_out}</p>
              </div>
            </div>
            {today.time_in !== '--:--' && today.time_out === '--:--' && <Button variant="outline" onClick={clockOut}>Clock Out</Button>}
          </div>
        </div>
        <div className="mt-5 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 text-center">
          <p className="text-sm text-slate-500">Total Working Hours Today</p>
          <p className="font-bold text-lg flex items-center justify-center gap-2">
            <Clock3 size={18}/> {today.time_out !== '--:--' ? '8 Hours' : (today.present ? 'Ongoing...' : 'Not Started')}
          </p>
        </div>
      </Card>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Stat title="Present Days" value="22"/>
        <Stat title="Absent Days" value="1"/>
        <Stat title="Half Days" value="1"/>
        <Stat title="Total Hours" value="195h"/>
      </div>
      <Card className="p-5 overflow-x-auto">
        <h2 className="font-bold mb-5">Attendance History</h2>
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="text-left text-slate-500 border-b dark:border-slate-800">
              <th className="py-3">Date</th>
              <th>Time In</th>
              <th>Time Out</th>
              <th>Total Hours</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {history.map(h => (
              <tr key={h.id} className="border-b dark:border-slate-800">
                <td className="py-4">{h.date}</td>
                <td>{h.time_in}</td>
                <td>{h.time_out}</td>
                <td>{h.total}</td>
                <td><Badge tone={h.status === 'Absent' ? 'red' : 'green'}>{h.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
function Stat({title,value}){return <Card className="p-5"><p className="text-sm text-slate-500">{title}</p><p className="text-2xl font-bold mt-2">{value}</p></Card>}
