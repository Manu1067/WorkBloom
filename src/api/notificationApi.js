import apiClient from './apiClient';

export const notificationApi = {
  create: (notificationData) => {
    return apiClient.post('/notifications', notificationData);
  },

  getMyNotifications: (employeeId) => {
    return apiClient.get(`/notifications/employee/${employeeId}`);
  },

  getUnreadNotifications: (employeeId) => {
    return apiClient.get(`/notifications/employee/${employeeId}/unread`);
  },

  getUnreadCount: (employeeId) => {
    return apiClient.get(`/notifications/employee/${employeeId}/unread-count`);
  },

  markAsRead: (notificationId) => {
    return apiClient.patch(`/notifications/${notificationId}/read`);
  },

  markAllAsRead: (employeeId) => {
    return apiClient.patch(`/notifications/employee/${employeeId}/read-all`);
  },

  deleteNotification: (notificationId) => {
    return apiClient.delete(`/notifications/${notificationId}`);
  },
};

export default notificationApi;
