import { FaInfoCircle, FaBullhorn, FaExclamationCircle } from "react-icons/fa";

function typeConfig(type) {
  if (type === "Update")
    return { badge: "bg-green-100 text-green-700", iconBg: "bg-green-500", Icon: FaBullhorn, label: "Update" };
  if (type === "Alert")
    return { badge: "bg-red-100 text-red-700", iconBg: "bg-red-500", Icon: FaExclamationCircle, label: "Alert" };
  return { badge: "bg-blue-100 text-blue-700", iconBg: "bg-primary", Icon: FaInfoCircle, label: "Info" };
}

export default function AnnouncementCard({ item }) {
  const cfg = typeConfig(item.type);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-5 flex items-start justify-between gap-4 transition-colors">
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-full ${cfg.iconBg} text-white flex items-center justify-center shrink-0`}>
          <cfg.Icon />
        </div>
        <div>
          <div className="font-semibold text-gray-900 dark:text-white">{item.title}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.body}</div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-3">{item.date}</div>
        </div>
      </div>

      <span className={`text-xs px-2 py-1 rounded-full font-medium ${cfg.badge}`}>
        {cfg.label}
      </span>
    </div>
  );
}
