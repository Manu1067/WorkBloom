import apiClient from './apiClient';

export const chatApi = {
  startConversation: (employeeId, conversationData) => {
    return apiClient.post(`/chat/conversations?employeeId=${employeeId}`, conversationData);
  },

  getConversations: (employeeId) => {
    return apiClient.get('/chat/conversations', { employeeId });
  },

  getConversation: (conversationId, employeeId) => {
    return apiClient.get(`/chat/conversations/${conversationId}`, { employeeId });
  },

  getMessages: (conversationId, employeeId) => {
    return apiClient.get(`/chat/conversations/${conversationId}/messages`, { employeeId });
  },

  sendMessage: (conversationId, senderId, messageData) => {
    return apiClient.post(`/chat/conversations/${conversationId}/messages?senderId=${senderId}`, messageData);
  },

  markConversationRead: (conversationId, employeeId) => {
    return apiClient.post(`/chat/conversations/${conversationId}/read?employeeId=${employeeId}`);
  },

  leaveConversation: (conversationId, employeeId) => {
    return apiClient.delete(`/chat/conversations/${conversationId}/participants/${employeeId}`);
  },
};

export default chatApi;
