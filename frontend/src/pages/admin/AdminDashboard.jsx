import { useEffect, useState } from "react";
import { Activity, CalendarCheck, Stethoscope, Users, ShieldCheck, AlertCircle } from "lucide-react";
import { Badge, PageHeader, StatCard } from "../../components/admin/AdminUI";
import * as adminApi from "../../api/adminApi";
import { Link } from "react-router-dom";

function SkeletonRow() {
  return (
    <tr>
      {[1,2,3,4].map(i => (
        <td key={i} className="py-3"><div className="h-4 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" /></td>
      ))}
    </tr>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState({
    stats: { total_patients: 0, total_doctors: 0, total_staff: 0, appointments_today: 0, pending_verifications: 0, active_appointments: 0 },
    recent_patients: [],
    recent_appointments: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getDashboard()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const { stats, recent_patients, recent_appointments } = data;

  const STATUS_BADGE = {
    Pending:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    Confirmed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    Cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    Completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  };

  return (
    <div>
      <PageHeader title="Dashboard" subtitle={`Admin overview • ${new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}`} />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-6">
        <StatCard to="/admin/patients"  title="Total Patients"          value={loading ? '—' : stats.total_patients}         sub="registered patient accounts"   icon={Users}       />
        <StatCard to="/admin/doctors"   title="Total Doctors"           value={loading ? '—' : stats.total_doctors}          sub="registered doctors"             icon={Stethoscope} />
        <StatCard to="/admin/staff"     title="Total Staff"             value={loading ? '—' : stats.total_staff}            sub="registered staff members"       icon={Users}       />
        <StatCard to="/admin/patients"  title="Appointments Today"      value={loading ? '—' : stats.appointments_today}     sub="all bookings today"             icon={CalendarCheck}/>
        <StatCard to="/admin/patients"  title="Pending Verifications"   value={loading ? '—' : stats.pending_verifications}  sub="ID reviews needed"             icon={ShieldCheck}  />
        <StatCard to="/admin/patients"  title="Active Appointments"     value={loading ? '—' : stats.active_appointments}    sub="Pending + Confirmed"           icon={Activity}     />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Recent Patients */}
        <div className="xl:col-span-2 rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg">Recently Registered Patients</h2>
            <Link to="/admin/patients" className="text-sm text-teal-600 hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
              <thead className="text-left text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-3 pr-4">Patient No.</th>
                  <th className="pr-4">Name</th>
                  <th className="pr-4">Verification</th>
                  <th>Registered</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [1,2,3].map(i => <SkeletonRow key={i} />)
                ) : recent_patients.length === 0 ? (
                  <tr><td colSpan="4" className="py-8 text-center text-slate-500">No patients registered yet.</td></tr>
                ) : (
                  recent_patients.map(p => (
                    <tr key={p.patient_id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 pr-4 font-semibold text-teal-700 dark:text-teal-400">{p.patient_number}</td>
                      <td className="pr-4">{p.first_name} {p.last_name}</td>
                      <td className="pr-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          p.verification_status === 'Approved'    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          p.verification_status === 'Rejected'    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          p.verification_status === 'Under Review'? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                                   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {p.verification_status}
                        </span>
                      </td>
                      <td className="text-slate-500">{new Date(p.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-sm border border-slate-100 dark:border-slate-800">
          <h2 className="font-bold text-lg mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {[
              { to: '/admin/doctors',       label: '👨‍⚕️ Add New Doctor',       sub: 'Create a doctor account' },
              { to: '/admin/staff',         label: '👤 Add Staff Member',        sub: 'Manage staff accounts' },
              { to: '/admin/services',      label: '🩺 Manage Services',         sub: 'Add or edit clinic services' },
              { to: '/admin/schedules',     label: '📅 Manage Schedules',        sub: 'Set doctor availability' },
              { to: '/admin/patients',      label: '🔍 Verify Patient IDs',      sub: `${stats.pending_verifications} pending` },
              { to: '/admin/reports',       label: '📊 View Reports',            sub: 'Analytics & statistics' },
            ].map(a => (
              <Link key={a.to} to={a.to} className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-900/20 p-3.5 transition group">
                <div>
                  <p className="font-medium text-sm text-gray-900 dark:text-white">{a.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{a.sub}</p>
                </div>
                <span className="text-gray-400 group-hover:text-primary transition">→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Appointments */}
      <div className="mt-5 rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg">Recent Appointments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="text-left text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-3 pr-4">Patient</th>
                <th className="pr-4">Doctor</th>
                <th className="pr-4">Service</th>
                <th className="pr-4">Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1,2,3].map(i => <SkeletonRow key={i} />)
              ) : recent_appointments?.length === 0 ? (
                <tr><td colSpan="5" className="py-8 text-center text-slate-500">No appointments yet.</td></tr>
              ) : (
                recent_appointments?.map(a => (
                  <tr key={a.appointment_id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 pr-4 font-medium">{a.patient?.first_name} {a.patient?.last_name}</td>
                    <td className="pr-4">Dr. {a.doctor?.first_name} {a.doctor?.last_name}</td>
                    <td className="pr-4 text-slate-500">{a.service?.service_name}</td>
                    <td className="pr-4 text-slate-500">{a.appointment_date}</td>
                    <td>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_BADGE[a.booking_status] || STATUS_BADGE.Pending}`}>
                        {a.booking_status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
