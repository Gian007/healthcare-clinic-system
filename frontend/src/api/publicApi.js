import api from './axios';

export const getDoctors       = () => api.get('/public/doctors').then(r => r.data);
export const getServices      = () => api.get('/public/services').then(r => r.data);
export const getQueue         = () => api.get('/public/queue').then(r => r.data);
export const getAnnouncements = () => api.get('/public/announcements').then(r => r.data);
