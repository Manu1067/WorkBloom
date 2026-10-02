import apiClient from './apiClient';

export const analyticsApi = {
  getOverview: () => {
    return apiClient.get('/analytics/overview');
  },
};

export default analyticsApi;
