const API_BASE = '/api'

export const getToken = () => localStorage.getItem('workbloom_token')

export const setSession = (payload) => {
  const token = payload?.token || payload?.accessToken || payload?.jwt
  if (token) localStorage.setItem('workbloom_token', token)
  if (payload?.employeeId || payload?.id || payload?.user?.employeeId || payload?.user?.id) {
    localStorage.setItem(
      'workbloom_employee',
      String(payload.employeeId || payload.id || payload.user?.employeeId || payload.user?.id),
    )
  }
}

export const clearSession = () => {
  localStorage.removeItem('workbloom_token')
  localStorage.removeItem('workbloom_employee')
}

export const apiRequest = async (path, options = {}) => {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers })
  const contentType = response.headers.get('content-type') || ''
  const body = contentType.includes('application/json') ? await response.json() : await response.text()
  if (!response.ok) {
    const message = body?.message || body?.error || `Request failed (${response.status})`
    const error = new Error(message)
    error.status = response.status
    error.body = body
    throw error
  }
  return body
}

export const auth = {
  login: (data) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  forgotPassword: (data) => apiRequest('/auth/forgot-password', { method: 'POST', body: JSON.stringify(data) }),
  switchRole: (role) => apiRequest('/auth/switch-role', { method: 'POST', body: JSON.stringify({ role }) }),
}

export const employees = {
  list: (params = {}) => {
    const query = new URLSearchParams()
    if (params.search) query.append('search', params.search)
    if (params.department) query.append('department', params.department)
    return apiRequest(`/employees${query.toString() ? '?' + query.toString() : ''}`)
  },
  getById: (id) => apiRequest(`/employees/${id}`),
}

export const features = {
  dashboard: (employeeId) => apiRequest(`/dashboard/employee/${employeeId}`),
  health: () => apiRequest('/integrations/health'),

  // Events
  events: () => apiRequest('/events'),
  rsvpEvent: (id) => apiRequest(`/events/${id}/rsvp`, { method: 'POST' }),
  createEvent: (data) => apiRequest('/events', { method: 'POST', body: JSON.stringify(data) }),

  // Community
  community: () => apiRequest('/community/posts'),
  createPost: (data) => apiRequest('/community/posts', { method: 'POST', body: JSON.stringify(data) }),
  likePost: (id) => apiRequest(`/community/posts/${id}/like`, { method: 'POST' }),

  // Recognition
  recognitions: () => apiRequest('/recognition'),
  sendRecognition: (data) => apiRequest('/recognition', { method: 'POST', body: JSON.stringify(data) }),

  // Buddy
  buddyStatus: () => apiRequest('/buddy/status'),
  sendBuddyRequest: (data) => apiRequest('/buddy/request', { method: 'POST', body: JSON.stringify(data) }),
  respondBuddyRequest: (id, action) => apiRequest(`/buddy/request/${id}/respond`, { method: 'POST', body: JSON.stringify({ action }) }),

  // Learning
  courses: () => apiRequest('/learning/courses'),
  enrollCourse: (id) => apiRequest(`/learning/courses/${id}/enroll`, { method: 'POST' }),

  // Clubs
  clubs: () => apiRequest('/clubs'),
  toggleClub: (id) => apiRequest(`/clubs/${id}/toggle`, { method: 'POST' }),

  // Impact
  impact: () => apiRequest('/impact/events'),
  volunteerImpact: (id) => apiRequest(`/impact/events/${id}/volunteer`, { method: 'POST' }),

  // Chat
  conversations: () => apiRequest('/chat/conversations'),
  sendMessage: (convId, text) => apiRequest(`/chat/conversations/${convId}/messages`, { method: 'POST', body: JSON.stringify({ text }) }),

  // Wellness
  recordMood: (employeeId, data) => apiRequest(`/wellness/mood?employeeId=${employeeId}`, { method: 'POST', body: JSON.stringify(data) }),
  moodHistory: (employeeId) => apiRequest(`/wellness/mood?employeeId=${employeeId}`),
  recordWellness: (employeeId, data) => apiRequest(`/wellness?employeeId=${employeeId}`, { method: 'POST', body: JSON.stringify(data) }),
  wellnessHistory: (employeeId) => apiRequest(`/wellness?employeeId=${employeeId}`),
  counsellingSessions: (employeeId) => apiRequest(`/wellness/counselling?employeeId=${employeeId}`),
  bookCounselling: (employeeId, data) => apiRequest(`/wellness/counselling?employeeId=${employeeId}`, { method: 'POST', body: JSON.stringify(data) }),
  aiInsight: (employeeId) => apiRequest('/wellness/ai-insight', { method: 'POST', body: JSON.stringify({ employeeId }) }),

  // Travel
  destinations: (mood) => apiRequest(`/travel/destinations${mood ? `?mood=${encodeURIComponent(mood)}` : ''}`),
  travelAiRecommend: (data) => apiRequest('/travel/ai-recommendation', { method: 'POST', body: JSON.stringify(data) }),
  optimizeRoute: (data) => apiRequest('/travel/routes/optimize', { method: 'POST', body: JSON.stringify(data) }),
  travelPreferences: (employeeId) => apiRequest(`/travel/preferences?employeeId=${employeeId}`),
  saveTravelPreferences: (employeeId, data) => apiRequest(`/travel/preferences?employeeId=${employeeId}`, { method: 'POST', body: JSON.stringify(data) }),

  // Notifications
  notifications: (employeeId) => apiRequest(`/notifications/employee/${employeeId}`),
  markNotificationRead: (id) => apiRequest(`/notifications/${id}/read`, { method: 'POST' }),
  markAllNotificationsRead: () => apiRequest('/notifications/read-all', { method: 'POST' }),

  // Analytics
  personalAnalytics: (employeeId) => apiRequest(`/analytics/personal/${employeeId}`),
  companyAnalytics: () => apiRequest('/analytics/company'),
}
