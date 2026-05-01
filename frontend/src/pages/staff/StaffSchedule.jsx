import { useOutletContext } from "react-router-dom";
import { doctors } from "../../data/staffData";

export default function StaffSchedule() {
  const { dark } = useOutletContext();

  const pageTitle = dark ? "text-white" : "text-gray-900";
  const muted = dark ? "text-gray-400" : "text-gray-500";
  const card = dark
    ? "bg-gray-900 border-gray-800 text-white"
    : "bg-white border-gray-200 text-gray-900";
  const subCard = dark ? "bg-gray-800 text-gray-300" : "bg-gray-50 text-gray-700";

  const displayDoctors = [
    ...doctors,
    {
      ...doctors[0],
      id: 10,
      name: "Dr. James Smith",
    },
    {
      ...doctors[1],
      id: 11,
      name: "Dr. Lia Chen",
    },
    {
      ...doctors[2],
      id: 12,
      name: "Dr. Robert Garcia",
    },
  ];

  return (
    <div>
      <h1 className={`text-2xl font-semibold ${pageTitle}`}>
        Hospital Schedule
      </h1>
      <p className={`text-sm ${muted}`}>
        View doctor availability and service information
      </p>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        {displayDoctors.map((d) => (
          <div
            key={d.id}
            className={`overflow-hidden rounded-2xl border shadow-sm ${card}`}
          >
            <div
              className={`p-5 text-white ${
                d.status === "Off-duty"
                  ? "bg-gradient-to-r from-gray-500 to-gray-700"
                  : "bg-gradient-to-r from-teal-600 to-teal-500"
              }`}
            >
              <div className="flex justify-between gap-3">
                <div>
                  <h2 className="font-semibold">{d.name}</h2>
                  <p className="text-xs opacity-90">{d.specialization}</p>
                </div>

                <span className="h-fit rounded-full bg-white/20 px-3 py-1 text-xs">
                  {d.status}
                </span>
              </div>
            </div>

            <div className="p-5">
              <div className={`rounded-xl p-3 text-sm ${subCard}`}>
                🕘 {d.schedule}
              </div>

              <h3 className="mt-4 text-sm font-semibold">Services Handled</h3>

              <ul className="mt-2 space-y-2">
                {d.services.map((s) => (
                  <li key={s.name} className="flex justify-between text-sm">
                    <span className={muted}>{s.name}</span>
                    <span className="font-medium text-teal-600">₱{s.fee}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`mt-5 w-full rounded-lg border py-2 text-sm ${
                  dark
                    ? "border-gray-700 hover:bg-gray-800"
                    : "border-gray-300 hover:bg-teal-50"
                }`}
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}