// Backend-ready PHP API helper.
// Change API_BASE to your PHP backend path later.
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost/healthcare-api';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) throw new Error('API request failed');
  return res.json();
}

export const doctorApi = {
  getDashboard: (doctorId) => request(`/doctor/dashboard.php?doctor_id=${doctorId}`),
  getAppointments: (doctorId) => request(`/doctor/appointments.php?doctor_id=${doctorId}`),
  updateAppointment: (id, data) => request(`/doctor/update-appointment.php`, { method: 'POST', body: JSON.stringify({ id, ...data }) }),
  getQueue: (doctorId) => request(`/doctor/queue.php?doctor_id=${doctorId}`),
  updateQueue: (id, data) => request(`/doctor/update-queue.php`, { method: 'POST', body: JSON.stringify({ id, ...data }) }),
  requestDayOff: (data) => request(`/doctor/request-dayoff.php`, { method: 'POST', body: JSON.stringify(data) }),
  clockIn: (doctorId) => request(`/doctor/clock-in.php`, { method: 'POST', body: JSON.stringify({ doctor_id: doctorId }) }),
  clockOut: (doctorId) => request(`/doctor/clock-out.php`, { method: 'POST', body: JSON.stringify({ doctor_id: doctorId }) }),
  updateProfile: (data) => request(`/doctor/update-profile.php`, { method: 'POST', body: JSON.stringify(data) }),
};
