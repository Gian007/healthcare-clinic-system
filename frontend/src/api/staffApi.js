import api from './axios';

export const getDashboardData          = ()     => api.get('/staff/dashboard').then(r => r.data);
export const updateProfile             = (data) => api.put('/staff/profile', data).then(r => r.data);
export const updatePassword            = (data) => api.post('/staff/profile/password', data).then(r => r.data);
export const uploadPhoto               = (fd)   => api.post('/staff/profile/photo', fd, { headers: { 'Content-Type': 'multipart/form-data' }}).then(r => r.data);
export const getPatients               = ()     => api.get('/staff/patients').then(r => r.data);
export const getPatient                = (id)   => api.get(`/staff/patients/${id}`).then(r => r.data);
export const updatePatient             = (id, d)=> api.put(`/staff/patients/${id}`, d).then(r => r.data);
export const getPendingVerifications   = ()     => api.get('/staff/verifications').then(r => r.data);
export const processVerification       = (id,d) => api.post(`/staff/verifications/${id}`, d).then(r => r.data);
export const getAppointments           = ()     => api.get('/staff/appointments').then(r => r.data);
export const updateAppointmentStatus   = (id,d) => api.put(`/staff/appointments/${id}/status`, d).then(r => r.data);
export const getSchedules              = ()     => api.get('/staff/schedules').then(r => r.data);
export const getQueue                  = ()     => api.get('/staff/queue').then(r => r.data);
export const updateQueueStatus         = (id,d) => api.put(`/staff/queue/${id}/status`, d).then(r => r.data);
