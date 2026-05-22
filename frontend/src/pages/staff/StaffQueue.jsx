import { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import StaffTableBadge from "../../components/staff/StaffTableBadge";
import * as staffApi from "../../api/staffApi";
import * as publicApi from "../../api/publicApi";
import { useAuth } from "../../state/auth";

export default function StaffQueue() {
  const { dark } = useOutletContext() || {};
  const { user } = useAuth();
  const isStaff = user?.role === "staff";

  const [queue, setQueue] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [doctorAttendances, setDoctorAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    fetchQueue().finally(() => setLoading(false));
    const interval = setInterval(fetchQueue, 8000);
    return () => clearInterval(interval);
  }, []);

  const fetchQueue = async () => {
    try {
      const [qData, dData] = await Promise.all([
        staffApi.getQueue(),
        publicApi.getDoctors(),
      ]);
      const attendanceData = await staffApi.getDoctorAttendances();
      setQueue(qData || []);
      setDoctors(dData || []);
      setDoctorAttendances(attendanceData || []);
    } catch (error) {
      console.error("Failed to fetch queue and doctors:", error);
    }
  };

  const pageTitle = dark ? "text-white" : "text-gray-900";
  const muted = dark ? "text-gray-400" : "text-gray-500";
  const card = dark
    ? "bg-gray-900 border-gray-800 text-white"
    : "bg-white border-gray-200 text-gray-900";
  const subCard = dark
    ? "bg-gray-800 border-gray-700 text-white"
    : "bg-gray-50 border-gray-100 text-gray-900";
  const input = dark
    ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
    : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400";

  const activeQueue = useMemo(
    () => queue.filter((q) => !["Done", "Cancelled"].includes(q.queue_status)),
    [queue]
  );

  const filteredQueue = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return activeQueue;

    return activeQueue.filter((q) => {
      const text = [
        q.queue_number,
        q.patient?.patient_number,
        q.patient?.first_name,
        q.patient?.middle_name,
        q.patient?.last_name,
        q.doctor?.first_name,
        q.doctor?.last_name,
        q.queue_status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return text.includes(term);
    });
  }, [activeQueue, search]);

  const doctorGroups = useMemo(() => {
    const todayWeekday = new Date().toLocaleDateString("en-US", { weekday: "long" });
    const map = new Map();

    doctors.forEach((doctor) => {
      const schedule = doctor.schedules?.find(
        (s) => s.day_of_week === todayWeekday && s.schedule_status === "Active"
      );
      if (schedule) {
        map.set(doctor.doctor_id, {
          id: doctor.doctor_id,
          name: doctorName(doctor),
          room: schedule.room || "Consultation Room",
          specialization: doctor.specialization?.specialization_name || "General Practice",
          attendance: doctorAttendances.find((a) => Number(a.doctor_id) === Number(doctor.doctor_id)),
          list: [],
        });
      }
    });

    activeQueue.forEach((q) => {
      if (!map.has(q.doctor_id)) {
        map.set(q.doctor_id, {
          id: q.doctor_id,
          name: doctorName(q.doctor),
          room: "Consultation Room",
          specialization: q.doctor?.specialization?.specialization_name || "Specialist",
          attendance: doctorAttendances.find((a) => Number(a.doctor_id) === Number(q.doctor_id)),
          list: [],
        });
      }
      map.get(q.doctor_id).list.push(q);
    });

    return [...map.values()].map((doctor) => {
      const sorted = doctor.list.sort(sortQueue);
      return {
        ...doctor,
        current: sorted.find((q) => q.queue_status === "Serving"),
        waiting: sorted.filter((q) => q.queue_status === "Waiting"),
        notArrived: sorted.filter((q) => q.queue_status === "Active"),
        isPresent: isDoctorPresent(doctor.attendance),
      };
    });
  }, [activeQueue, doctors, doctorAttendances]);

  const counts = useMemo(
    () => ({
      notArrived: activeQueue.filter((q) => q.queue_status === "Active").length,
      waiting: activeQueue.filter((q) => q.queue_status === "Waiting").length,
      serving: activeQueue.filter((q) => q.queue_status === "Serving").length,
      done: queue.filter((q) => q.queue_status === "Done").length,
    }),
    [activeQueue, queue]
  );

  async function runAction(id, action) {
    if (!isStaff) return;
    try {
      setBusyId(id);
      await action();
      await fetchQueue();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update queue.");
    } finally {
      setBusyId(null);
    }
  }

  const tapPatientIn = (q) => runAction(q.queue_id, () => staffApi.tapInQueue(q.queue_id));
  const tapPatientOut = (q) => runAction(q.queue_id, () => staffApi.tapOutQueue(q.queue_id));

  const doctorAttendanceIn = (doctor) => {
    return runAction(`doctor-attendance-${doctor.id}`, () => staffApi.tapInDoctor(doctor.id));
  };

  const doctorAttendanceOut = (doctor) => {
    return runAction(`doctor-attendance-${doctor.id}`, () => staffApi.tapOutDoctor(doctor.id));
  };

  const doctorStartNextPatient = (doctor) => {
    if (!doctor.isPresent) return alert("Doctor must tap in before the queue can start.");
    if (doctor.current) return alert("This doctor already has a patient in progress.");
    const next = doctor.waiting[0];
    if (!next) return alert("No tapped-in waiting patient for this doctor.");
    return runAction(`doctor-${doctor.id}`, () => staffApi.tapInQueue(next.queue_id));
  };

  const doctorCompleteCurrent = (doctor) => {
    if (!doctor.current) return alert("No patient in progress for this doctor.");
    return runAction(`doctor-${doctor.id}`, () => staffApi.tapOutQueue(doctor.current.queue_id));
  };

  return (
    <div>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className={`text-2xl font-semibold ${pageTitle}`}>Queue Management</h1>
          <p className={`text-sm ${muted}`}>
            Doctors must tap in before any patient queue can start. Patient tap in marks arrival, then starts only when the doctor is present.
          </p>
        </div>

        {isStaff && (
          <Link
            to="/staff/walk-in"
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-bold text-white shadow-md shadow-teal-600/10 hover:bg-teal-700"
          >
            Add Walk-in
          </Link>
        )}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat dark={dark} label="Queue Number Only" value={counts.notArrived} help="Not yet in hospital" />
        <Stat dark={dark} label="Waiting" value={counts.waiting} help="Tapped in at hospital" />
        <Stat dark={dark} label="In Progress" value={counts.serving} help="With doctor now" />
        <Stat dark={dark} label="Completed" value={counts.done} help="Finished today" />
      </div>

      <div className={`mt-5 rounded-2xl border p-4 shadow-sm ${card}`}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search patient, queue number, doctor, or status..."
          className={`w-full rounded-lg border px-4 py-2 text-sm ${input}`}
        />
        <div className={`mt-3 grid gap-2 text-xs ${muted} sm:grid-cols-3`}>
          <p><b className="text-blue-500">Active</b> = has a queue number but has not arrived yet</p>
          <p><b className="text-yellow-500">Waiting</b> = arrived and waiting for their turn</p>
          <p><b className="text-teal-500">Serving</b> = in progress with doctor</p>
        </div>
      </div>

      {loading ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="h-96 animate-pulse rounded-2xl border border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900" />
          <div className="h-96 animate-pulse rounded-2xl border border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900" />
        </div>
      ) : (
        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <section className={`rounded-2xl border shadow-sm ${card}`}>
            <div className="border-b border-gray-100 p-5 dark:border-gray-800">
              <h2 className="text-lg font-semibold">Patient Tap In / Tap Out</h2>
              <p className={`text-sm ${muted}`}>Left side: patient arrival and patient completion controls.</p>
            </div>

            <div className="max-h-[680px] overflow-y-auto p-4">
              {filteredQueue.length === 0 ? (
                <p className={`p-8 text-center text-sm ${muted}`}>No active queue records.</p>
              ) : (
                <div className="space-y-3">
                  {filteredQueue.sort(sortQueue).map((q) => (
                    <div key={q.queue_id} className={`rounded-xl border p-4 ${subCard}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 gap-3">
                          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-teal-100 text-lg font-black text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
                            {q.queue_number}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold">{patientName(q.patient)}</p>
                            <p className={`truncate text-xs ${muted}`}>
                              Q-{q.queue_number} - {q.patient?.patient_number || "No patient ID"} - {doctorName(q.doctor)}
                            </p>
                            <p className={`mt-1 text-xs ${muted}`}>{statusHelp(q.queue_status)}</p>
                          </div>
                        </div>
                        <StaffTableBadge status={q.queue_status} />
                      </div>

                      {isStaff && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {["Active", "Waiting"].includes(q.queue_status) && (
                            <button
                              disabled={busyId === q.queue_id}
                              onClick={() => tapPatientIn(q)}
                              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                              Tap In Patient
                            </button>
                          )}

                          {q.queue_status === "Serving" && (
                            <button
                              disabled={busyId === q.queue_id}
                              onClick={() => tapPatientOut(q)}
                              className="rounded-lg bg-green-600 px-4 py-2 text-xs font-bold text-white hover:bg-green-700 disabled:opacity-50"
                            >
                              Tap Out Patient
                            </button>
                          )}

                          {["Active", "Waiting"].includes(q.queue_status) && (
                            <button
                              disabled={busyId === q.queue_id}
                              onClick={() => {
                                if (confirm("Remove this patient from the queue?")) {
                                  runAction(q.queue_id, () => staffApi.updateQueueStatus(q.queue_id, { queue_status: "Cancelled" }));
                                }
                              }}
                              className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50"
                            >
                              Cancel Queue
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className={`rounded-2xl border shadow-sm ${card}`}>
            <div className="border-b border-gray-100 p-5 dark:border-gray-800">
              <h2 className="text-lg font-semibold">Doctor Tap In / Tap Out</h2>
              <p className={`text-sm ${muted}`}>Right side: doctor attendance, queue start, and current session completion.</p>
            </div>

            <div className="max-h-[680px] overflow-y-auto p-4">
              {doctorGroups.length === 0 ? (
                <p className={`p-8 text-center text-sm ${muted}`}>No doctor queues today.</p>
              ) : (
                <div className="space-y-4">
                  {doctorGroups.map((doctor) => (
                    <div key={doctor.id} className={`overflow-hidden rounded-xl border ${subCard}`}>
                      <div className="bg-gradient-to-r from-teal-600 to-teal-500 p-4 text-white">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-semibold">{doctor.name}</h3>
                            <p className="text-xs opacity-90">{doctor.room} - {doctor.specialization}</p>
                          </div>
                          <span className={`rounded-full px-3 py-1 text-xs font-bold ${doctor.isPresent ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                            {doctor.isPresent ? "Tapped In" : "Not Tapped In"}
                          </span>
                        </div>
                      </div>

                      <div className="p-4">
                        <div className={`mb-4 rounded-xl border p-3 ${dark ? "border-gray-700 bg-gray-900" : "border-gray-100 bg-white"}`}>
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className={`text-xs font-bold uppercase tracking-wider ${muted}`}>Doctor Attendance</p>
                              <p className="text-sm font-semibold">
                                Time In: {formatTime(doctor.attendance?.time_in)} | Time Out: {formatTime(doctor.attendance?.time_out)}
                              </p>
                            </div>
                            {isStaff && (
                              <div className="flex gap-2">
                                <button
                                  disabled={busyId === `doctor-attendance-${doctor.id}` || doctor.isPresent}
                                  onClick={() => doctorAttendanceIn(doctor)}
                                  className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:bg-gray-300 disabled:text-gray-500 dark:disabled:bg-slate-800"
                                >
                                  Doctor Tap In
                                </button>
                                <button
                                  disabled={busyId === `doctor-attendance-${doctor.id}` || !doctor.isPresent || Boolean(doctor.current)}
                                  onClick={() => doctorAttendanceOut(doctor)}
                                  className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:bg-gray-300 disabled:text-gray-500 dark:disabled:bg-slate-800"
                                >
                                  Doctor Tap Out
                                </button>
                              </div>
                            )}
                          </div>
                          {!doctor.isPresent && (
                            <p className="mt-2 text-xs font-semibold text-rose-500">
                              Queue start is locked until this doctor taps in.
                            </p>
                          )}
                        </div>

                        <p className={`text-xs font-bold uppercase tracking-wider ${muted}`}>Current In Progress</p>
                        <div className={`mt-2 rounded-xl border p-4 ${dark ? "border-gray-700 bg-gray-900" : "border-teal-100 bg-white"}`}>
                          {doctor.current ? (
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="text-2xl font-black text-teal-600">Q-{doctor.current.queue_number}</p>
                                <p className="text-sm font-semibold">{patientName(doctor.current.patient)}</p>
                              </div>
                              <StaffTableBadge status="Serving" />
                            </div>
                          ) : (
                            <p className={`py-2 text-center text-sm ${muted}`}>No active patient</p>
                          )}
                        </div>

                        {isStaff && (
                          <div className="mt-4 grid gap-2 sm:grid-cols-2">
                            <button
                              disabled={busyId === `doctor-${doctor.id}` || !doctor.isPresent || Boolean(doctor.current) || doctor.waiting.length === 0}
                              onClick={() => doctorStartNextPatient(doctor)}
                              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 dark:disabled:bg-slate-800"
                            >
                              Start Next Patient
                            </button>
                            <button
                              disabled={busyId === `doctor-${doctor.id}` || !doctor.current}
                              onClick={() => doctorCompleteCurrent(doctor)}
                              className="rounded-lg bg-green-600 px-4 py-2 text-xs font-bold text-white hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500 dark:disabled:bg-slate-800"
                            >
                              Complete Current Patient
                            </button>
                          </div>
                        )}

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          <MiniList title="Waiting in Hospital" list={doctor.waiting} muted={muted} />
                          <MiniList title="Queue No. Only" list={doctor.notArrived} muted={muted} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function Stat({ dark, label, value, help }) {
  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${dark ? "border-gray-800 bg-gray-900 text-white" : "border-gray-200 bg-white text-gray-900"}`}>
      <p className="text-xs font-bold uppercase tracking-wider text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{help}</p>
    </div>
  );
}

function MiniList({ title, list, muted }) {
  return (
    <div>
      <p className={`mb-2 text-[10px] font-bold uppercase tracking-wider ${muted}`}>{title}</p>
      <div className="space-y-2">
        {list.length === 0 ? (
          <p className={`rounded-lg border border-dashed p-3 text-center text-xs ${muted}`}>None</p>
        ) : (
          list.slice(0, 4).map((q) => (
            <div key={q.queue_id} className="flex items-center justify-between rounded-lg bg-white/60 p-2 text-xs dark:bg-slate-900/50">
              <span className="truncate">{patientName(q.patient)}</span>
              <b className="ml-2 shrink-0 text-teal-600">Q-{q.queue_number}</b>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function sortQueue(a, b) {
  return (a.priority_number ?? a.queue_number) - (b.priority_number ?? b.queue_number);
}

function patientName(patient) {
  if (!patient) return "Unknown Patient";
  return [patient.first_name, patient.middle_name, patient.last_name].filter(Boolean).join(" ");
}

function doctorName(doctor) {
  if (!doctor) return "No Doctor";
  return `Dr. ${[doctor.first_name, doctor.last_name].filter(Boolean).join(" ")}`;
}

function isDoctorPresent(attendance) {
  return Boolean(attendance?.time_in && !attendance?.time_out);
}

function formatTime(value) {
  if (!value) return "--:--";
  const [hour, minute] = value.split(":");
  const date = new Date();
  date.setHours(Number(hour), Number(minute || 0), 0, 0);
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

function statusHelp(status) {
  if (status === "Active") return "Has queue number but not yet in hospital.";
  if (status === "Waiting") return "Patient is already in the hospital and waiting.";
  if (status === "Serving") return "Patient is currently in progress with the doctor.";
  return status;
}
