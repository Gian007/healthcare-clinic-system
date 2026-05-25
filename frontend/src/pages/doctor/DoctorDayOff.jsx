import { useEffect, useState } from 'react';
import { FaCalendarTimes as CalendarX2, FaPlus as Plus, FaTrash as Trash2, FaSpinner as Loader2, FaCalendarAlt as CalendarRange, FaClock as Clock } from 'react-icons/fa';
import { getDayOffs, requestDayOff, cancelDayOff } from '../../api/doctorApi';
import { Badge, Button, Card, Modal, PageHeader } from '../../components/doctor/DoctorUI';

export default function DoctorDayOff(){
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ date: '', reason: '', is_half_day: false, start_time: '', end_time: '' });

  const fetchData = () => {
    setLoading(true);
    getDayOffs()
      .then(data => {
        setRows(data);
      })
      .catch(err => {
        console.error('Error fetching day offs:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const add = () => {
    if (!form.date || !form.reason) return alert('Please specify both date and reason.');
    if (form.is_half_day && (!form.start_time || !form.end_time)) {
      return alert('Please specify both start time and end time for a half-day request.');
    }

    setSubmitting(true);
    requestDayOff(form)
      .then(() => {
        setForm({ date: '', reason: '', is_half_day: false, start_time: '', end_time: '' });
        setOpen(false);
        fetchData();
      })
      .catch(err => {
        const msg = err.response?.data?.message || 'Failed to submit request';
        alert(msg);
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  const remove = (id) => {
    if (!confirm('Are you sure you want to remove this day-off request?')) return;
    cancelDayOff(id)
      .then(() => {
        fetchData();
      })
      .catch(err => {
        const msg = err.response?.data?.message || 'Failed to remove request';
        alert(msg);
      });
  };

  const count = s => rows.filter(r => r.status === s).length;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime12Hour = (timeStr) => {
    if (!timeStr) return '';
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

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Day Off Requests" 
        subtitle="Manage and request your leaves and scheduled day-offs" 
        action={
          <Button onClick={() => setOpen(true)} className="flex items-center gap-2">
            <Plus size={16} />
            <span>Request Day Off / Half Day</span>
          </Button>
        } 
      />

      <div className="grid md:grid-cols-3 gap-4">
        <Stat title="Pending Requests" value={loading ? '...' : count('Pending')} tone="yellow" iconColor="text-amber-500" />
        <Stat title="Approved Leaves" value={loading ? '...' : count('Approved')} tone="green" iconColor="text-emerald-500" />
        <Stat title="Rejected Requests" value={loading ? '...' : count('Rejected')} tone="red" iconColor="text-rose-500" />
      </div>

      <Card className="p-6 overflow-hidden">
        <div className="flex items-center justify-between mb-5 border-b pb-4 dark:border-slate-800">
          <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100">Request History</h2>
          <Button variant="ghost" onClick={fetchData} className="text-xs text-indigo-500 hover:text-indigo-600">
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <Loader2 className="animate-spin text-teal-600" size={32} />
            <span className="text-slate-500 text-sm">Fetching request history...</span>
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400">
              <CalendarRange size={36} />
            </div>
            <p className="text-slate-500 font-medium">No day-off requests found</p>
            <p className="text-slate-400 text-xs max-w-xs text-center">You haven't requested any day-offs yet. Click the button above to request one.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px] border-collapse">
              <thead>
                <tr className="text-left text-slate-500 border-b dark:border-slate-800 pb-3">
                  <th className="py-3 font-semibold text-slate-400">Date Requested For</th>
                  <th className="py-3 font-semibold text-slate-400">Reason</th>
                  <th className="py-3 font-semibold text-slate-400">Submitted On</th>
                  <th className="py-3 font-semibold text-slate-400">Status</th>
                  <th className="py-3 font-semibold text-slate-400 text-right pr-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {rows.map(r => (
                  <tr key={r.dayoff_id} className="hover:bg-slate-50/55 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 font-semibold text-slate-700 dark:text-slate-200">
                      <div>{formatDate(r.dayoff_date)}</div>
                      {r.is_half_day ? (
                        <div className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-600 dark:text-teal-400 mt-1 px-1.5 py-0.5 bg-teal-50 dark:bg-teal-500/10 rounded">
                          <Clock size={10} />
                          <span>Half Day: {formatTime12Hour(r.start_time)} - {formatTime12Hour(r.end_time)}</span>
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-400 mt-1">Full Day</div>
                      )}
                    </td>
                    <td className="py-4 text-slate-600 dark:text-slate-300 max-w-xs truncate" title={r.reason}>
                      {r.reason}
                    </td>
                    <td className="py-4 text-slate-500 dark:text-slate-400">
                      {formatDate(r.created_at)}
                    </td>
                    <td className="py-4">
                      <Badge 
                        tone={
                          r.status === 'Approved' ? 'green' : 
                          r.status === 'Rejected' ? 'red' : 'yellow'
                        }
                      >
                        {r.status}
                      </Badge>
                    </td>
                    <td className="py-4 text-right pr-2">
                      {r.status === 'Pending' ? (
                        <Button 
                          variant="ghost" 
                          onClick={() => remove(r.dayoff_id)}
                          className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-medium inline-flex items-center gap-1 py-1 px-2 text-xs"
                        >
                          <Trash2 size={13} className="inline" />
                          <span>Cancel</span>
                        </Button>
                      ) : (
                        <span className="text-xs text-slate-400 dark:text-slate-600 italic">Locked</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {open && (
        <Modal title="Request Day Off" onClose={() => setOpen(false)}>
          <div className="space-y-4 p-1">
            {/* Date Select */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Select Date</label>
              <input 
                type="date" 
                className="w-full p-3 rounded-xl border dark:bg-slate-800 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 outline-none" 
                value={form.date} 
                min={new Date().toLocaleDateString('en-CA')}
                onChange={e => setForm({ ...form, date: e.target.value })}
              />
            </div>

            {/* Half Day Option */}
            <div className="flex items-center gap-2 py-1">
              <input 
                type="checkbox" 
                id="is_half_day" 
                className="w-4 h-4 rounded text-teal-600 border-slate-300 dark:border-slate-700 focus:ring-teal-500 cursor-pointer"
                checked={form.is_half_day}
                onChange={e => setForm({ ...form, is_half_day: e.target.checked })}
              />
              <label htmlFor="is_half_day" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                Request as Half Day (Time Range)
              </label>
            </div>

            {/* Conditional Time Inputs */}
            {form.is_half_day && (
              <div className="grid grid-cols-2 gap-4 animate-fadeIn">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Start Time</label>
                  <input 
                    type="time" 
                    className="w-full p-3 rounded-xl border dark:bg-slate-800 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 outline-none" 
                    value={form.start_time} 
                    onChange={e => setForm({ ...form, start_time: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">End Time</label>
                  <input 
                    type="time" 
                    className="w-full p-3 rounded-xl border dark:bg-slate-800 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 outline-none" 
                    value={form.end_time} 
                    onChange={e => setForm({ ...form, end_time: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* Reason */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Reason for Leave</label>
              <textarea 
                placeholder="Describe your reason for requesting leave..." 
                className="w-full p-3 h-28 rounded-xl border dark:bg-slate-800 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 outline-none resize-none" 
                value={form.reason} 
                onChange={e => setForm({ ...form, reason: e.target.value })}
              />
            </div>

            <Button 
              onClick={add} 
              disabled={submitting || !form.date || !form.reason}
              className="w-full py-3 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin inline mr-1" size={16} />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit Request</span>
              )}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Stat({ title, value, tone, iconColor }) {
  return (
    <Card className="p-5 flex justify-between items-center hover:shadow-md transition-all duration-300">
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
        <p className="text-3xl font-bold mt-1 text-slate-800 dark:text-slate-100">{value}</p>
      </div>
      <div className={`p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl ${iconColor}`}>
        <CalendarX2 size={24} />
      </div>
    </Card>
  );
}
