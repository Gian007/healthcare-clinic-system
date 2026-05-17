import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { patients, doctors } from "../../data/staffData";

export default function StaffWalkIn() {
  const { dark } = useOutletContext();

  const [search, setSearch] = useState("");
  const [foundPatient, setFoundPatient] = useState(null);

  const pageTitle = dark ? "text-white" : "text-gray-900";
  const muted = dark ? "text-gray-400" : "text-gray-500";
  const card = dark
    ? "bg-gray-900 border-gray-800 text-white"
    : "bg-white border-gray-200 text-gray-900";
  const input = dark
    ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
    : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400";

  function handleSearch() {
    const found = patients.find(
      (p) =>
        p.id.toLowerCase() === search.toLowerCase() ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.phone.includes(search)
    );

    setFoundPatient(found || null);
  }

  return (
    <div>
      <h1 className={`text-2xl font-semibold ${pageTitle}`}>Walk-in Registration</h1>
      <p className={`text-sm ${muted}`}>
        Register walk-in patient and add them to queue
      </p>

      <div className={`mt-6 max-w-3xl rounded-2xl border p-6 shadow-sm ${card}`}>
        <div className="mb-6">
          <h2 className="font-semibold">Search Existing Patient</h2>

          <div className="mt-3 flex gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by patient ID, name, or contact number"
              className={`w-full rounded-lg border px-4 py-2 text-sm ${input}`}
            />
            <button
              onClick={handleSearch}
              type="button"
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
            >
              Search
            </button>
          </div>

          {foundPatient && (
            <div className="mt-3 rounded-lg bg-teal-50 p-3 text-sm text-teal-700">
              Found: {foundPatient.name} — {foundPatient.id}
            </div>
          )}

          {!foundPatient && search && (
            <p className={`mt-2 text-xs ${muted}`}>No patient selected yet.</p>
          )}
        </div>

        <form>
          <h2 className="font-semibold">Patient Information</h2>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <input
              defaultValue={foundPatient?.name || ""}
              className={`rounded-lg border px-4 py-2 text-sm ${input}`}
              placeholder="Full name"
            />

            <input
              defaultValue={foundPatient?.phone || ""}
              className={`rounded-lg border px-4 py-2 text-sm ${input}`}
              placeholder="Phone number"
            />

            <select className={`rounded-lg border px-4 py-2 text-sm ${input}`}>
              <option>Gender</option>
              <option>Male</option>
              <option>Female</option>
            </select>

            <input
              type="date"
              className={`rounded-lg border px-4 py-2 text-sm ${input}`}
            />

            <input
              className={`rounded-lg border px-4 py-2 text-sm md:col-span-2 ${input}`}
              placeholder="Address"
            />
          </div>

          <h2 className="mt-6 font-semibold">Appointment Details</h2>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <select className={`rounded-lg border px-4 py-2 text-sm ${input}`}>
              <option>Select service</option>
              <option>General Consultation</option>
              <option>Follow-up Check</option>
              <option>Vaccination</option>
              <option>Annual Physical</option>
            </select>

            <select className={`rounded-lg border px-4 py-2 text-sm ${input}`}>
              <option>Select doctor</option>
              {doctors.map((d) => (
                <option key={d.id}>{d.shortName}</option>
              ))}
            </select>

            <textarea
              className={`min-h-28 rounded-lg border px-4 py-2 text-sm md:col-span-2 ${input}`}
              placeholder="Brief description of symptoms or reason for visit"
            />
          </div>

          <div className="mt-6 flex flex-col justify-end gap-3 sm:flex-row">
            <button
              type="button"
              className={`rounded-lg border px-4 py-2 text-sm ${
                dark ? "border-gray-700 hover:bg-gray-800" : "border-gray-300 hover:bg-gray-50"
              }`}
            >
              Patient History
            </button>

            <button
              type="button"
              className={`rounded-lg border px-4 py-2 text-sm ${
                dark ? "border-gray-700 hover:bg-gray-800" : "border-gray-300 hover:bg-gray-50"
              }`}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
            >
              Register & Add to Queue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}