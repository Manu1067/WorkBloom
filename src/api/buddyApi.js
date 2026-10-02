import apiClient from './apiClient';

export const buddyApi = {
  sendRequest: (requesterId, requestData) => {
    return apiClient.post(`/buddy/request?requesterId=${requesterId}`, requestData);
  },

  getReceivedRequests: (employeeId) => {
    return apiClient.get('/buddy/requests/received', { employeeId });
  },

  getSentRequests: (employeeId) => {
    return apiClient.get('/buddy/requests/sent', { employeeId });
  },

  acceptRequest: (requestId, employeeId) => {
    return apiClient.put(`/buddy/request/${requestId}/accept?employeeId=${employeeId}`);
  },

  rejectRequest: (requestId, employeeId) => {
    return apiClient.put(`/buddy/request/${requestId}/reject?employeeId=${employeeId}`);
  },

  getMyBuddy: (employeeId) => {
    return apiClient.get('/buddy/my-buddy', { employeeId });
  },
};

export default buddyApi;
