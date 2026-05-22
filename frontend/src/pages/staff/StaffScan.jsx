import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import StaffTableBadge from "../../components/staff/StaffTableBadge";
import * as staffApi from "../../api/staffApi";

export default function StaffScan() {
  const { dark } = useOutletContext();

  const [query, setQuery] = useState("");
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [selectedAppt, setSelectedAppt] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [patientData, appointmentData] = await Promise.all([
        staffApi.getPatients(),
        staffApi.getAppointments(),
      ]);
      setPatients(patientData || []);
      setAppointments(appointmentData || []);
    } catch (e) {
      console.error("Failed to load patient history data:", e);
      setError("Failed to connect to clinic database.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    if (!confirm(`Are you sure you want to mark this appointment as ${status}?`)) return;
    try {
      setActionLoading(true);
      await staffApi.updateAppointmentStatus(id, { booking_status: status });
      setAppointments(prev => prev.map(a => a.appointment_id === id ? { ...a, booking_status: status } : a));
      if (selectedAppt && selectedAppt.appointment_id === id) {
        setSelectedAppt({ ...selectedAppt, booking_status: status });
      }
    } catch (err) {
      alert("Failed to update status: " + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const normalizedQuery = query.trim().toLowerCase();

  const matches = useMemo(() => {
    if (!normalizedQuery) return [];

    return patients
      .filter((p) => patientMatches(p, normalizedQuery))
      .slice(0, 8);
  }, [patients, normalizedQuery]);

  const history = useMemo(() => {
    if (!selectedPatient) return [];

    return appointments
      .filter((a) => String(a.patient_id) === String(selectedPatient.patient_id))
      .sort((a, b) => {
        const left = `${b.appointment_date || ""} ${b.start_time || ""}`;
        const right = `${a.appointment_date || ""} ${a.start_time || ""}`;
        return left.localeCompare(right);
      });
  }, [appointments, selectedPatient]);

  const searchPatient = () => {
    if (!normalizedQuery) {
      setError("Enter a patient name or patient ID.");
      setSelectedPatient(null);
      return;
    }

    const exact = patients.find((p) => patientExactMatch(p, normalizedQuery));
    const found = exact || matches[0];

    if (!found) {
      setError("No patient found. Try the patient name, patient number, or numeric patient ID.");
      setSelectedPatient(null);
      return;
    }

    setSelectedPatient(found);
    setError("");
  };

  const choosePatient = (patient) => {
    setSelectedPatient(patient);
    setQuery(patient.patient_number || `${patient.first_name || ""} ${patient.last_name || ""}`.trim());
    setError("");
  };

  const pageTitle = dark ? "text-white" : "text-gray-900";
  const muted = dark ? "text-gray-400" : "text-gray-500";
  const card = dark
    ? "bg-gray-900 border-gray-800 text-white"
    : "bg-white border-gray-200 text-gray-900";
  const input = dark
    ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
    : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400";
  const row = dark
    ? "border-gray-800 hover:bg-gray-800/60"
    : "border-gray-100 hover:bg-teal-50/70";

  return (
    <div>
      <h1 className={`text-2xl font-semibold ${pageTitle}`}>Patient History</h1>
      <p className={`text-sm ${muted}`}>
        Search using the patient name, patient number, or numeric patient ID.
      </p>

      <div className="mt-6 grid gap-5 xl:grid-cols-[420px_1fr]">
        <div className={`rounded-2xl border p-5 shadow-sm ${card}`}>
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-teal-600 text-xl font-bold text-white">
              H
            </div>
            <div>
              <h2 className="font-semibold">Find Patient</h2>
              <p className={`text-xs ${muted}`}>Fast lookup by name or ID</p>
            </div>
          </div>

          <div className="mt-5 flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchPatient()}
              placeholder="Example: Juan Dela Cruz, PAT-0001, or 12"
              className={`w-full rounded-lg border px-4 py-2 text-sm ${input}`}
              autoFocus
            />
            <button
              onClick={searchPatient}
              className="shrink-0 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
            >
              Search
            </button>
          </div>

          {error && (
            <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/20 dark:text-red-400">
              {error}
            </p>
          )}

          <div className="mt-5">
            <h3 className="text-sm font-semibold">Quick Results</h3>
            <div className="mt-2 overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800">
              {loading ? (
                <p className={`p-4 text-sm ${muted}`}>Loading patients...</p>
              ) : matches.length === 0 ? (
                <p className={`p-4 text-sm ${muted}`}>
                  {normalizedQuery ? "No matching patients." : "Start typing to find a patient."}
                </p>
              ) : (
                matches.map((p) => (
                  <button
                    key={p.patient_id}
                    onClick={() => choosePatient(p)}
                    className={`flex w-full items-center justify-between border-b px-4 py-3 text-left last:border-b-0 ${row}`}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{fullName(p)}</p>
                      <p className={`truncate text-xs ${muted}`}>
                        {p.patient_number || `ID ${p.patient_id}`} - {p.contact_number || "No contact"}
                      </p>
                    </div>
                    <span className={`ml-3 shrink-0 text-xs ${muted}`}>View</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <div className={`rounded-2xl border p-5 shadow-sm ${card}`}>
          {!selectedPatient ? (
            <div className="grid min-h-[360px] place-items-center text-center">
              <div>
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-teal-100 text-2xl font-bold text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
                  #
                </div>
                <h2 className="mt-3 text-lg font-semibold">No Patient Selected</h2>
                <p className={`mt-1 text-sm ${muted}`}>Search and select a patient to view history.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 dark:border-gray-800 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-teal-100 text-xl font-bold text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
                    {initials(selectedPatient)}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{fullName(selectedPatient)}</h2>
                    <p className={`text-sm ${muted}`}>
                      {selectedPatient.patient_number || `ID ${selectedPatient.patient_id}`} - {selectedPatient.email || "No email"}
                    </p>
                  </div>
                </div>
                <StaffTableBadge status={selectedPatient.account_status || "Active"} />
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <Info dark={dark} label="Patient ID" value={selectedPatient.patient_id} />
                <Info dark={dark} label="Patient No." value={selectedPatient.patient_number || "N/A"} />
                <Info dark={dark} label="Contact" value={selectedPatient.contact_number || "N/A"} />
                <Info dark={dark} label="Verification" value={selectedPatient.verification_status || "N/A"} />
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold">Appointment History</h3>
                  <span className={`text-xs ${muted}`}>{history.length} record(s)</span>
                </div>

                <div className="mt-3 overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800">
                  {history.length === 0 ? (
                    <p className={`p-4 text-sm ${muted}`}>No appointment history found for this patient.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[760px] text-left text-sm">
                        <thead className={dark ? "bg-gray-800 text-gray-300" : "bg-gray-50 text-gray-600"}>
                          <tr>
                            <th className="px-4 py-3 font-semibold">Date</th>
                            <th className="px-4 py-3 font-semibold">Time</th>
                            <th className="px-4 py-3 font-semibold">Service</th>
                            <th className="px-4 py-3 font-semibold">Doctor</th>
                            <th className="px-4 py-3 font-semibold">Reason</th>
                            <th className="px-4 py-3 font-semibold">Status</th>
                            <th className="px-4 py-3 font-semibold">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {history.map((a) => (
                            <tr key={a.appointment_id} className={`border-t ${row}`}>
                              <td className="px-4 py-3">{formatDate(a.appointment_date)}</td>
                              <td className="px-4 py-3">{formatTime(a.start_time)}</td>
                              <td className="px-4 py-3">{a.service?.service_name || "Consultation"}</td>
                              <td className="px-4 py-3">{doctorName(a.doctor)}</td>
                              <td className="max-w-[220px] truncate px-4 py-3">{a.reason_for_visit || "N/A"}</td>
                              <td className="px-4 py-3">
                                <StaffTableBadge status={a.booking_status || "Pending"} />
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => { setSelectedAppt(a); setShowModal(true); }}
                                  className="rounded-md border border-gray-300 px-3 py-1 text-xs hover:bg-gray-50 dark:hover:bg-slate-800 dark:border-slate-700 transition font-bold"
                                >
                                  View
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {showModal && selectedAppt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ${card}`}>
            <div className="p-5 border-b dark:border-gray-800 flex justify-between items-center bg-teal-600 text-white">
              <div>
                <h2 className="text-lg font-bold">Appointment Details</h2>
                <p className="text-xs text-teal-100 mt-1">Patient History Record</p>
              </div>
              <button onClick={() => setShowModal(false)} className="h-8 w-8 grid place-items-center rounded-full hover:bg-white/20 transition-colors">✕</button>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={`text-[10px] font-bold tracking-wider uppercase ${muted}`}>Patient Name</p>
                  <p className="font-bold text-gray-900 dark:text-white mt-0.5">{fullName(selectedPatient)}</p>
                </div>
                <div>
                  <p className={`text-[10px] font-bold tracking-wider uppercase ${muted}`}>Patient ID</p>
                  <p className="font-mono font-bold text-teal-600 dark:text-teal-400 mt-0.5">{selectedPatient.patient_number || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t pt-3 dark:border-gray-800">
                <div>
                  <p className={`text-[10px] font-bold tracking-wider uppercase ${muted}`}>Assigned Doctor</p>
                  <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{doctorName(selectedAppt.doctor)}</p>
                </div>
                <div>
                  <p className={`text-[10px] font-bold tracking-wider uppercase ${muted}`}>Service Requested</p>
                  <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{selectedAppt.service?.service_name || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t pt-3 dark:border-gray-800">
                <div>
                  <p className={`text-[10px] font-bold tracking-wider uppercase ${muted}`}>Scheduled Time</p>
                  <p className="font-medium text-gray-900 dark:text-white mt-0.5">{formatDate(selectedAppt.appointment_date)} • {formatTime(selectedAppt.start_time)}</p>
                </div>
                <div>
                  <p className={`text-[10px] font-bold tracking-wider uppercase ${muted}`}>Booking Status</p>
                  <div className="mt-1 flex items-center gap-2">
                    <StaffTableBadge status={selectedAppt.booking_status} />
                  </div>
                </div>
              </div>

              {selectedAppt.reason_for_visit && (
                <div className="border-t pt-3 dark:border-gray-800">
                  <p className={`text-[10px] font-bold tracking-wider uppercase ${muted}`}>Reason for Visit</p>
                  <p className="mt-1 text-xs bg-gray-50 dark:bg-slate-800 p-3 rounded-lg border dark:border-slate-700 text-gray-700 dark:text-gray-300 italic">{selectedAppt.reason_for_visit}</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t dark:border-gray-800 flex justify-end gap-3 bg-gray-50/50 dark:bg-gray-900/50">
               {selectedAppt.booking_status === 'Pending' && (
                  <button 
                    onClick={() => handleUpdateStatus(selectedAppt.appointment_id, 'Confirmed')}
                    disabled={actionLoading}
                    className="px-6 py-2 rounded-xl text-xs font-semibold bg-teal-600 text-white hover:bg-teal-700 transition disabled:opacity-50"
                  >
                    Accept Appointment
                  </button>
               )}
               {selectedAppt.booking_status !== 'Cancelled' && selectedAppt.booking_status !== 'Completed' && (
                 <button 
                   onClick={() => handleUpdateStatus(selectedAppt.appointment_id, 'Cancelled')}
                   disabled={actionLoading}
                   className="px-6 py-2 rounded-xl text-xs font-semibold bg-red-100 text-red-700 hover:bg-red-200 transition disabled:opacity-50 dark:bg-red-900/40 dark:text-red-400"
                 >
                   Cancel
                 </button>
               )}
              <button 
                onClick={() => setShowModal(false)}
                className={`px-6 py-2 rounded-xl text-xs font-semibold transition ${dark ? 'hover:bg-gray-800 text-white' : 'hover:bg-gray-100 text-gray-700'}`}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function patientMatches(patient, term) {
  return searchablePatientText(patient).includes(term);
}

function patientExactMatch(patient, term) {
  return [
    String(patient.patient_id || "").toLowerCase(),
    String(patient.patient_number || "").toLowerCase(),
    fullName(patient).toLowerCase(),
  ].includes(term);
}

function searchablePatientText(patient) {
  return [
    patient.patient_id,
    patient.patient_number,
    patient.first_name,
    patient.middle_name,
    patient.last_name,
    patient.email,
    patient.contact_number,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function fullName(patient) {
  return [patient.first_name, patient.middle_name, patient.last_name].filter(Boolean).join(" ") || "Unnamed Patient";
}

function initials(patient) {
  return `${patient.first_name?.[0] || "P"}${patient.last_name?.[0] || ""}`.toUpperCase();
}

function doctorName(doctor) {
  if (!doctor) return "N/A";
  return `Dr. ${[doctor.first_name, doctor.last_name].filter(Boolean).join(" ")}`;
}

function formatDate(value) {
  if (!value) return "N/A";
  return new Date(`${value}T00:00:00`).toLocaleDateString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatTime(value) {
  if (!value) return "N/A";
  return new Date(`2000-01-01T${value}`).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Info({ dark, label, value }) {
  return (
    <div className={`rounded-xl border p-3 ${dark ? "border-slate-700 bg-slate-800/50" : "border-gray-100 bg-gray-50"}`}>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-0.5 font-medium">{value}</p>
    </div>
  );
}
