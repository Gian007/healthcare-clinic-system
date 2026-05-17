import api from './axios';

export const getDashboard          = ()     => api.get('/doctor/dashboard').then(r => r.data);
export const getAppointments       = ()     => api.get('/doctor/appointments').then(r => r.data);
export const updateAppointmentStatus=(id,d) => api.put(`/doctor/appointments/${id}/status`, d).then(r => r.data);
export const getQueue              = ()     => api.get('/doctor/queue').then(r => r.data);
export const updateQueueStatus     = (id, status) => api.put(`/doctor/queue/${id}/status`, { status }).then(r => r.data);
export const getSchedules          = ()     => api.get('/doctor/schedules').then(r => r.data);
export const getDayOffs            = ()     => api.get('/doctor/dayoffs').then(r => r.data);
export const requestDayOff         = (data) => api.post('/doctor/dayoffs', data).then(r => r.data);
export const cancelDayOff          = (id)   => api.delete(`/doctor/dayoffs/${id}`).then(r => r.data);
export const recordAttendance      = (data) => api.post('/doctor/attendance', data).then(r => r.data);
export const getAttendance         = ()     => api.get('/doctor/attendance').then(r => r.data);
export const updateProfile         = (data) => api.put('/doctor/profile', data).then(r => r.data);
export const updatePassword        = (data) => api.post('/doctor/profile/password', data).then(r => r.data);
export const uploadPhoto           = (fd)   => api.post('/doctor/profile/photo', fd, { headers: { 'Content-Type': 'multipart/form-data' }}).then(r => r.data);
