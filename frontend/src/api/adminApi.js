import api from './axios';

export const getDashboard            = ()     => api.get('/admin/dashboard').then(r => r.data);
export const updateProfile           = (data) => api.put('/admin/profile', data).then(r => r.data);
export const updatePassword          = (data) => api.post('/admin/profile/password', data).then(r => r.data);
export const uploadPhoto             = (fd)   => api.post('/admin/profile/photo', fd, { headers: { 'Content-Type': 'multipart/form-data' }}).then(r => r.data);

export const getPatients             = ()     => api.get('/admin/patients').then(r => r.data);
export const createPatient           = (data) => api.post('/admin/patients', data).then(r => r.data);
export const updatePatient           = (id,d) => api.put(`/admin/patients/${id}`, d).then(r => r.data);
export const updatePatientStatus     = (id,d) => api.put(`/admin/patients/${id}/status`, d).then(r => r.data);
export const processVerification     = (id,d) => api.post(`/admin/patients/${id}/verify`, d).then(r => r.data);

export const getDoctors              = ()     => api.get('/admin/doctors').then(r => r.data);
export const createDoctor            = (data) => api.post('/admin/doctors', data).then(r => r.data);
export const updateDoctor            = (id,d) => api.put(`/admin/doctors/${id}`, d).then(r => r.data);
export const updateDoctorStatus      = (id,d) => api.put(`/admin/doctors/${id}/status`, d).then(r => r.data);
export const sendDoctorEmail       = (id,d) => api.post(`/admin/doctors/${id}/email`, d).then(r => r.data);

export const getStaff                = ()     => api.get('/admin/staff').then(r => r.data);
export const createStaff             = (data) => api.post('/admin/staff', data).then(r => r.data);
export const updateStaff             = (id,d) => api.post(`/admin/staff/${id}`, d).then(r => r.data);
export const sendStaffEmail         = (id,d) => api.post(`/admin/staff/${id}/email`, d).then(r => r.data);

export const getServices             = ()     => api.get('/admin/services').then(r => r.data);
export const createService           = (data) => api.post('/admin/services', data).then(r => r.data);
export const updateService           = (id,d) => api.put(`/admin/services/${id}`, d).then(r => r.data);
export const deleteService           = (id)   => api.delete(`/admin/services/${id}`).then(r => r.data);

export const getSpecializations      = ()     => api.get('/admin/specializations').then(r => r.data);
export const createSpecialization   = (data) => api.post('/admin/specializations', data).then(r => r.data);

export const getSchedules            = ()     => api.get('/admin/schedules').then(r => r.data);
export const createSchedule          = (data) => api.post('/admin/schedules', data).then(r => r.data);
export const deleteSchedule          = (id)   => api.delete(`/admin/schedules/${id}`).then(r => r.data);

export const getReports              = (params) => api.get('/admin/reports', { params }).then(r => r.data);

export const getDayOffRequests       = ()     => api.get('/admin/dayoffs').then(r => r.data);
export const updateDayOffRequest     = (id,d) => api.put(`/admin/dayoffs/${id}`, d).then(r => r.data);

// Scheduling Overhaul
export const getClinicHours          = ()      => api.get('/admin/clinic-hours').then(r => r.data);
export const updateClinicHours       = (data)  => api.put('/admin/clinic-hours', data).then(r => r.data);

export const getDoctorSchedules      = ()      => api.get('/admin/doctor-schedules').then(r => r.data);
export const createDoctorSchedule    = (data)  => api.post('/admin/doctor-schedules', data).then(r => r.data);
export const updateDoctorSchedule    = (id,d)  => api.put(`/admin/doctor-schedules/${id}`, d).then(r => r.data);
export const deleteDoctorSchedule    = (id)    => api.delete(`/admin/doctor-schedules/${id}`).then(r => r.data);

export const getAdminDayOffRequests  = ()      => api.get('/admin/day-off-requests').then(r => r.data);
export const approveDayOffRequest    = (id,rem)=> api.put(`/admin/day-off-requests/${id}/approve`, { remarks: rem }).then(r => r.data);
export const rejectDayOffRequest     = (id,rem)=> api.put(`/admin/day-off-requests/${id}/reject`,  { remarks: rem }).then(r => r.data);

export const getSpecialSchedules     = ()      => api.get('/admin/special-schedules').then(r => r.data);
export const createSpecialSchedule   = (data)  => api.post('/admin/special-schedules', data).then(r => r.data);
export const updateSpecialSchedule   = (id,d)  => api.put(`/admin/special-schedules/${id}`, d).then(r => r.data);
export const deleteSpecialSchedule   = (id)    => api.delete(`/admin/special-schedules/${id}`).then(r => r.data);

export const getAvailableSlots       = (params)=> api.get('/booking/available-slots', { params }).then(r => r.data);
