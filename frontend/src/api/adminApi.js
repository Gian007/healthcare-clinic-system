import api from './axios';

// ============ Dashboard ============
export const getDashboardData = async () => {
  const response = await api.get('/admin/dashboard');
  return response.data;
};

// ============ Patients ============
export const getPatients = async () => {
  const response = await api.get('/admin/patients');
  return response.data;
};

export const updatePatientStatus = async (id, status) => {
  const response = await api.put(`/admin/patients/${id}/status`, { status });
  return response.data;
};

// ============ Doctors ============
export const getDoctors = async () => {
  const response = await api.get('/admin/doctors');
  return response.data;
};

export const updateDoctorStatus = async (id, status) => {
  const response = await api.put(`/admin/doctors/${id}/status`, { status });
  return response.data;
};

// ============ Staff ============
export const getStaff = async () => {
  const response = await api.get('/admin/staff');
  return response.data;
};

export const createStaff = async (data) => {
  const response = await api.post('/admin/staff', data);
  return response.data;
};

export const updateStaff = async (id, data) => {
  const response = await api.put(`/admin/staff/${id}`, data);
  return response.data;
};

export const deleteStaff = async (id) => {
  const response = await api.delete(`/admin/staff/${id}`);
  return response.data;
};

// ============ Services ============
export const getServices = async () => {
  const response = await api.get('/admin/services');
  return response.data;
};

export const createService = async (data) => {
  const response = await api.post('/admin/services', data);
  return response.data;
};

export const updateService = async (id, data) => {
  const response = await api.put(`/admin/services/${id}`, data);
  return response.data;
};

export const deleteService = async (id) => {
  const response = await api.delete(`/admin/services/${id}`);
  return response.data;
};

// ============ Schedules ============
export const getSchedules = async () => {
  const response = await api.get('/admin/schedules');
  return response.data;
};

export const createSchedule = async (data) => {
  const response = await api.post('/admin/schedules', data);
  return response.data;
};

export const updateSchedule = async (id, data) => {
  const response = await api.put(`/admin/schedules/${id}`, data);
  return response.data;
};

export const deleteSchedule = async (id) => {
  const response = await api.delete(`/admin/schedules/${id}`);
  return response.data;
};

// ============ Notifications ============
export const getNotificationTemplates = async () => {
  const response = await api.get('/admin/notifications');
  return response.data;
};

export const createNotificationTemplate = async (data) => {
  const response = await api.post('/admin/notifications', data);
  return response.data;
};

export const updateNotificationTemplate = async (id, data) => {
  const response = await api.put(`/admin/notifications/${id}`, data);
  return response.data;
};

export const deleteNotificationTemplate = async (id) => {
  const response = await api.delete(`/admin/notifications/${id}`);
  return response.data;
};

// ============ Reports ============
export const getReports = async () => {
  const response = await api.get('/admin/reports');
  return response.data;
};
