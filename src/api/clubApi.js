import apiClient from './apiClient';

export const clubApi = {
  discoverClubs: () => {
    return apiClient.get('/clubs');
  },

  getClub: (clubId) => {
    return apiClient.get(`/clubs/${clubId}`);
  },

  createClub: (creatorId, clubData) => {
    return apiClient.post(`/clubs?creatorId=${creatorId}`, clubData);
  },

  updateClub: (clubId, creatorId, clubData) => {
    return apiClient.put(`/clubs/${clubId}?creatorId=${creatorId}`, clubData);
  },

  archiveClub: (clubId, creatorId) => {
    return apiClient.patch(`/clubs/${clubId}/archive?creatorId=${creatorId}`);
  },

  joinClub: (clubId, employeeId) => {
    return apiClient.post(`/clubs/${clubId}/members?employeeId=${employeeId}`);
  },

  leaveClub: (clubId, employeeId) => {
    return apiClient.delete(`/clubs/${clubId}/members?employeeId=${employeeId}`);
  },

  getMembers: (clubId) => {
    return apiClient.get(`/clubs/${clubId}/members`);
  },

  removeMember: (clubId, employeeId, creatorId) => {
    return apiClient.delete(`/clubs/${clubId}/members/${employeeId}?creatorId=${creatorId}`);
  },
};

export default clubApi;
