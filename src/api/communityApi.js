import apiClient from './apiClient';

export const communityApi = {
  createPost: (authorId, postData) => {
    return apiClient.post(`/community/posts?authorId=${authorId}`, postData);
  },

  getFeed: (viewerId = null) => {
    return apiClient.get('/community/posts', viewerId ? { viewerId } : null);
  },

  getPost: (postId, viewerId = null) => {
    return apiClient.get(`/community/posts/${postId}`, viewerId ? { viewerId } : null);
  },

  // Ownership is enforced server-side from the JWT, so no authorId is sent
  // (a client-supplied id must never be treated as proof of authorship).
  updatePost: (postId, postData) => {
    return apiClient.put(`/community/posts/${postId}`, postData);
  },

  deletePost: (postId, authorId) => {
    return apiClient.delete(`/community/posts/${postId}?authorId=${authorId}`);
  },

  likePost: (postId, employeeId) => {
    return apiClient.post(`/community/posts/${postId}/likes?employeeId=${employeeId}`);
  },

  unlikePost: (postId, employeeId) => {
    return apiClient.delete(`/community/posts/${postId}/likes?employeeId=${employeeId}`);
  },

  addComment: (postId, authorId, commentData) => {
    return apiClient.post(`/community/posts/${postId}/comments?authorId=${authorId}`, commentData);
  },

  getComments: (postId) => {
    return apiClient.get(`/community/posts/${postId}/comments`);
  },

  updateComment: (postId, commentId, authorId, commentData) => {
    return apiClient.put(`/community/posts/${postId}/comments/${commentId}?authorId=${authorId}`, commentData);
  },

  deleteComment: (postId, commentId, authorId) => {
    return apiClient.delete(`/community/posts/${postId}/comments/${commentId}?authorId=${authorId}`);
  },
};

export default communityApi;
