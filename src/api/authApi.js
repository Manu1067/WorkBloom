import apiClient, { setSession, clearSession } from './apiClient';

export const authApi = {
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    setSession(response);
    return response;
  },

  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    setSession(response);
    return response;
  },

  forgotPassword: (data) => {
    return apiClient.post('/auth/forgot-password', data);
  },

  resetPassword: (data) => {
    return apiClient.post('/auth/reset-password', data);
  },

  changePassword: (data) => {
    return apiClient.post('/auth/change-password', data);
  },

  logout: () => {
    clearSession();
    return Promise.resolve();
  },
};

export default authApi;
