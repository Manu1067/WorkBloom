import apiClient from './apiClient';

export const eventApi = {
  discoverEvents: (type = null) => {
    return apiClient.get('/events', type ? { type } : null);
  },

  getEvent: (eventId) => {
    return apiClient.get(`/events/${eventId}`);
  },

  createEvent: (organizerId, eventData) => {
    return apiClient.post(`/events?organizerId=${organizerId}`, eventData);
  },

  updateEvent: (eventId, organizerId, eventData) => {
    return apiClient.put(`/events/${eventId}?organizerId=${organizerId}`, eventData);
  },

  cancelEvent: (eventId, organizerId) => {
    return apiClient.delete(`/events/${eventId}?organizerId=${organizerId}`);
  },

  getOrganizerEvents: (organizerId) => {
    return apiClient.get(`/events/organizer/${organizerId}`);
  },

  register: (eventId, employeeId) => {
    return apiClient.post(`/events/${eventId}/registrations`, { employeeId });
  },

  cancelRegistration: (eventId, employeeId) => {
    return apiClient.delete(`/events/${eventId}/registrations?employeeId=${employeeId}`);
  },

  getRegisteredEmployees: (eventId, organizerId) => {
    return apiClient.get(`/events/${eventId}/registrations`, { organizerId });
  },

  getEmployeeRegistrations: (employeeId) => {
    return apiClient.get(`/events/employee/${employeeId}/registrations`);
  },
};

export default eventApi;
