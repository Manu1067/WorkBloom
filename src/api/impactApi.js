import apiClient from './apiClient';

export const impactApi = {
  createEvent: (eventData) => {
    return apiClient.post('/impact/events', eventData);
  },

  /**
   * Step 1 of the optional-image flow: multipart upload (HR/ADMIN only).
   * Resolves to { imageUrl } - a relative URL like /uploads/impact/{uuid}.png
   * that is then sent as `imageUrl` in createEvent(). apiClient leaves
   * FormData bodies untouched, so the browser sets the multipart boundary.
   */
  uploadEventImage: (file) => {
    const form = new FormData();
    form.append('file', file);
    return apiClient.post('/impact/events/image', form);
  },

  getActiveEvents: () => {
    return apiClient.get('/impact/events');
  },

  registerForEvent: (employeeId, registrationData) => {
    return apiClient.post(`/impact/events/register?employeeId=${employeeId}`, registrationData);
  },

  getEmployeeRegistrations: (employeeId) => {
    return apiClient.get('/impact/registrations', { employeeId });
  },

  cancelRegistration: (registrationId, employeeId) => {
    return apiClient.put(`/impact/registrations/${registrationId}/cancel?employeeId=${employeeId}`);
  },
};

export default impactApi;
