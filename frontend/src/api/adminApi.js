import api from './axios';

export const getDashboard            = ()     => api.get('/admin/dashboard').then(r => r.data);
export const updateProfile           = (data) => api.put('/admin/profile', data).then(r => r.data);
export const updatePassword          = (data) => api.post('/admin/profile/password', data).then(r => r.data);
export const uploadPhoto             = (fd)   => api.post('/admin/profile/photo', fd, { headers: { 'Content-Type': 'multipart/form-data' }}).then(r => r.data);

export const getPatients             = ()     => api.get('/admin/patients').then(r => r.data);
export const updatePatient           = (id,d) => api.put(`/admin/patients/${id}`, d).then(r => r.data);
export const updatePatientStatus     = (id,d) => api.put(`/admin/patients/${id}/status`, d).then(r => r.data);
export const processVerification     = (id,d) => api.post(`/admin/patients/${id}/verify`, d).then(r => r.data);

export const getDoctors              = ()     => api.get('/admin/doctors').then(r => r.data);
export const createDoctor            = (data) => api.post('/admin/doctors', data).then(r => r.data);
export const updateDoctor            = (id,d) => api.put(`/admin/doctors/${id}`, d).then(r => r.data);
export const updateDoctorStatus      = (id,d) => api.put(`/admin/doctors/${id}/status`, d).then(r => r.data);

export const getStaff                = ()     => api.get('/admin/staff').then(r => r.data);
export const createStaff             = (data) => api.post('/admin/staff', data).then(r => r.data);
export const updateStaff             = (id,d) => api.put(`/admin/staff/${id}`, d).then(r => r.data);

export const getServices             = ()     => api.get('/admin/services').then(r => r.data);
export const createService           = (data) => api.post('/admin/services', data).then(r => r.data);
export const updateService           = (id,d) => api.put(`/admin/services/${id}`, d).then(r => r.data);
export const deleteService           = (id)   => api.delete(`/admin/services/${id}`).then(r => r.data);

export const getSpecializations      = ()     => api.get('/admin/specializations').then(r => r.data);

export const getSchedules            = ()     => api.get('/admin/schedules').then(r => r.data);
export const createSchedule          = (data) => api.post('/admin/schedules', data).then(r => r.data);
export const deleteSchedule          = (id)   => api.delete(`/admin/schedules/${id}`).then(r => r.data);

export const getReports              = (params) => api.get('/admin/reports', { params }).then(r => r.data);

export const getDayOffRequests       = ()     => api.get('/admin/dayoffs').then(r => r.data);
export const updateDayOffRequest     = (id,d) => api.put(`/admin/dayoffs/${id}`, d).then(r => r.data);
