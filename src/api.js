import { apiClient, getToken, setSession, clearSession } from './api/apiClient';
import { authApi } from './api/authApi';

export { getToken, setSession, clearSession };

export const apiRequest = async (path, options = {}) => {
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : null;
  
  if (method === 'GET') {
    return apiClient.get(path, null, options);
  } else if (method === 'POST') {
    return apiClient.post(path, body, options);
  } else if (method === 'PUT') {
    return apiClient.put(path, body, options);
  } else if (method === 'PATCH') {
    return apiClient.patch(path, body, options);
  } else if (method === 'DELETE') {
    return apiClient.delete(path, options);
  }
  return apiClient.get(path, null, options);
};

export const auth = {
  login: (data) => authApi.login(data),
  register: (data) => authApi.register(data),
  forgotPassword: (data) => authApi.forgotPassword(data),
};

export const employees = {
  list: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.department) query.append('department', params.department);
    return apiClient.get(`/employees${query.toString() ? '?' + query.toString() : ''}`);
  },
  getById: (id) => apiClient.get(`/employees/${id}`),
};

export const features = {
  dashboard: (employeeId) => apiClient.get(`/dashboard/employee/${employeeId}`),
  health: () => Promise.resolve({ status: 'UP' }),

  // Events
  events: () => apiClient.get('/events'),
  rsvpEvent: (id) => apiClient.post(`/events/${id}/registrations`),
  createEvent: (data) => apiClient.post('/events', data),

  // Community
  community: () => apiClient.get('/community/posts'),
  createPost: (data) => apiClient.post('/community/posts', data),
  likePost: (id) => apiClient.post(`/community/posts/${id}/likes`),

  // Recognition
  recognitions: () => apiClient.get('/recognition/feed'),
  sendRecognition: (data) => apiClient.post('/recognition', data),

  // Buddy
  buddyStatus: (employeeId) => apiClient.get(`/buddy/my-buddy${employeeId ? `?employeeId=${employeeId}` : ''}`),
  sendBuddyRequest: (data) => apiClient.post('/buddy/request', data),
  respondBuddyRequest: (id, action) => apiClient.put(`/buddy/request/${id}/${action}`),

  // Learning
  courses: () => apiClient.get('/learning/courses'),
  enrollCourse: (id) => apiClient.post('/learning/courses/enroll', { courseId: id }),

  // Clubs
  clubs: () => apiClient.get('/clubs'),
  toggleClub: (id, employeeId) => apiClient.post(`/clubs/${id}/members${employeeId ? `?employeeId=${employeeId}` : ''}`),

  // Impact
  impact: () => apiClient.get('/impact/events'),
  volunteerImpact: (id) => apiClient.post('/impact/events/register', { eventId: id }),

  // Chat
  conversations: (employeeId) => apiClient.get('/chat/conversations', employeeId ? { employeeId } : null),
  sendMessage: (convId, text, senderId) => apiClient.post(`/chat/conversations/${convId}/messages${senderId ? `?senderId=${senderId}` : ''}`, { text }),

  // Wellness
  recordMood: (employeeId, data) => apiClient.post(`/wellness/mood?employeeId=${employeeId}`, data),
  moodHistory: (employeeId) => apiClient.get(`/wellness/mood?employeeId=${employeeId}`),
  recordWellness: (employeeId, data) => apiClient.post(`/wellness?employeeId=${employeeId}`, data),
  wellnessHistory: (employeeId) => apiClient.get(`/wellness?employeeId=${employeeId}`),
  counsellingSessions: (employeeId) => apiClient.get(`/counselling/employee/${employeeId}`),
  bookCounselling: (employeeId, data) => apiClient.post('/counselling', { ...data, employeeId }),
  aiInsight: (employeeId) => apiClient.post(`/ai/wellness/analyze?employeeId=${employeeId}`, {}),

  // Travel
  destinations: (mood) => apiClient.get('/travel/destinations', mood ? { category: mood } : null),
  travelAiRecommend: (data) => apiClient.post('/travel/recommendations', data),
  optimizeRoute: (data) => apiClient.post('/travel/routes/optimize', data),
  travelPreferences: (employeeId) => apiClient.get('/travel/preferences', { employeeId }),
  saveTravelPreferences: (employeeId, data) => apiClient.post(`/travel/preferences?employeeId=${employeeId}`, data),

  // Notifications
  notifications: (employeeId) => apiClient.get(`/notifications/employee/${employeeId}`),
  markNotificationRead: (id) => apiClient.patch(`/notifications/${id}/read`),
  markAllNotificationsRead: (employeeId) => apiClient.patch(`/notifications/employee/${employeeId}/read-all`),

  // Analytics
  personalAnalytics: () => apiClient.get('/analytics/overview'),
  companyAnalytics: () => apiClient.get('/analytics/overview'),
};

export default apiRequest;
