import { useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  BriefcaseMedical,
  CalendarCheck,
  CalendarDays,
  SearchCheck,
  ShieldCheck,
  Stethoscope,
  UserPlus,
  Users,
} from "lucide-react";
import { PageHeader, StatCard } from "../../components/admin/AdminUI";
import { useAdminSettings } from "../../state/adminSettings";
import * as adminApi from "../../api/adminApi";
import { Link } from "react-router-dom";

function SkeletonRow() {
  return (
    <tr>
      {[1, 2, 3, 4].map((i) => (
        <td key={i} className="py-3">
          <div className="h-4 animate-pulse rounded bg-gray-200 dark:bg-slate-700" />
        </td>
      ))}
    </tr>
  );
}

export default function AdminDashboard() {
  const { settings } = useAdminSettings();
  const widgets = settings.features.dashboardWidgets;
  const menuItems = settings.features.menuItems;
  const [data, setData] = useState({
    stats: { total_patients: 0, total_doctors: 0, total_staff: 0, appointments_today: 0, pending_verifications: 0, active_appointments: 0 },
    recent_patients: [],
    recent_appointments: [],
  });
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const res = await adminApi.getDashboard();
      setData(res);
    } catch (error) {
      console.error("Failed to load admin dashboard:", error);
    }
  };

  useEffect(() => {
    loadData().finally(() => setLoading(false));

    const interval = setInterval(() => {
      loadData();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const { stats, recent_patients, recent_appointments } = data;

  const statusBadge = {
    Pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    Confirmed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    Cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    Completed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  };

  const statCards = [
    { key: "totalPatients", to: "/admin/patients", title: "Total Patients", value: stats.total_patients, sub: "registered patient accounts", icon: Users },
    { key: "totalDoctors", to: "/admin/doctors", title: "Total Doctors", value: stats.total_doctors, sub: "registered doctors", icon: Stethoscope },
    { key: "totalStaff", to: "/admin/staff", title: "Total Staff", value: stats.total_staff, sub: "registered staff members", icon: Users },
    { key: "appointmentsToday", to: "/admin/patients", title: "Appointments Today", value: stats.appointments_today, sub: "all bookings today", icon: CalendarCheck },
    { key: "pendingVerifications", to: "/admin/patients", title: "Pending Verifications", value: stats.pending_verifications, sub: "ID reviews needed", icon: ShieldCheck },
    { key: "activeAppointments", to: "/admin/patients", title: "Active Appointments", value: stats.active_appointments, sub: "Pending + Confirmed", icon: Activity },
  ].filter((card) => widgets[card.key]);

  const quickActions = [
    { menuKey: "doctors", to: "/admin/doctors", label: "Add New Doctor", sub: "Create a doctor account", icon: UserPlus },
    { menuKey: "staff", to: "/admin/staff", label: "Add Staff Member", sub: "Manage staff accounts", icon: Users },
    { menuKey: "services", to: "/admin/services", label: "Manage Services", sub: "Add or edit clinic services", icon: BriefcaseMedical },
    { menuKey: "schedules", to: "/admin/schedules", label: "Manage Schedules", sub: "Set doctor availability", icon: CalendarDays },
    { menuKey: "patients", to: "/admin/patients", label: "Verify Patient IDs", sub: `${stats.pending_verifications} pending`, icon: SearchCheck },
    { menuKey: "reports", to: "/admin/reports", label: "View Reports", sub: "Analytics and statistics", icon: BarChart3 },
  ].filter((action) => menuItems[action.menuKey] !== false);

  const showRecentPatients = widgets.recentPatients;
  const showQuickActions = widgets.quickActions && quickActions.length > 0;
  const showRecentAppointments = widgets.recentAppointments;

  return (
    <div>
      <PageHeader title="Dashboard" subtitle={`Admin overview - ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`} />

      {statCards.length > 0 && (
        <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {statCards.map((card) => (
            <StatCard
              key={card.key}
              to={card.to}
              title={card.title}
              value={loading ? "-" : card.value}
              sub={card.sub}
              icon={card.icon}
            />
          ))}
        </div>
      )}

      {(showRecentPatients || showQuickActions) && (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          {showRecentPatients && (
            <div className={`${showQuickActions ? "xl:col-span-2" : "xl:col-span-3"} rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900`}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold">Recently Registered Patients</h2>
                {menuItems.patients !== false && <Link to="/admin/patients" className="text-sm text-teal-600 hover:underline">View All</Link>}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px] text-sm">
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
                      [1, 2, 3].map((i) => <SkeletonRow key={i} />)
                    ) : recent_patients.length === 0 ? (
                      <tr><td colSpan="4" className="py-8 text-center text-slate-500">No patients registered yet.</td></tr>
                    ) : (
                      recent_patients.map((patient) => (
                        <tr key={patient.patient_id} className="border-t border-slate-100 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
                          <td className="py-3 pr-4 font-semibold text-teal-700 dark:text-teal-400">{patient.patient_number}</td>
                          <td className="pr-4">{patient.first_name} {patient.last_name}</td>
                          <td className="pr-4">
                            <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                              patient.verification_status === "Approved" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                              patient.verification_status === "Rejected" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                              patient.verification_status === "Under Review" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                              "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                            }`}>
                              {patient.verification_status}
                            </span>
                          </td>
                          <td className="text-slate-500">{new Date(patient.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {showQuickActions && (
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-4 text-lg font-bold">Quick Actions</h2>
              <div className="space-y-3">
                {quickActions.map((action) => {
                  const Icon = action.icon;

                  return (
                    <Link key={action.to} to={action.to} className="group flex items-center justify-between rounded-xl bg-slate-50 p-3.5 transition hover:bg-teal-50 dark:bg-slate-800 dark:hover:bg-teal-900/20">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
                          <Icon size={18} />
                        </span>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{action.label}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{action.sub}</p>
                        </div>
                      </div>
                      <ArrowRight size={16} className="text-gray-400 transition group-hover:text-primary" />
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {showRecentAppointments && (
        <div className="mt-5 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">Recent Appointments</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
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
                  [1, 2, 3].map((i) => <SkeletonRow key={i} />)
                ) : recent_appointments?.length === 0 ? (
                  <tr><td colSpan="5" className="py-8 text-center text-slate-500">No appointments yet.</td></tr>
                ) : (
                  recent_appointments?.map((appointment) => (
                    <tr key={appointment.appointment_id} className="border-t border-slate-100 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
                      <td className="py-3 pr-4 font-medium">{appointment.patient?.first_name} {appointment.patient?.last_name}</td>
                      <td className="pr-4">Dr. {appointment.doctor?.first_name} {appointment.doctor?.last_name}</td>
                      <td className="pr-4 text-slate-500">{appointment.service?.service_name}</td>
                      <td className="pr-4 text-slate-500">{appointment.appointment_date}</td>
                      <td>
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusBadge[appointment.booking_status] || statusBadge.Pending}`}>
                          {appointment.booking_status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
