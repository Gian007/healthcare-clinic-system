import { useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { doctors, initialQueue } from "../../data/staffData";
import StaffTableBadge from "../../components/staff/StaffTableBadge";

export default function StaffQueue() {
  const { dark } = useOutletContext();

  const [queue, setQueue] = useState(initialQueue);
  const [doctorFilter, setDoctorFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");

  const pageTitle = dark ? "text-white" : "text-gray-900";
  const muted = dark ? "text-gray-400" : "text-gray-500";
  const card = dark
    ? "bg-gray-900 border-gray-800 text-white"
    : "bg-white border-gray-200 text-gray-900";
  const subCard = dark
    ? "bg-gray-800 border-gray-700 text-white"
    : "bg-teal-50 border-teal-100 text-gray-900";
  const input = dark
    ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
    : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400";
  const tableHead = dark
    ? "bg-gray-800 text-gray-300"
    : "bg-gray-50 text-gray-500";
  const divide = dark ? "divide-gray-800" : "divide-gray-100";

  function updateStatus(queueNo, nextStatus) {
    setQueue((prev) =>
      prev.map((q) => (q.queueNo === queueNo ? { ...q, status: nextStatus } : q))
    );
  }

  const filtered = queue.filter((q) => {
    const matchDoctor = doctorFilter === "All" || q.doctor === doctorFilter;
    const matchStatus = statusFilter === "All" || q.status === statusFilter;
    const matchSearch =
      q.name.toLowerCase().includes(search.toLowerCase()) ||
      q.queueNo.toLowerCase().includes(search.toLowerCase()) ||
      q.patientId.toLowerCase().includes(search.toLowerCase());

    return matchDoctor && matchStatus && matchSearch;
  });

  const queueGroups = useMemo(() => {
    return doctors.map((d) => {
      const list = queue.filter((q) => q.doctorQueue === d.queue);
      const now = list.find((q) => q.status === "In Progress");
      const next = list.filter((q) => q.status === "Waiting").slice(0, 3);

      return { ...d, list, now, next };
    });
  }, [queue]);

  return (
    <div>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className={`text-2xl font-semibold ${pageTitle}`}>
            Queue Management
          </h1>
          <p className={`text-sm ${muted}`}>Multiple doctor queue monitoring</p>
        </div>

        <Link
          to="/staff/walk-in"
          className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
        >
          Add Walk-in
        </Link>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {queueGroups.map((d) => (
          <div
            key={d.id}
            className={`overflow-hidden rounded-2xl border shadow-sm ${card}`}
          >
            <div className="bg-gradient-to-r from-teal-600 to-teal-500 p-5 text-white">
              <div className="flex justify-between">
                <div>
                  <h2 className="font-semibold">{d.name}</h2>
                  <p className="text-xs opacity-90">Queue {d.queue}</p>
                </div>

                <span className="h-fit rounded-full bg-white/20 px-3 py-1 text-xs">
                  {d.status}
                </span>
              </div>
            </div>

            <div className="p-5">
              <p className={`text-xs ${muted}`}>Now Serving</p>

              <div
                className={`mt-2 rounded-xl border p-4 text-2xl font-bold text-teal-700 ${subCard}`}
              >
                {d.now?.queueNo || "Idle"}
              </div>

              <p className={`mt-4 text-xs font-medium ${muted}`}>Next Patients</p>

              <div className="mt-2 space-y-2">
                {d.next.length ? (
                  d.next.map((p) => (
                    <div
                      key={p.queueNo}
                      className="flex justify-between gap-3 text-sm"
                    >
                      <span className="font-medium">{p.queueNo}</span>
                      <span className={muted}>{p.name}</span>
                    </div>
                  ))
                ) : (
                  <p className={`text-sm ${muted}`}>No waiting patients</p>
                )}
              </div>

              <button className="mt-4 w-full rounded-lg bg-teal-600 py-2 text-sm font-medium text-white hover:bg-teal-700">
                View Full Queue
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className={`mt-6 rounded-2xl border p-4 shadow-sm ${card}`}>
        <div className="grid gap-3 md:grid-cols-[1fr_160px_160px]">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by patient name, queue number, or patient ID..."
            className={`rounded-lg border px-4 py-2 text-sm ${input}`}
          />

          <select
            value={doctorFilter}
            onChange={(e) => setDoctorFilter(e.target.value)}
            className={`rounded-lg border px-3 py-2 text-sm ${input}`}
          >
            <option>All</option>
            {doctors.map((d) => (
              <option key={d.id}>{d.shortName}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`rounded-lg border px-3 py-2 text-sm ${input}`}
          >
            <option>All</option>
            <option>Booked</option>
            <option>Waiting</option>
            <option>In Progress</option>
            <option>Done</option>
            <option>No-show</option>
          </select>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className={tableHead}>
              <tr>
                <th className="px-4 py-3">Queue Number</th>
                <th className="px-4 py-3">Patient Name</th>
                <th className="px-4 py-3">Doctor</th>
                <th className="px-4 py-3">Check-in Time</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Est. Wait</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>

            <tbody className={`divide-y ${divide}`}>
              {filtered.map((q) => (
                <tr key={q.queueNo}>
                  <td className="px-4 py-3 font-semibold">{q.queueNo}</td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="grid h-8 w-8 place-items-center rounded-full bg-teal-100 text-xs font-bold text-teal-700">
                        {q.name[0]}
                      </div>
                      <span>{q.name}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3">{q.doctor}</td>
                  <td className="px-4 py-3">{q.checkIn}</td>
                  <td className="px-4 py-3">
                    <StaffTableBadge status={q.status} />
                  </td>
                  <td className="px-4 py-3">{q.wait}</td>

                  <td className="px-4 py-3">
                    {q.status === "Booked" && (
                      <button
                        onClick={() => updateStatus(q.queueNo, "Waiting")}
                        className="rounded-md bg-teal-600 px-3 py-1 text-xs text-white hover:bg-teal-700"
                      >
                        Check-in
                      </button>
                    )}

                    {q.status === "Waiting" && (
                      <button
                        onClick={() => updateStatus(q.queueNo, "In Progress")}
                        className="rounded-md bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"
                      >
                        Start
                      </button>
                    )}

                    {q.status === "In Progress" && (
                      <button
                        onClick={() => updateStatus(q.queueNo, "Done")}
                        className="rounded-md bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700"
                      >
                        Complete
                      </button>
                    )}

                    {q.status === "Done" && (
                      <span className={`text-xs ${muted}`}>Done</span>
                    )}
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