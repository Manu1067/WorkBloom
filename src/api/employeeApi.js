import apiClient from './apiClient';

export const employeeApi = {
  /**
   * Resolves the currently authenticated user's own Employee record via
   * their JWT (no ID needed/guessable). This is the correct source of
   * truth for "my employeeId" - AuthResponse only carries the auth
   * User's id, which is a different entity/ID sequence than Employee.
   * Throws a 404 ApiError if this account has no linked Employee yet
   * (e.g. a just-self-registered user HR hasn't onboarded).
   */
  getMyProfile: () => {
    return apiClient.get('/employees/me');
  },

  getAll: (params = {}) => {
    return apiClient.get('/employees', params);
  },

  getById: (id) => {
    return apiClient.get(`/employees/${id}`);
  },

  create: (data) => {
    return apiClient.post('/employees', data);
  },

  update: (id, data) => {
    return apiClient.put(`/employees/${id}`, data);
  },

  /**
   * Update Employee Profile
   * Note: Spring Boot DTO allows editing 'phone' and 'profileImage' for standard profile updates.
   */
  updateProfile: (id, data) => {
    return apiClient.put(`/employees/${id}/profile`, data);
  },

  updateStatus: (id, data) => {
    return apiClient.patch(`/employees/${id}/status`, data);
  },

  deactivate: (id) => {
    return apiClient.delete(`/employees/${id}`);
  },
};

export default employeeApi;
