import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useAuth } from "../../state/auth";
import * as staffApi from "../../api/staffApi";
import * as publicApi from "../../api/publicApi";

const blankForm = {
  patient_id: "",
  first_name: "",
  last_name: "",
  birth_date: "",
  sex: "",
  contact_number: "",
  address: "",
  service_id: "",
  doctor_id: "",
  reason_for_visit: "",
};

export default function StaffWalkIn() {
  const { dark } = useOutletContext();
  const { user } = useAuth();
  const nav = useNavigate();
  const isNurse = user?.db_role === "Nurse";

  const [search, setSearch] = useState("");
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([staffApi.getPatients(), publicApi.getDoctors(), publicApi.getServices()])
      .then(([patientData, doctorData, serviceData]) => {
        setPatients(patientData || []);
        setDoctors((doctorData || []).filter((d) => d.status === "Active" || d.status === "Available"));
        setServices((serviceData || []).filter((s) => !s.service_status || s.service_status === "Active" || s.service_status === "Available"));
      })
      .catch((e) => {
        console.error("Failed to load walk-in data:", e);
        setError("Failed to load patients, doctors, or services.");
      })
      .finally(() => setLoading(false));
  }, []);

  const searchResults = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return [];

    return patients
      .filter((p) =>
        [
          p.patient_number,
          p.first_name,
          p.middle_name,
          p.last_name,
          p.contact_number,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(term)
      )
      .slice(0, 6);
  }, [patients, search]);

  const pageTitle = dark ? "text-white" : "text-gray-900";
  const muted = dark ? "text-gray-400" : "text-gray-500";
  const card = dark
    ? "bg-gray-900 border-gray-800 text-white"
    : "bg-white border-gray-200 text-gray-900";
  const input = dark
    ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
    : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400";

  function update(field, value) {
    if (field === "contact_number") {
      value = value.replace(/\D/g, "").slice(0, 11);
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function selectPatient(patient) {
    setForm((prev) => ({
      ...prev,
      patient_id: patient.patient_id,
      first_name: patient.first_name || "",
      last_name: patient.last_name || "",
      birth_date: patient.birth_date || "",
      sex: patient.sex || "",
      contact_number: patient.contact_number || "",
      address: patient.address || "",
    }));
    setSearch(`${patient.first_name || ""} ${patient.last_name || ""}`.trim());
    setError("");
  }

  function clearPatient() {
    setForm((prev) => ({
      ...blankForm,
      service_id: prev.service_id,
      doctor_id: prev.doctor_id,
      reason_for_visit: prev.reason_for_visit,
    }));
    setSearch("");
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.patient_id && !/^09\d{9}$/.test(form.contact_number)) {
      setError("Phone number must start with 09 and be exactly 11 digits.");
      return;
    }

    try {
      setSubmitting(true);
      await staffApi.createWalkIn({
        ...form,
        patient_id: form.patient_id || null,
      });
      nav("/staff/queue");
    } catch (e) {
      setError(e.response?.data?.message || "Failed to register walk-in patient.");
    } finally {
      setSubmitting(false);
    }
  }

  if (isNurse) {
    return (
      <div>
        <h1 className={`text-2xl font-semibold ${pageTitle}`}>Walk-in Registration</h1>
        <p className={`text-sm ${muted}`}>Register walk-in patient and add them to queue</p>
        <div className={`mt-6 max-w-2xl rounded-2xl border p-8 shadow-sm flex flex-col items-center justify-center text-center ${card}`}>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Access Restricted</h2>
          <p className={`text-sm mt-2 max-w-md ${muted}`}>
            Nurses have read-only access to patient records. Walk-in registration is restricted to receptionist and admin roles.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className={`text-2xl font-semibold ${pageTitle}`}>Walk-in Registration</h1>
      <p className={`text-sm ${muted}`}>Register walk-in patient and add them to queue</p>

      <div className={`mt-6 max-w-3xl rounded-2xl border p-6 shadow-sm ${card}`}>
        {loading ? (
          <p className={`text-sm ${muted}`}>Loading clinic data...</p>
        ) : (
          <>
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
                  onClick={clearPatient}
                  type="button"
                  className={`rounded-lg border px-4 py-2 text-sm ${dark ? "border-gray-700 hover:bg-gray-800" : "border-gray-300 hover:bg-gray-50"}`}
                >
                  New
                </button>
              </div>

              {searchResults.length > 0 && !form.patient_id && (
                <div className={`mt-3 overflow-hidden rounded-xl border ${dark ? "border-gray-700" : "border-gray-200"}`}>
                  {searchResults.map((p) => (
                    <button
                      key={p.patient_id}
                      type="button"
                      onClick={() => selectPatient(p)}
                      className={`block w-full px-4 py-3 text-left text-sm ${dark ? "hover:bg-gray-800" : "hover:bg-teal-50"}`}
                    >
                      <b>{fullName(p)}</b>
                      <span className={`ml-2 ${muted}`}>{p.patient_number} - {p.contact_number}</span>
                    </button>
                  ))}
                </div>
              )}

              {form.patient_id && (
                <div className="mt-3 rounded-lg bg-teal-50 p-3 text-sm text-teal-700">
                  Selected: {form.first_name} {form.last_name}
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit}>
              <h2 className="font-semibold">Patient Information</h2>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <input
                  value={form.first_name}
                  onChange={(e) => update("first_name", e.target.value)}
                  disabled={Boolean(form.patient_id)}
                  className={`rounded-lg border px-4 py-2 text-sm disabled:opacity-70 ${input}`}
                  placeholder="First Name"
                  required={!form.patient_id}
                />

                <input
                  value={form.last_name}
                  onChange={(e) => update("last_name", e.target.value)}
                  disabled={Boolean(form.patient_id)}
                  className={`rounded-lg border px-4 py-2 text-sm disabled:opacity-70 ${input}`}
                  placeholder="Last Name"
                  required={!form.patient_id}
                />

                <input
                  value={form.contact_number}
                  onChange={(e) => update("contact_number", e.target.value)}
                  disabled={Boolean(form.patient_id)}
                  className={`rounded-lg border px-4 py-2 text-sm disabled:opacity-70 ${input}`}
                  placeholder="09XXXXXXXXX"
                  required={!form.patient_id}
                  maxLength={11}
                />

                <select
                  value={form.sex}
                  onChange={(e) => update("sex", e.target.value)}
                  disabled={Boolean(form.patient_id)}
                  className={`rounded-lg border px-4 py-2 text-sm disabled:opacity-70 ${input}`}
                  required={!form.patient_id}
                >
                  <option value="">Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>

                <input
                  type="date"
                  value={form.birth_date}
                  onChange={(e) => update("birth_date", e.target.value)}
                  disabled={Boolean(form.patient_id)}
                  className={`rounded-lg border px-4 py-2 text-sm disabled:opacity-70 ${input}`}
                  required={!form.patient_id}
                  max={new Date().toISOString().split("T")[0]}
                />

                <input
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                  disabled={Boolean(form.patient_id)}
                  className={`rounded-lg border px-4 py-2 text-sm md:col-span-2 disabled:opacity-70 ${input}`}
                  placeholder="Address"
                  required={!form.patient_id}
                />
              </div>

              <h2 className="mt-6 font-semibold">Appointment Details</h2>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <select
                  value={form.service_id}
                  onChange={(e) => update("service_id", e.target.value)}
                  className={`rounded-lg border px-4 py-2 text-sm ${input}`}
                  required
                >
                  <option value="">Select service</option>
                  {services.map((s) => (
                    <option key={s.service_id} value={s.service_id}>{s.service_name}</option>
                  ))}
                </select>

                <select
                  value={form.doctor_id}
                  onChange={(e) => update("doctor_id", e.target.value)}
                  className={`rounded-lg border px-4 py-2 text-sm ${input}`}
                  required
                >
                  <option value="">Select doctor</option>
                  {doctors.map((d) => (
                    <option key={d.doctor_id} value={d.doctor_id}>
                      Dr. {d.first_name} {d.last_name}
                    </option>
                  ))}
                </select>

                <textarea
                  value={form.reason_for_visit}
                  onChange={(e) => update("reason_for_visit", e.target.value)}
                  className={`min-h-28 rounded-lg border px-4 py-2 text-sm md:col-span-2 ${input}`}
                  placeholder="Brief description of symptoms or reason for visit"
                  required
                />
              </div>

              {error && (
                <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/20 dark:text-red-400">{error}</p>
              )}

              <div className="mt-6 flex flex-col justify-end gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => nav("/staff/scan")}
                  className={`rounded-lg border px-4 py-2 text-sm ${dark ? "border-gray-700 hover:bg-gray-800" : "border-gray-300 hover:bg-gray-50"}`}
                >
                  Patient History
                </button>
                <button
                  type="button"
                  onClick={clearPatient}
                  className={`rounded-lg border px-4 py-2 text-sm ${dark ? "border-gray-700 hover:bg-gray-800" : "border-gray-300 hover:bg-gray-50"}`}
                >
                  Clear
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60"
                >
                  {submitting ? "Registering..." : "Register & Add to Queue"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function fullName(patient) {
  return [patient.first_name, patient.middle_name, patient.last_name].filter(Boolean).join(" ");
}
