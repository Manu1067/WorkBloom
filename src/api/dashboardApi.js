import apiClient from './apiClient';

export const dashboardApi = {
  getEmployeeDashboard: (employeeId) => {
    return apiClient.get(`/dashboard/employee/${employeeId}`);
  },

  getAdminDashboard: () => {
    return apiClient.get('/dashboard/admin');
  },
};

export default dashboardApi;
