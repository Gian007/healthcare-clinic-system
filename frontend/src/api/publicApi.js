import api from './axios';

export const getClinicStatus  = () => api.get('/public/clinic-status').then(r => r.data);

export const getDoctors       = () => api.get('/public/doctors').then(r => r.data);
export const getServices      = () => api.get('/public/services').then(r => r.data);
export const getQueue         = () => api.get('/public/queue').then(r => r.data);
export const getAnnouncements = () => api.get('/public/announcements').then(r => r.data);

export const getAvailableSlots = (doctorId, date, serviceId) => 
    api.get('/booking/available-slots', { 
        params: { doctor_id: doctorId, date, service_id: serviceId } 
    }).then(r => r.data);

export const getSettings = () => api.get('/public/settings').then(r => r.data);
