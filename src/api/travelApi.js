import apiClient from './apiClient';

export const travelApi = {
  // Destination Catalog
  listDestinations: (category = null) => {
    return apiClient.get('/travel/destinations', category ? { category } : null);
  },

  getDestination: (id) => {
    return apiClient.get(`/travel/destinations/${id}`);
  },

  getDestinationImages: (id) => {
    return apiClient.get(`/travel/destinations/${id}/images`);
  },

  // Recommendations
  getRecommendation: (employeeId) => {
    return apiClient.get('/travel/recommend', { employeeId });
  },

  getRecommendationsFromAnswers: (employeeId, selectedOptionIds) => {
    return apiClient.post('/travel/recommendations', {
      employeeId,
      selectedOptionIds,
    });
  },

  // Questionnaire
  getQuestions: () => {
    return apiClient.get('/travel/questions');
  },

  // Preferences
  savePreferences: (employeeId, preferencesData) => {
    return apiClient.post(`/travel/preferences?employeeId=${employeeId}`, preferencesData);
  },

  getPreferences: (employeeId) => {
    return apiClient.get('/travel/preferences', { employeeId });
  },

  // Route Optimization
  optimizeRoute: (destinationIds) => {
    return apiClient.post('/travel/routes/optimize', destinationIds);
  },
};

export default travelApi;
