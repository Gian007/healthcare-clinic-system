import { Link, useOutletContext } from "react-router-dom";
import { notifications } from "../../data/staffData";

export default function StaffNotifications() {
  const { dark } = useOutletContext();

  const pageTitle = dark ? "text-white" : "text-gray-900";
  const muted = dark ? "text-gray-400" : "text-gray-500";
  const card = dark
    ? "bg-gray-900 border-gray-800 text-white"
    : "bg-white border-gray-200 text-gray-900";
  const itemCard = dark
    ? "bg-gray-950 border-gray-800 hover:bg-gray-800"
    : "bg-white border-gray-200 hover:bg-teal-50";

  const iconByType = {
    appointment: "📅",
    cancel: "❌",
    queue: "⚠️",
    checkin: "✅",
  };

  return (
    <div>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className={`text-2xl font-semibold ${pageTitle}`}>Notifications</h1>
          <p className={`text-sm ${muted}`}>Recent system and clinic alerts</p>
        </div>

        <button className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
          Mark all as read
        </button>
      </div>

      <div className={`mt-6 max-w-5xl rounded-2xl border p-5 shadow-sm ${card}`}>
        <div className="space-y-4">
          {notifications.map((n) => (
            <div
              key={`${n.title}-${n.time}`}
              className={`rounded-2xl border p-4 transition ${itemCard}`}
            >
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div className="flex gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-teal-100 text-lg">
                    {iconByType[n.type] || "🔔"}
                  </div>

                  <div>
                    <h3 className="font-semibold">{n.title}</h3>
                    <p className={`mt-1 text-sm ${muted}`}>{n.message}</p>

                    <div className="mt-3 flex gap-2">
                      <Link
                        to={n.link}
                        className="rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-700"
                      >
                        Open Related Page
                      </Link>

                      <button
                        className={`rounded-lg border px-3 py-1.5 text-xs ${
                          dark
                            ? "border-gray-700 hover:bg-gray-800"
                            : "border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        Mark as Read
                      </button>
                    </div>
                  </div>
                </div>

                <span className={`text-xs ${muted}`}>{n.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}