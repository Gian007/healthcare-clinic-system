import { useOutletContext } from "react-router-dom";
import { patients } from "../../data/staffData";
import StaffTableBadge from "../../components/staff/StaffTableBadge";

export default function StaffPatients() {
  const { dark } = useOutletContext();

  const pageTitle = dark ? "text-white" : "text-gray-900";
  const muted = dark ? "text-gray-400" : "text-gray-500";
  const card = dark
    ? "bg-gray-900 border-gray-800 text-white"
    : "bg-white border-gray-200 text-gray-900";
  const input = dark
    ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
    : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400";
  const tableHead = dark ? "bg-gray-800 text-gray-300" : "bg-gray-50 text-gray-500";
  const divide = dark ? "divide-gray-800" : "divide-gray-100";

  return (
    <div>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className={`text-2xl font-semibold ${pageTitle}`}>Patients</h1>
          <p className={`text-sm ${muted}`}>Manage patient records</p>
        </div>

        <button className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">
          Add Patient
        </button>
      </div>

      <div className={`mt-6 rounded-2xl border p-4 shadow-sm ${card}`}>
        <input
          placeholder="Search by patient ID, name, or phone number..."
          className={`mb-4 w-full rounded-lg border px-4 py-2 text-sm ${input}`}
        />

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className={tableHead}>
              <tr>
                <th className="px-4 py-3">Patient ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Age</th>
                <th className="px-4 py-3">Gender</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Last Visit</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>

            <tbody className={`divide-y ${divide}`}>
              {patients.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-medium">{p.id}</td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="grid h-8 w-8 place-items-center rounded-full bg-teal-100 text-xs font-bold text-teal-700">
                        {p.name[0]}
                      </div>
                      {p.name}
                    </div>
                  </td>

                  <td className="px-4 py-3">{p.age}</td>
                  <td className="px-4 py-3">{p.gender}</td>
                  <td className="px-4 py-3">{p.phone}</td>
                  <td className="px-4 py-3">{p.lastVisit}</td>

                  <td className="px-4 py-3">
                    <StaffTableBadge status={p.status} />
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button className="text-xs font-medium text-teal-600 hover:underline">
                        View
                      </button>
                      <button className="text-xs font-medium text-gray-500 hover:underline">
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}