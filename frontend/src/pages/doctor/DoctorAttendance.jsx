import { useEffect, useState } from 'react';
import { FaSignInAlt as LogIn, FaSignOutAlt as LogOut, FaClock as Clock3, FaSpinner as Loader2, FaCalendar as Calendar } from 'react-icons/fa';
import { getAttendance, recordAttendance } from '../../api/doctorApi';
import { Badge, Button, Card, PageHeader } from '../../components/doctor/DoctorUI';

export default function DoctorAttendance() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [today, setToday] = useState({ time_in: '--:--', time_out: '--:--', present: false });

  const fetchData = () => {
    setLoading(true);
    getAttendance()
      .then(data => {
        setHistory(data);
        // Find if today already has a record
        const todayStr = new Date().toLocaleDateString('en-CA');
        const todayRecord = data.find(item => item.date === todayStr);
        if (todayRecord) {
          setToday({
            time_in: todayRecord.time_in ? formatTime(todayRecord.time_in) : '--:--',
            time_out: todayRecord.time_out ? formatTime(todayRecord.time_out) : '--:--',
            present: !!todayRecord.time_in
          });
        } else {
          setToday({ time_in: '--:--', time_out: '--:--', present: false });
        }
      })
      .catch(err => {
        console.error('Error fetching attendance:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatTime = (timeStr) => {
    if (!timeStr || timeStr === '--:--') return '--:--';
    try {
      const parts = timeStr.split(':');
      const date = new Date();
      date.setHours(parseInt(parts[0], 10));
      date.setMinutes(parseInt(parts[1], 10));
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch (e) {
      return timeStr;
    }
  };

  const handleAction = (action) => {
    setSubmitting(true);
    recordAttendance({ action })
      .then(() => {
        fetchData();
      })
      .catch(err => {
        const msg = err.response?.data?.message || 'Failed to record attendance';
        alert(msg);
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  const computeWorkingHours = (inStr, outStr) => {
    if (!inStr || !outStr || inStr === null || outStr === null) return '--';
    try {
      const inParts = inStr.split(':');
      const outParts = outStr.split(':');
      const inDate = new Date(2000, 0, 1, parseInt(inParts[0]), parseInt(inParts[1]));
      const outDate = new Date(2000, 0, 1, parseInt(outParts[0]), parseInt(outParts[1]));
      const diffMs = outDate - inDate;
      if (diffMs < 0) return '0h';
      const hours = (diffMs / (1000 * 60 * 60)).toFixed(1);
      return `${hours}h`;
    } catch (e) {
      return '--';
    }
  };

  // Calculations for Stats
  const presentDaysCount = history.filter(h => h.time_in !== null).length;
  const totalHoursCount = history.reduce((acc, h) => {
    if (h.time_in && h.time_out) {
      const hrsStr = computeWorkingHours(h.time_in, h.time_out).replace('h', '');
      const val = parseFloat(hrsStr);
      return acc + (isNaN(val) ? 0 : val);
    }
    return acc;
  }, 0).toFixed(1);

  return (
    <div className="space-y-6">
      <PageHeader title="Attendance" subtitle="Track your attendance and working hours dynamically connected to database" />
      
      <Card className="p-6 border-teal-200 dark:border-teal-900 shadow-sm relative overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100">Today's Attendance Status</h2>
          <Badge tone={today.present ? "green" : "red"}>{today.present ? "Present" : "Absent"}</Badge>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="animate-spin text-teal-600" size={32} />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {/* Clock In */}
            <div className="bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900 rounded-2xl p-6 flex justify-between items-center transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 grid place-items-center">
                  <LogIn size={24} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Time In</p>
                  <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{today.time_in}</p>
                </div>
              </div>
              {today.time_in === '--:--' && (
                <Button 
                  onClick={() => handleAction('time_in')} 
                  disabled={submitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                >
                  {submitting ? 'Recording...' : 'Clock In'}
                </Button>
              )}
            </div>

            {/* Clock Out */}
            <div className="bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900 rounded-2xl p-6 flex justify-between items-center transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 grid place-items-center">
                  <LogOut size={24} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Time Out</p>
                  <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{today.time_out}</p>
                </div>
              </div>
              {today.time_in !== '--:--' && today.time_out === '--:--' && (
                <Button 
                  variant="outline" 
                  onClick={() => handleAction('time_out')} 
                  disabled={submitting}
                  className="border-rose-200 dark:border-rose-900 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                >
                  {submitting ? 'Recording...' : 'Clock Out'}
                </Button>
              )}
            </div>
          </div>
        )}

        <div className="mt-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-center border border-slate-100 dark:border-slate-800/50">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Working Hours Today</p>
          <p className="font-bold text-lg text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2 mt-1">
            <Clock3 size={18} className="text-teal-600" /> 
            <span>
              {today.time_out !== '--:--' && today.time_in !== '--:--'
                ? computeWorkingHours(
                    history.find(h => h.date === new Date().toLocaleDateString('en-CA'))?.time_in, 
                    history.find(h => h.date === new Date().toLocaleDateString('en-CA'))?.time_out
                  ) + ' Hours'
                : (today.present ? 'Ongoing Shift...' : 'Not Clocked In')}
            </span>
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Stat title="Present Days" value={loading ? '...' : presentDaysCount}/>
        <Stat title="Absent Days" value={loading ? '...' : history.filter(h => h.time_in === null).length}/>
        <Stat title="Total Working Hours" value={loading ? '...' : `${totalHoursCount}h`}/>
        <Stat title="Average Shift" value={loading ? '...' : presentDaysCount > 0 ? `${(totalHoursCount / presentDaysCount).toFixed(1)}h` : '0h'}/>
      </div>

      <Card className="p-6 overflow-hidden">
        <div className="flex items-center justify-between mb-5 border-b pb-4 dark:border-slate-800">
          <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100">Attendance History</h2>
          <Button variant="ghost" onClick={fetchData} className="text-xs text-indigo-500 hover:text-indigo-600">
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="animate-spin text-teal-600" size={24} />
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <Calendar size={32} />
            <p className="text-slate-500 font-medium mt-2">No attendance history records</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px] border-collapse">
              <thead>
                <tr className="text-left text-slate-500 border-b dark:border-slate-800 pb-3">
                  <th className="py-3 font-semibold text-slate-400">Date</th>
                  <th className="py-3 font-semibold text-slate-400">Time In</th>
                  <th className="py-3 font-semibold text-slate-400">Time Out</th>
                  <th className="py-3 font-semibold text-slate-400">Total Hours</th>
                  <th className="py-3 font-semibold text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {history.map(h => (
                  <tr key={h.id || h.date} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 font-semibold text-slate-700 dark:text-slate-200">
                      {new Date(h.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </td>
                    <td className="py-4 text-slate-600 dark:text-slate-300">{h.time_in ? formatTime(h.time_in) : '--:--'}</td>
                    <td className="py-4 text-slate-600 dark:text-slate-300">{h.time_out ? formatTime(h.time_out) : '--:--'}</td>
                    <td className="py-4 font-medium text-slate-500 dark:text-slate-400">
                      {h.time_in && h.time_out ? computeWorkingHours(h.time_in, h.time_out) : '--'}
                    </td>
                    <td className="py-4">
                      <Badge tone={h.time_in ? 'green' : 'red'}>
                        {h.time_in ? 'Present' : 'Absent'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <Card className="p-5 hover:shadow-md transition-shadow">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
      <p className="text-2xl font-bold mt-2 text-slate-800 dark:text-slate-100">{value}</p>
    </Card>
  );
}
