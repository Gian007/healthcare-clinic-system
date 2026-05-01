import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { initialQueue } from "../../data/staffData";
import StaffTableBadge from "../../components/staff/StaffTableBadge";

export default function StaffScan() {
  const { dark } = useOutletContext();

  const [code, setCode] = useState("");
  const [patient, setPatient] = useState(null);
  const [error, setError] = useState("");
  const [recent, setRecent] = useState(initialQueue.slice(0, 3));

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

  function scanPatient() {
    const found = initialQueue.find(
      (p) =>
        p.queueNo.toLowerCase() === code.toLowerCase() ||
        p.patientId.toLowerCase() === code.toLowerCase()
    );

    if (!found) {
      setPatient(null);
      setError("Invalid code. Try A001, B001, C001, or P001.");
      return;
    }

    setError("");
    setPatient(found);
    setRecent((prev) =>
      [found, ...prev.filter((x) => x.queueNo !== found.queueNo)].slice(0, 4)
    );
  }

  function nextAction() {
    if (!patient) return;

    const next =
      patient.status === "Booked"
        ? "Waiting"
        : patient.status === "Waiting"
        ? "In Progress"
        : patient.status === "In Progress"
        ? "Done"
        : "Done";

    setPatient({ ...patient, status: next });
  }

  const actionText =
    patient?.status === "Booked"
      ? "Check-in Patient"
      : patient?.status === "Waiting"
      ? "Start Consultation"
      : patient?.status === "In Progress"
      ? "Mark as Done"
      : "Already Done";

  return (
    <div>
      <h1 className={`text-2xl font-semibold ${pageTitle}`}>Scan Patient</h1>
      <p className={`text-sm ${muted}`}>
        Enter or scan patient code to retrieve information
      </p>

      <div className="mx-auto mt-6 max-w-2xl space-y-5">
        <div className={`rounded-2xl border p-6 text-center shadow-sm ${card}`}>
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-teal-600 text-2xl text-white">
            #
          </div>

          <h2 className="mt-3 font-semibold">Scan Patient</h2>
          <p className={`text-sm ${muted}`}>Try: A001, B001, C001, P001</p>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && scanPatient()}
              placeholder="Enter patient code like A001 or P001"
              className={`w-full rounded-lg border px-4 py-2 text-sm ${input}`}
            />

            <button
              onClick={scanPatient}
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
            >
              Scan / Search
            </button>
          </div>

          <button
            disabled
            className={`mt-3 w-full rounded-lg border px-4 py-2 text-sm ${
              dark
                ? "border-gray-700 text-gray-500"
                : "border-gray-300 text-gray-400"
            }`}
          >
            Use Camera QR Scanner — Coming Soon
          </button>

          {error && (
            <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>

        {patient && (
          <div className={`rounded-2xl border p-5 shadow-sm ${card}`}>
            <div className="flex items-center gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-teal-100 text-xl font-bold text-teal-700">
                {patient.name[0]}
              </div>

              <div>
                <h3 className="text-lg font-semibold">{patient.name}</h3>
                <p className={`text-sm ${muted}`}>
                  {patient.patientId} • {patient.queueNo}
                </p>
              </div>

              <div className="ml-auto">
                <StaffTableBadge status={patient.status} />
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Info dark={dark} label="Doctor" value={patient.doctor} />
              <Info dark={dark} label="Service" value={patient.service} />
              <Info dark={dark} label="Appointment Time" value={patient.checkIn} />
              <Info dark={dark} label="Estimated Wait" value={patient.wait} />
            </div>

            <button
              onClick={nextAction}
              disabled={patient.status === "Done"}
              className="mt-5 w-full rounded-lg bg-teal-600 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:bg-gray-300"
            >
              {actionText}
            </button>
          </div>
        )}

        <div className={`rounded-2xl border p-5 shadow-sm ${card}`}>
          <h3 className="font-semibold">Recent Scanned Patients</h3>

          <div className="mt-3 space-y-3">
            {recent.map((p) => (
              <button
                key={p.queueNo}
                onClick={() => {
                  setCode(p.queueNo);
                  setPatient(p);
                  setError("");
                }}
                className={`flex w-full items-center justify-between rounded-xl border p-3 text-left ${subCard}`}
              >
                <div>
                  <p className="font-medium">
                    {p.queueNo} - {p.name}
                  </p>
                  <p className={`text-xs ${muted}`}>{p.service}</p>
                </div>
                <span className={`text-xs ${muted}`}>recent</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ dark, label, value }) {
  return (
    <div
      className={`rounded-xl p-3 ${
        dark ? "bg-gray-800" : "bg-gray-50"
      }`}
    >
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}