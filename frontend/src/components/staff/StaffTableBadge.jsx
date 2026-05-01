export default function StaffTableBadge({ status }) {
  const styles = {
    Confirmed: "bg-green-100 text-green-700",
    Active: "bg-green-100 text-green-700",
    Done: "bg-green-100 text-green-700",
    Waiting: "bg-yellow-100 text-yellow-700",
    Pending: "bg-yellow-100 text-yellow-700",
    "In Progress": "bg-blue-100 text-blue-700",
    Cancelled: "bg-red-100 text-red-700",
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${styles[status] || "bg-gray-100 text-gray-700"}`}>
      {status}
    </span>
  );
}