import { Link, useOutletContext } from "react-router-dom";
import { activities, initialQueue, appointments } from "../../data/staffData";
import StaffTableBadge from "../../components/staff/StaffTableBadge";

export default function StaffDashboard() {
  const { dark } = useOutletContext();

  const card = dark
    ? "border-gray-800 bg-gray-900 text-white"
    : "border-gray-200 bg-white text-gray-900";

  const miniCard = dark
    ? "border-gray-800 bg-gray-950 text-white hover:bg-gray-800"
    : "border-gray-200 bg-white text-gray-900 hover:bg-teal-50";

  const muted = dark ? "text-gray-400" : "text-gray-500";

  const stats = [
    { label: "Total Patients Today", value: 48, sub: "+12%", icon: "👥" },
    { label: "Active Queue Count", value: initialQueue.length, sub: "3 waiting", icon: "⏱️" },
    { label: "Upcoming Appointments", value: appointments.length, sub: "Next: 2:30 PM", icon: "📅" },
    { label: "Average Waiting Time", value: "18 min", sub: "-2 min", icon: "📈" },
  ];

  const quickLinks = [
    {
      title: "Manage Queue",
      desc: "View and manage current queue status",
      path: "/staff/queue",
      icon: "📋",
    },
    {
      title: "Register Walk-in",
      desc: "Add new walk-in patient to queue",
      path: "/staff/walk-in",
      icon: "🚶",
    },
    {
      title: "View Appointments",
      desc: "Check today's appointment schedule",
      path: "/staff/appointments",
      icon: "📅",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-2xl font-semibold ${dark ? "text-white" : "text-gray-900"}`}>
          Dashboard
        </h1>
        <p className={`text-sm ${muted}`}>Clinic front desk overview</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-2xl border p-5 shadow-sm ${card}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className={`text-sm ${muted}`}>{stat.label}</p>
                <h2 className="mt-3 text-3xl font-bold">{stat.value}</h2>
                <p className="mt-2 text-xs font-medium text-teal-600">
                  {stat.sub}
                </p>
              </div>

              <div className="grid h-11 w-11 place-items-center rounded-full bg-teal-100 text-lg">
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <section className={`rounded-2xl border p-5 shadow-sm ${card}`}>
        <h2 className="font-semibold">Quick Access</h2>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {quickLinks.map((item) => (
            <Link
              key={item.title}
              to={item.path}
              className={`rounded-2xl border p-5 transition hover:border-teal-500 ${miniCard}`}
            >
              <div className="grid h-12 w-12 place-items-center rounded-full bg-teal-100 text-xl">
                {item.icon}
              </div>

              <h3 className="mt-6 font-semibold">{item.title}</h3>
              <p className={`mt-1 text-sm ${muted}`}>{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className={`rounded-2xl border p-5 shadow-sm ${card}`}>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Recent Activity</h2>

          <Link
            to="/staff/notifications"
            className="text-sm font-medium text-teal-600"
          >
            View All
          </Link>
        </div>

        <div className={`mt-4 divide-y ${dark ? "divide-gray-800" : "divide-gray-100"}`}>
          {activities.map((a) => (
            <div
              key={`${a.time}-${a.title}`}
              className="flex items-center justify-between gap-4 py-4"
            >
              <div>
                <p className="text-sm font-semibold">{a.title}</p>
                <p className={`text-xs ${muted}`}>{a.name}</p>
              </div>

              <div className="flex items-center gap-3">
                <p className="hidden text-xs text-gray-400 sm:block">
                  {a.time}
                </p>
                <StaffTableBadge status={a.status} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}