import apiClient from './apiClient';

export const wellnessApi = {
  // Mood Tracking
  // NOTE: apiClient.post() has no `params` option (only `.get()` does) -
  // passing { params: { employeeId } } here previously did nothing, so
  // employeeId (a required @RequestParam on the backend) was never
  // actually sent and every mood check-in failed with a 400.
  recordMood: (employeeId, moodData) => {
    return apiClient.post(`/wellness/mood?employeeId=${employeeId}`, moodData);
  },

  getMoodHistory: (employeeId) => {
    return apiClient.get('/wellness/mood', { employeeId });
  },

  // Wellness Log
  recordWellness: (employeeId, wellnessData) => {
    return apiClient.post(`/wellness?employeeId=${employeeId}`, wellnessData);
  },

  getWellnessHistory: (employeeId) => {
    return apiClient.get('/wellness', { employeeId });
  },

  // Counselling
  bookCounselling: (employeeId, counsellingData) => {
    return apiClient.post(`/counselling?employeeId=${employeeId}`, counsellingData);
  },

  getEmployeeCounselling: (employeeId) => {
    return apiClient.get(`/counselling/employee/${employeeId}`);
  },

  getAllCounselling: () => {
    return apiClient.get('/counselling');
  },

  approveCounselling: (id) => {
    return apiClient.patch(`/counselling/${id}/approve`);
  },

  rejectCounselling: (id, reason = '') => {
    return apiClient.patch(`/counselling/${id}/reject`, { reason });
  },

  cancelCounselling: (id, employeeId) => {
    return apiClient.patch(`/counselling/${id}/cancel?employeeId=${employeeId}`);
  },

  completeCounselling: (id) => {
    return apiClient.patch(`/counselling/${id}/complete`);
  },

  // AI Wellness Analysis
  // `options` is optional (e.g. { signal } to let the UI stop waiting); the
  // endpoint, request body and response contract are unchanged.
  analyzeAiWellness: (employeeId, requestData = {}, options = {}) => {
    return apiClient.post(`/ai/wellness/analyze?employeeId=${employeeId}`, requestData, options);
  },
};

export default wellnessApi;
