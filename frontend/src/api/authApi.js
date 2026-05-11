import api from './axios';

export const login = async (credentials) => {
  const response = await api.post('/login', credentials);
  return response.data;
};

export const registerPatient = async (patientData) => {
  const response = await api.post('/register', patientData);
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/logout');
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/me');
  return response.data;
};
