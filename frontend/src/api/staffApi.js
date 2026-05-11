import api from './axios';

export const getDashboardData = async () => {
  const response = await api.get('/staff/dashboard');
  return response.data;
};
