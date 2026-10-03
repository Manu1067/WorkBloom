import apiClient from './apiClient';

export const dashboardApi = {
  // Current user's own dashboard. The backend resolves the employee from
  // the JWT (email -> Employee), so no id is sent or guessed client-side.
  getMyDashboard: () => {
    return apiClient.get('/dashboard/employee/me');
  },

  getEmployeeDashboard: (employeeId) => {
    return apiClient.get(`/dashboard/employee/${employeeId}`);
  },

  getAdminDashboard: () => {
    return apiClient.get('/dashboard/admin');
  },
};

export default dashboardApi;
