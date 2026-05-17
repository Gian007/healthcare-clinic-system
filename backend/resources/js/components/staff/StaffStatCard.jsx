export default function StaffStatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <h3 className="mt-2 text-2xl font-semibold text-gray-900">{value}</h3>
    </div>
  );
}