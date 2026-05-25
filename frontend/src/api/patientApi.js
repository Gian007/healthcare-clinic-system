import api from './axios';

export const getDashboard        = ()     => api.get('/patient/dashboard').then(r => r.data);
export const updateProfile       = (data) => api.put('/patient/profile', data).then(r => r.data);
export const updatePassword      = (data) => api.post('/patient/profile/password', data).then(r => r.data);
export const uploadPhoto         = (fd)   => api.post('/patient/profile/photo', fd, { headers: { 'Content-Type': undefined }}).then(r => r.data);
export const uploadVerificationId= (data) => {
  const headers = data instanceof FormData ? { 'Content-Type': undefined } : {};
  return api.post('/patient/verify-id', data, { headers }).then(r => r.data);
};
export const bookAppointment     = (data) => api.post('/patient/appointments', data).then(r => r.data);
export const cancelAppointment    = (id, data) => api.put(`/patient/appointments/${id}/cancel`, data).then(r => r.data);
export const confirmAttendance    = (id) => api.put(`/patient/appointments/${id}/confirm-attendance`).then(r => r.data);
export const declineAttendance    = (id) => api.put(`/patient/appointments/${id}/decline-attendance`).then(r => r.data);
export const getServiceRequests  = ()     => api.get('/patient/service-requests').then(r => r.data);
export const acceptServiceRequest = (id, data) => api.post(`/patient/service-requests/${id}/accept`, data).then(r => r.data);
export const declineServiceRequest = (id)  => api.post(`/patient/service-requests/${id}/decline`).then(r => r.data);
