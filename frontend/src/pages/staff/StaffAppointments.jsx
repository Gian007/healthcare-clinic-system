import { useOutletContext } from "react-router-dom";
import { useEffect, useState } from "react";
import StaffTableBadge from "../../components/staff/StaffTableBadge";
import * as staffApi from "../../api/staffApi";

export default function StaffAppointments() {
  const { dark } = useOutletContext();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await staffApi.getDashboardData();
        setAppointments(data.appointments_today || []);
      } catch (error) {
        console.error("Failed to fetch appointments:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const pageTitle = dark ? "text-white" : "text-gray-900";
  const muted = dark ? "text-gray-400" : "text-gray-500";
  const card = dark
    ? "bg-gray-900 border-gray-800 text-white"
    : "bg-white border-gray-200 text-gray-900";
  const tableHead = dark ? "bg-gray-800 text-gray-300" : "bg-gray-50 text-gray-500";
  const divide = dark ? "divide-gray-800" : "divide-gray-100";

  return (
    <div>
      <h1 className={`text-2xl font-semibold ${pageTitle}`}>Appointments</h1>
      <p className={`text-sm ${muted}`}>Today’s appointment schedule</p>

      <div className={`mt-6 overflow-hidden rounded-2xl border shadow-sm ${card}`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className={tableHead}>
              <tr>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Doctor</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Patient ID</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>

            <tbody className={`divide-y ${divide}`}>
              {loading ? (
                <tr><td colSpan="7" className="p-8 text-center text-gray-500">Loading appointments...</td></tr>
              ) : appointments.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-gray-500">No appointments for today.</td></tr>
              ) : (
                appointments.map((a) => (
                  <tr key={a.id}>
                    <td className="px-4 py-3 font-medium">{a.appointment_time}</td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="grid h-8 w-8 place-items-center rounded-full bg-teal-100 text-xs font-bold text-teal-700">
                          {a.patient?.first_name ? a.patient.first_name[0] : '?'}
                        </div>
                        <span>{a.patient?.first_name} {a.patient?.last_name}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3">Dr. {a.doctor?.first_name} {a.doctor?.last_name}</td>
                    <td className="px-4 py-3">{a.service?.service_name || 'N/A'}</td>
                    <td className="px-4 py-3">{a.patient?.patient_number || 'N/A'}</td>
                    <td className="px-4 py-3">
                      <StaffTableBadge status={a.appointment_status} />
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button className="rounded-md border border-green-300 px-3 py-1 text-xs text-green-700 hover:bg-green-50">
                          Confirm
                        </button>
                        <button className="rounded-md border border-red-300 px-3 py-1 text-xs text-red-700 hover:bg-red-50">
                          Cancel
                        </button>
                        <button className="rounded-md border border-gray-300 px-3 py-1 text-xs hover:bg-gray-50">
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}