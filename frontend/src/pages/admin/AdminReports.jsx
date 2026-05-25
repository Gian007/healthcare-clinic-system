import { useEffect, useState } from "react";
import { PageHeader } from "../../components/admin/AdminUI";
import * as adminApi from "../../api/adminApi";

function StatBox({ label, value, color }) {
  return (
    <div className={`rounded-2xl p-5 ${color} text-white`}>
      <p className="text-sm font-medium opacity-90">{label}</p>
      <p className="text-4xl font-bold mt-2">{value ?? '—'}</p>
    </div>
  );
}

export default function AdminReports() {
  const today = new Date().toLocaleDateString('en-CA');
  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toLocaleDateString('en-CA');

  const [from, setFrom]       = useState(firstOfMonth);
  const [to, setTo]           = useState(today);
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);

  const load = () => {
    setLoading(true);
    adminApi.getReports({ from, to })
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <div>
      <PageHeader title="Reports & Analytics" subtitle="Real-time statistics from the database." />

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 mb-6 flex flex-col sm:flex-row items-end gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">From</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)}
            className="border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 dark:bg-slate-800 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">To</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)}
            className="border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 dark:bg-slate-800 dark:text-white" />
        </div>
        <button onClick={load} disabled={loading}
          className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50">
          {loading ? 'Loading...' : 'Generate Report'}
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-2xl p-5 bg-gray-200 dark:bg-slate-700 animate-pulse h-28" />
          ))}
        </div>
      ) : data ? (
        <>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Showing data from <strong>{data.period.from}</strong> to <strong>{data.period.to}</strong>
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            <StatBox label="Total Appointments"   value={data.total_appointments}    color="bg-gradient-to-br from-teal-600 to-teal-500" />
            <StatBox label="Completed"            value={data.completed}             color="bg-gradient-to-br from-green-600 to-green-500" />
            <StatBox label="Cancelled"            value={data.cancelled}             color="bg-gradient-to-br from-red-500 to-red-400" />
            <StatBox label="No Show"              value={data.no_show}               color="bg-gradient-to-br from-gray-600 to-gray-500" />
            <StatBox label="Pending"              value={data.pending}               color="bg-gradient-to-br from-yellow-500 to-yellow-400" />
            <StatBox label="Total Patients"       value={data.total_patients}        color="bg-gradient-to-br from-blue-600 to-blue-500" />
            <StatBox label="New Patients"         value={data.new_patients}          color="bg-gradient-to-br from-indigo-600 to-indigo-500" />
            <StatBox label="Verified Patients"    value={data.verified_patients}     color="bg-gradient-to-br from-purple-600 to-purple-500" />
            <StatBox label="Pending Verifications"value={data.pending_verifications} color="bg-gradient-to-br from-orange-500 to-orange-400" />
            <StatBox label="Total Doctors"        value={data.total_doctors}         color="bg-gradient-to-br from-cyan-600 to-cyan-500" />
          </div>

          <div className="mt-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
            <h2 className="font-bold mb-3">Appointment Breakdown</h2>
            {data.total_appointments === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">No appointments in the selected period.</p>
            ) : (
              <div className="space-y-3">
                {[
                  { label: 'Completed', value: data.completed, color: 'bg-green-500' },
                  { label: 'Pending',   value: data.pending,   color: 'bg-yellow-400' },
                  { label: 'Cancelled', value: data.cancelled, color: 'bg-red-400' },
                  { label: 'No Show',   value: data.no_show,   color: 'bg-gray-400' },
                ].map(b => (
                  <div key={b.label} className="flex items-center gap-3">
                    <span className="text-sm w-24 text-gray-600 dark:text-gray-400">{b.label}</span>
                    <div className="flex-1 bg-gray-100 dark:bg-slate-800 rounded-full h-3">
                      <div className={`${b.color} h-3 rounded-full transition-all`}
                        style={{ width: `${data.total_appointments ? (b.value / data.total_appointments) * 100 : 0}%` }} />
                    </div>
                    <span className="text-sm font-semibold w-8 text-right">{b.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-center text-gray-500 py-10">Click "Generate Report" to load data.</div>
      )}
    </div>
  );
}
