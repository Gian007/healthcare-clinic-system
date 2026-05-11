import { useEffect, useState } from "react";
import { Activity, CalendarCheck, Stethoscope, Users } from "lucide-react";
import { Badge, PageHeader, StatCard } from "../../components/admin/AdminUI";
import * as adminApi from "../../api/adminApi";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const [data, setData] = useState({
    stats: { total_patients: 0, total_doctors: 0, total_staff: 0, appointments_today: 0 },
    recent_patients: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await adminApi.getDashboardData();
        setData(res);
      } catch (error) {
        console.error("Failed to load admin dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return <div className="p-10 text-center">Loading dashboard...</div>;
  }

  const { stats, recent_patients } = data;

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Clinic overview, queue activity, and today’s appointment summary" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard to="/admin/patients" title="Total Patients" value={stats.total_patients} sub="registered patient accounts" icon={Users}/>
        <StatCard to="/admin/doctors" title="Total Doctors" value={stats.total_doctors} sub="registered doctors" icon={Stethoscope}/>
        <StatCard to="/admin/staff" title="Total Staff" value={stats.total_staff} sub="registered staff members" icon={Users}/>
        <StatCard to="/admin/schedules" title="Appointments Today" value={stats.appointments_today} sub="online and walk-in bookings" icon={CalendarCheck}/>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mt-6">
        <div className="xl:col-span-2 rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg">Recently Registered Patients</h2>
            <Link to="/admin/patients" className="text-sm text-teal-600 hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-500 dark:text-slate-400">
                <tr><th className="py-3">Patient No.</th><th>Name</th><th>Email</th><th>Registered At</th></tr>
              </thead>
              <tbody>
                {recent_patients.length === 0 ? (
                  <tr><td colSpan="4" className="py-8 text-center text-slate-500">No recent patients.</td></tr>
                ) : (
                  recent_patients.map(p => (
                    <tr key={p.patient_id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 transition-colors">
                      <td className="py-3 font-semibold">{p.patient_number}</td>
                      <td>{p.first_name} {p.last_name}</td>
                      <td>{p.email}</td>
                      <td className="text-slate-500">{new Date(p.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-sm border border-slate-100 dark:border-slate-800">
          <h2 className="font-bold text-lg mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/admin/doctors" className="block rounded-xl bg-teal-50 dark:bg-teal-900/30 p-4 hover:ring-2 hover:ring-teal-300 transition-shadow">Manage doctors</Link>
            <Link to="/admin/patients" className="block rounded-xl bg-teal-50 dark:bg-teal-900/30 p-4 hover:ring-2 hover:ring-teal-300 transition-shadow">Review patient accounts</Link>
            <Link to="/admin/notifications" className="block rounded-xl bg-teal-50 dark:bg-teal-900/30 p-4 hover:ring-2 hover:ring-teal-300 transition-shadow">Edit notification templates</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
