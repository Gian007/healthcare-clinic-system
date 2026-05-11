import api from './axios';

export const getDashboardData = async () => {
  const response = await api.get('/patient/dashboard');
  return response.data;
};

export const bookAppointment = async (data) => {
  const response = await api.post('/patient/appointments', data);
  return response.data;
};
