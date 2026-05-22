import { useEffect, useState } from 'react';
import { FaPhoneAlt as PhoneCall, FaStepForward as SkipForward, FaCheckCircle as CheckCircle2, FaSpinner as Loader2, FaUsers as Users } from 'react-icons/fa';
import { getQueue, updateQueueStatus } from '../../api/doctorApi';
import { Badge, Button, Card, PageHeader } from '../../components/doctor/DoctorUI';

export default function DoctorQueue() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchData = (showLoader = false) => {
    if (showLoader) setLoading(true);
    return getQueue()
      .then(data => {
        setQueue(data);
      })
      .catch(err => {
        console.error('Error fetching queue:', err);
      })
      .finally(() => {
        if (showLoader) setLoading(false);
      });
  };

  useEffect(() => {
    fetchData(true);

    const interval = setInterval(() => {
      fetchData(false);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const current = queue.find(q => q.queue_status === 'Serving');
  const waiting = queue.filter(q => q.queue_status === 'Waiting');
  const notArrived = queue.filter(q => q.queue_status === 'Active');
  const done = queue.filter(q => q.queue_status === 'Done');

  const tapInNext = () => {
    if (current) return alert('Please finish or skip the current patient first.');
    const next = waiting[0];
    if (!next) return alert('No tapped-in waiting patients in the hospital.');
    
    setUpdating(true);
    updateQueueStatus(next.queue_id, 'Serving')
      .then(() => {
        fetchData();
      })
      .catch(err => {
        alert(err.response?.data?.message || 'Failed to call next patient');
      })
      .finally(() => {
        setUpdating(false);
      });
  };

  const tapOutCurrent = () => {
    if (!current) return alert('No active patient currently in progress.');
    
    setUpdating(true);
    updateQueueStatus(current.queue_id, 'Done')
      .then(() => {
        fetchData();
      })
      .catch(err => {
        alert(err.response?.data?.message || 'Failed to mark patient as completed');
      })
      .finally(() => {
        setUpdating(false);
      });
  };

  const skip = () => {
    if (!current) return;
    
    setUpdating(true);
    // Move back to Waiting status
    updateQueueStatus(current.queue_id, 'Waiting')
      .then(() => {
        fetchData();
      })
      .catch(err => {
        alert(err.response?.data?.message || 'Failed to skip patient');
      })
      .finally(() => {
        setUpdating(false);
      });
  };

  const formatWaitTime = (createdAtStr) => {
    if (!createdAtStr) return '0 min';
    const diffMs = new Date() - new Date(createdAtStr);
    const mins = Math.max(0, Math.round(diffMs / (1000 * 60)));
    return `${mins} min`;
  };

  const getPatientFullName = (patient) => {
    if (!patient) return 'Unknown Patient';
    const mid = patient.middle_name ? ` ${patient.middle_name}` : '';
    return `${patient.first_name}${mid} ${patient.last_name}`;
  };

  return (
    <div className="space-y-6">
      <PageHeader title="My Queue" subtitle="Tap in the next waiting patient and tap out when the consultation is complete" />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="animate-spin text-teal-600" size={36} />
          <span className="text-slate-500 font-medium">Loading queue data...</span>
        </div>
      ) : (
        <>
          {/* Stats Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Stat title="In Progress" value={current ? 1 : 0} />
            <Stat title="Waiting" value={waiting.length} />
            <Stat title="Queue No. Only" value={notArrived.length} />
            <Stat title="Completed Today" value={done.length} />
          </div>

          {/* Current Patient Card */}
          <Card className="border-teal-200 dark:border-teal-900 overflow-hidden shadow-sm">
            <div className="bg-teal-50/50 dark:bg-teal-950/10 p-5 flex justify-between items-center border-b border-teal-100 dark:border-teal-900/50">
              <h2 className="font-bold text-slate-800 dark:text-slate-200">Current Active Patient</h2>
              <Badge tone={current ? "blue" : "gray"}>{current ? "Serving" : "None"}</Badge>
            </div>
            
            <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
              {current ? (
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-2xl bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 grid place-items-center font-bold text-2xl shadow-sm">
                    {current.queue_number}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                      {getPatientFullName(current.patient)}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Started: {formatWaitTime(current.updated_at)} ago · Source: <span className="font-semibold text-teal-600">{current.queue_source}</span>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 text-slate-400">
                  <Users size={28} />
                  <p className="font-medium text-slate-500">No patient is currently active in progress.</p>
                </div>
              )}
              
              <div className="flex gap-3">
                <Button 
                  variant="green" 
                  disabled={!current || updating} 
                  onClick={tapOutCurrent}
                  className="flex items-center gap-2 py-2 px-4 shadow-sm"
                >
                  <CheckCircle2 size={16} />
                  <span>Tap Out / Complete</span>
                </Button>
                <Button 
                  variant="outline" 
                  disabled={!current || updating} 
                  onClick={skip}
                  className="flex items-center gap-2 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
                >
                  <SkipForward size={16} />
                  <span>Skip / Defer</span>
                </Button>
              </div>
            </div>
          </Card>

          {/* Columns */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Upcoming Queue */}
            <Card className="p-6">
              <div className="flex justify-between items-center mb-5 border-b pb-4 dark:border-slate-800">
                <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100">
                  Upcoming Queue ({waiting.length})
                </h2>
                <Button 
                  onClick={tapInNext} 
                  disabled={waiting.length === 0 || updating}
                  className="flex items-center gap-2"
                >
                  <PhoneCall size={15} />
                  <span>Tap In Next</span>
                </Button>
              </div>
              
              {waiting.length === 0 ? (
                <div className="py-12 text-center text-slate-400 dark:text-slate-600">
                  <Users className="mx-auto mb-2 opacity-50" size={32} />
                  <p className="font-medium">No waiting patients left</p>
                  {notArrived.length > 0 && (
                    <p className="mt-1 text-xs">There are {notArrived.length} queue number(s), but they are not tapped in at the hospital yet.</p>
                  )}
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  {waiting.map(q => (
                    <div key={q.queue_id} className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl flex justify-between items-center hover:bg-slate-100/50 transition-colors">
                      <div className="flex gap-3 items-center">
                        <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 grid place-items-center font-bold text-lg">
                          {q.queue_number}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-100">
                            {getPatientFullName(q.patient)}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Waiting: {formatWaitTime(q.created_at)} · Priority: {q.priority_number || 'Standard'}
                          </p>
                        </div>
                      </div>
                      <Badge tone="yellow">Waiting</Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Completed Today */}
            <Card className="p-6">
              <div className="mb-5 border-b pb-4 dark:border-slate-800">
                <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100">
                  Completed Today ({done.length})
                </h2>
              </div>
              
              {done.length === 0 ? (
                <div className="py-12 text-center text-slate-400 dark:text-slate-600">
                  <CheckCircle2 className="mx-auto mb-2 opacity-50" size={32} />
                  <p className="font-medium">No completed patients yet</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  {done.map(q => (
                    <div key={q.queue_id} className="bg-slate-50 dark:bg-slate-800/20 p-4 border border-slate-100/50 dark:border-slate-800/50 rounded-2xl flex justify-between items-center">
                      <div className="flex gap-3 items-center">
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 grid place-items-center font-bold text-lg">
                          {q.queue_number}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-100">
                            {getPatientFullName(q.patient)}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Completed at: {new Date(q.updated_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                          </p>
                        </div>
                      </div>
                      <Badge tone="green">Completed</Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </>
      )}
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
