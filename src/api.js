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
    throw new Error(message)
  }
  return body
}

export const auth = {
  login: (data) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  forgotPassword: (data) => apiRequest('/auth/forgot-password', { method: 'POST', body: JSON.stringify(data) }),
}

export const features = {
  dashboard: (employeeId) => apiRequest(`/dashboard/employee/${employeeId}`),
  health: () => apiRequest('/integrations/health'),
  destinations: () => apiRequest('/travel/destinations'),
  optimizeRoute: (data) => apiRequest('/travel/routes/optimize', { method: 'POST', body: JSON.stringify(data) }),
  events: () => apiRequest('/events'),
  clubs: () => apiRequest('/clubs'),
  courses: () => apiRequest('/learning/courses'),
  impact: () => apiRequest('/impact/events'),
  community: () => apiRequest('/community/posts'),
  conversations: () => apiRequest('/chat/conversations'),
  notifications: (employeeId) => apiRequest(`/notifications/employee/${employeeId}/unread`),
  recordMood: (employeeId, data) => apiRequest(`/wellness/mood?employeeId=${employeeId}`, { method: 'POST', body: JSON.stringify(data) }),
  recordWellness: (employeeId, data) => apiRequest(`/wellness?employeeId=${employeeId}`, { method: 'POST', body: JSON.stringify(data) }),
  moodHistory: (employeeId) => apiRequest(`/wellness/mood?employeeId=${employeeId}`),
  wellnessHistory: (employeeId) => apiRequest(`/wellness?employeeId=${employeeId}`),
  travelPreferences: (employeeId) => apiRequest(`/travel/preferences?employeeId=${employeeId}`),
  saveTravelPreferences: (employeeId, data) => apiRequest(`/travel/preferences?employeeId=${employeeId}`, { method: 'POST', body: JSON.stringify(data) }),
}