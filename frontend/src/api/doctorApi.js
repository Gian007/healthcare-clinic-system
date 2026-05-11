import api from './axios';

export const getDashboardData = async () => {
  const response = await api.get('/doctor/dashboard');
  return response.data;
};

export const getAppointments = async () => {
  const response = await api.get('/doctor/appointments');
  return response.data;
};

export const updateAppointmentStatus = async (id, data) => {
  const response = await api.put(`/doctor/appointments/${id}/status`, data);
  return response.data;
};
