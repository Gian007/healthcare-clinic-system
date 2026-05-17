import api from './axios';

export const getDashboard        = ()     => api.get('/patient/dashboard').then(r => r.data);
export const updateProfile       = (data) => api.put('/patient/profile', data).then(r => r.data);
export const updatePassword      = (data) => api.post('/patient/profile/password', data).then(r => r.data);
export const uploadPhoto         = (fd)   => api.post('/patient/profile/photo', fd, { headers: { 'Content-Type': 'multipart/form-data' }}).then(r => r.data);
export const uploadVerificationId= (fd)   => api.post('/patient/verify-id', fd, { headers: { 'Content-Type': 'multipart/form-data' }}).then(r => r.data);
export const bookAppointment     = (data) => api.post('/patient/appointments', data).then(r => r.data);

// Public endpoints (no auth needed)
export const getPublicDoctors      = ()   => api.get('/admin/doctors').then(r => r.data);
export const getPublicServices     = ()   => api.get('/admin/services').then(r => r.data);
export const getPublicSpecializations = ()=> api.get('/admin/specializations').then(r => r.data);
