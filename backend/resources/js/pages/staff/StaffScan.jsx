import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import StaffTableBadge from "../../components/staff/StaffTableBadge";
import * as staffApi from "../../api/staffApi";

export default function StaffScan() {
  const { dark } = useOutletContext();

  const [code, setCode] = useState("");
  const [patient, setPatient] = useState(null);
  const [error, setError] = useState("");
  const [recent, setRecent] = useState([]);
  const [queueList, setQueueList] = useState([]);
  const [appointmentsList, setAppointmentsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const qData = await staffApi.getQueue();
      setQueueList(qData || []);
      
      const aData = await staffApi.getAppointments();
      const todayStr = new Date().toISOString().split('T')[0];
      const todayAppointments = (aData || []).filter(
        (a) => a.appointment_date === todayStr
      );
      setAppointmentsList(todayAppointments);

      // Populate recent list with today's top checked-in patients
      if (qData && qData.length > 0) {
        const mappedRecent = qData.slice(0, 3).map((q) => ({
          id: q.queue_id,
          type: "queue",
          queueNo: `Q-${q.queue_number}`,
          patientId: q.patient?.patient_number || "WALK-IN",
          name: `${q.patient?.first_name || ""} ${q.patient?.last_name || ""}`,
          doctor: q.doctor ? `Dr. ${q.doctor.first_name} ${q.doctor.last_name}` : "Any Doctor",
          service: q.appointment?.service?.service_name || "Consultation",
          checkIn: new Date(q.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          status: q.queue_status,
          wait: q.estimated_wait_time ? `${q.estimated_wait_time} min` : "15 min",
        }));
        setRecent(mappedRecent);
      }
    } catch (e) {
      console.error("Failed to load scan/search data:", e);
      setError("Failed to connect to clinic database.");
    } finally {
      setLoading(false);
    }
  };

  const scanPatient = () => {
    if (!code.trim()) {
      setError("Please enter a patient name, patient ID, or queue number.");
      setPatient(null);
      return;
    }

    const searchTerm = code.trim().toLowerCase();

    // 1. Search in today's active Queue list first
    const foundQueue = queueList.find((q) => {
      const fullName = `${q.patient?.first_name || ""} ${q.patient?.last_name || ""}`.toLowerCase();
      const patientId = (q.patient?.patient_number || "").toLowerCase();
      const queueNo = `q-${q.queue_number}`.toLowerCase();
      const queueNoStr = q.queue_number.toString().toLowerCase();

      return (
        fullName.includes(searchTerm) ||
        patientId.includes(searchTerm) ||
        queueNo.includes(searchTerm) ||
        queueNoStr === searchTerm
      );
    });

    if (foundQueue) {
      const mapped = {
        id: foundQueue.queue_id,
        type: "queue",
        queueNo: `Q-${foundQueue.queue_number}`,
        patientId: foundQueue.patient?.patient_number || "WALK-IN",
        name: `${foundQueue.patient?.first_name || ""} ${foundQueue.patient?.last_name || ""}`,
        doctor: foundQueue.doctor ? `Dr. ${foundQueue.doctor.first_name} ${foundQueue.doctor.last_name}` : "Any Doctor",
        service: foundQueue.appointment?.service?.service_name || "Consultation",
        checkIn: new Date(foundQueue.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: foundQueue.queue_status,
        wait: foundQueue.estimated_wait_time ? `${foundQueue.estimated_wait_time} min` : "15 min",
      };

      setError("");
      setPatient(mapped);
      setRecent((prev) => {
        const filtered = prev.filter((x) => x.patientId !== mapped.patientId);
        return [mapped, ...filtered].slice(0, 4);
      });
      return;
    }

    // 2. If not found in active Queue, search in today's Scheduled Appointments
    const foundAppt = appointmentsList.find((a) => {
      const fullName = `${a.patient?.first_name || ""} ${a.patient?.last_name || ""}`.toLowerCase();
      const patientId = (a.patient?.patient_number || "").toLowerCase();

      return (
        fullName.includes(searchTerm) ||
        patientId.includes(searchTerm)
      );
    });

    if (foundAppt) {
      const mapped = {
        id: foundAppt.appointment_id,
        type: "appointment",
        queueNo: "APPT",
        patientId: foundAppt.patient?.patient_number || "N/A",
        name: `${foundAppt.patient?.first_name || ""} ${foundAppt.patient?.last_name || ""}`,
        doctor: foundAppt.doctor ? `Dr. ${foundAppt.doctor.first_name} ${foundAppt.doctor.last_name}` : "Any Doctor",
        service: foundAppt.service?.service_name || "Consultation",
        checkIn: foundAppt.start_time ? new Date(`2000-01-01T${foundAppt.start_time}`).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "N/A",
        status: foundAppt.booking_status,
        wait: "0 min",
      };

      setError("");
      setPatient(mapped);
      setRecent((prev) => {
        const filtered = prev.filter((x) => x.patientId !== mapped.patientId);
        return [mapped, ...filtered].slice(0, 4);
      });
      return;
    }

    // 3. Not found anywhere
    setPatient(null);
    setError("No matching patient, queue record, or appointment found for today.");
  };

  const nextAction = async () => {
    if (!patient) return;

    if (patient.type === "queue") {
      const next =
        patient.status === "Waiting"
          ? "Serving"
          : patient.status === "Serving"
          ? "Done"
          : "Done";

      try {
        await staffApi.updateQueueStatus(patient.id, { queue_status: next });
        const updated = { ...patient, status: next };
        setPatient(updated);
        // Refresh queue lists
        const qData = await staffApi.getQueue();
        setQueueList(qData || []);
      } catch (e) {
        alert("Failed to update queue status.");
      }
    } else if (patient.type === "appointment") {
      const next = patient.status === "Pending" ? "Confirmed" : "Completed";
      try {
        await staffApi.updateAppointmentStatus(patient.id, { booking_status: next });
        const updated = { ...patient, status: next };
        setPatient(updated);
        // Refresh appointments list
        const aData = await staffApi.getAppointments();
        const todayStr = new Date().toISOString().split("T")[0];
        const todayAppointments = (aData || []).filter(
          (a) => a.appointment_date === todayStr
        );
        setAppointmentsList(todayAppointments);
      } catch (e) {
        alert("Failed to update appointment status.");
      }
    }
  };

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

  const actionText =
    patient?.type === "appointment"
      ? (patient?.status === "Pending" ? "Check-in & Confirm" : "Mark as Completed")
      : (patient?.status === "Waiting"
          ? "Start Serving"
          : patient?.status === "Serving"
          ? "Mark as Done"
          : "Already Done");

  const actionDisabled =
    patient?.type === "appointment"
      ? (patient?.status === "Completed" || patient?.status === "Cancelled")
      : (patient?.status === "Done" || patient?.status === "Cancelled");

  return (
    <div>
      <h1 className={`text-2xl font-semibold ${pageTitle}`}>Search Patient</h1>
      <p className={`text-sm ${muted}`}>
        Enter patient name, patient ID, or queue number to retrieve information
      </p>

      <div className="mx-auto mt-6 max-w-2xl space-y-5">
        <div className={`rounded-2xl border p-6 text-center shadow-sm ${card}`}>
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-teal-600 text-2xl text-white">
            #
          </div>

          <h2 className="mt-3 font-semibold">Search Patient Database</h2>
          <p className={`text-sm ${muted}`}>Search by Patient Name, ID (PAT-...) or Queue Number</p>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && scanPatient()}
              placeholder="Search by Patient Name, ID (PAT-...) or Queue Number"
              className={`w-full rounded-lg border px-4 py-2 text-sm ${input}`}
            />

            <button
              onClick={scanPatient}
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 shrink-0"
            >
              Scan / Search
            </button>
          </div>

          {error && (
            <p className="mt-3 rounded-lg bg-red-50 dark:bg-red-950/20 p-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
        </div>

        {patient && (
          <div className={`rounded-2xl border p-5 shadow-sm ${card} animate-in fade-in zoom-in-95`}>
            <div className="flex items-center gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-teal-100 dark:bg-teal-900/40 text-xl font-bold text-teal-700 dark:text-teal-300 shrink-0">
                {patient.name ? patient.name[0] : "#"}
              </div>

              <div className="min-w-0">
                <h3 className="text-lg font-semibold truncate">{patient.name}</h3>
                <p className={`text-sm ${muted} truncate`}>
                  ID: {patient.patientId} • Queue No: {patient.queueNo}
                </p>
              </div>

              <div className="ml-auto shrink-0">
                <StaffTableBadge status={patient.status === "Serving" ? "In Progress" : patient.status} />
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Info dark={dark} label="Assigned Doctor" value={patient.doctor} />
              <Info dark={dark} label="Medical Service" value={patient.service} />
              <Info dark={dark} label="Appointment / Check-in Time" value={patient.checkIn} />
              <Info dark={dark} label="Estimated Wait" value={patient.wait} />
            </div>

            <button
              onClick={nextAction}
              disabled={actionDisabled}
              className="mt-5 w-full rounded-lg bg-teal-600 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:bg-gray-300 dark:disabled:bg-slate-800 dark:disabled:text-gray-600 transition-colors"
            >
              {actionText}
            </button>
          </div>
        )}

        <div className={`rounded-2xl border p-5 shadow-sm ${card}`}>
          <h3 className="font-semibold">Recent Scanned/Searched Patients</h3>

          <div className="mt-3 space-y-3">
            {loading ? (
              <p className={`text-sm ${muted}`}>Loading daily queue...</p>
            ) : recent.length === 0 ? (
              <p className={`text-sm ${muted}`}>No recently scanned patients today.</p>
            ) : (
              recent.map((p, idx) => (
                <button
                  key={`${p.patientId}-${idx}`}
                  onClick={() => {
                    setCode(p.queueNo === "APPT" ? p.name : p.queueNo.replace("Q-", ""));
                    setPatient(p);
                    setError("");
                  }}
                  className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition-all hover:scale-[1.01] ${subCard}`}
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">
                      {p.queueNo} - {p.name}
                    </p>
                    <p className={`text-xs ${muted} truncate`}>{p.service}</p>
                  </div>
                  <span className={`text-xs ${muted} shrink-0`}>recent</span>
                </button>
              ))
            )}
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
        dark ? "bg-slate-800/50 border border-slate-700" : "bg-gray-50 border border-gray-100"
      }`}
    >
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium mt-0.5">{value}</p>
    </div>
  );
}