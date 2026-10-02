import apiClient from './apiClient';

export const recognitionApi = {
  createRecognition: (authorId, recognitionData) => {
    return apiClient.post(`/recognition?authorId=${authorId}`, recognitionData);
  },

  getFeed: () => {
    return apiClient.get('/recognition/feed');
  },

  getEmployeeRecognitions: (employeeId) => {
    return apiClient.get(`/recognition/employee/${employeeId}`);
  },

  createBadge: (badgeData) => {
    return apiClient.post('/recognition/badges', badgeData);
  },

  getAllBadges: () => {
    return apiClient.get('/recognition/badges');
  },

  addReaction: (recognitionId, employeeId, reactionData) => {
    return apiClient.post(`/recognition/${recognitionId}/reactions?employeeId=${employeeId}`, reactionData);
  },

  removeReaction: (recognitionId, employeeId) => {
    return apiClient.delete(`/recognition/${recognitionId}/reactions?employeeId=${employeeId}`);
  },

  // Backend @RequestParam name is `employeeId` here (not `authorId`,
  // despite the endpoint being "add comment") - see CommentController.
  addComment: (recognitionId, authorId, commentData) => {
    return apiClient.post(`/recognition/${recognitionId}/comments?employeeId=${authorId}`, commentData);
  },

  getComments: (recognitionId) => {
    return apiClient.get(`/recognition/${recognitionId}/comments`);
  },

  deleteComment: (recognitionId, commentId, authorId) => {
    return apiClient.delete(`/recognition/${recognitionId}/comments/${commentId}?employeeId=${authorId}`);
  },
};

export default recognitionApi;
