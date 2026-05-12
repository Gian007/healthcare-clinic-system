import api from './axios';

export const login          = (data) => api.post('/login', data).then(r => r.data);
export const registerPatient= (data) => api.post('/register', data).then(r => r.data);
export const logout         = ()     => api.post('/logout').then(r => r.data);
export const getCurrentUser = ()     => api.get('/me').then(r => r.data);
