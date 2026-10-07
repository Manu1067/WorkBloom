/**
 * WorkBloom Centralized API Client
 * Intercepts, formats, and executes requests against the Spring Boot Backend.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://workbloom-backend.onrender.com/api';

export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const getToken = () => localStorage.getItem('workbloom_token');
export const getEmployeeId = () => localStorage.getItem('workbloom_employee');

/**
 * Writes the REAL Employee id (resolved via GET /api/employees/me, see
 * AuthContext) into the same localStorage key every page already reads
 * via getEmployeeId(). This intentionally overwrites whatever setSession()
 * guessed at login time (AuthResponse.id is the auth User's id, a
 * different entity/ID sequence than Employee - see AuthContext for the
 * full explanation).
 */
export const setEmployeeId = (employeeId) => {
  if (employeeId === null || employeeId === undefined) {
    localStorage.removeItem('workbloom_employee');
  } else {
    localStorage.setItem('workbloom_employee', String(employeeId));
  }
};

export const setSession = (payload) => {
  const token = payload?.token || payload?.accessToken || payload?.jwt;
  if (token) {
    localStorage.setItem('workbloom_token', token);
  }
  
  // Best-effort placeholder ONLY: AuthResponse has no employeeId field,
  // so this may capture the auth User's id (a different entity/ID
  // sequence than Employee) rather than the real employeeId. AuthContext
  // immediately overwrites this via setEmployeeId() once it resolves the
  // real value from GET /api/employees/me - see AuthContext.jsx.
  const empId = payload?.employeeId || payload?.id || payload?.user?.employeeId || payload?.user?.id;
  if (empId) {
    localStorage.setItem('workbloom_employee', String(empId));
  }

  if (payload?.user) {
    localStorage.setItem('workbloom_user', JSON.stringify(payload.user));
  } else if (payload && typeof payload === 'object' && !payload.token && !payload.accessToken) {
    localStorage.setItem('workbloom_user', JSON.stringify(payload));
  }
};

export const clearSession = () => {
  localStorage.removeItem('workbloom_token');
  localStorage.removeItem('workbloom_employee');
  localStorage.removeItem('workbloom_user');
};

/**
 * Core HTTP Request Wrapper
 */
export async function request(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  // FormData (multipart uploads) must NOT carry a JSON Content-Type: the
  // browser has to set "multipart/form-data; boundary=..." itself.
  if (typeof FormData !== 'undefined' && options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);
    const contentType = response.headers.get('content-type') || '';
    
    let data = null;
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = text ? { message: text } : null;
    }

    if (!response.ok) {
      const status = response.status;
      let message = data?.message || data?.error || `Request failed with status ${status}`;

      if (status === 401) {
        message = data?.message || 'Session expired. Please sign in again.';
        clearSession();
        window.dispatchEvent(new CustomEvent('workbloom:unauthorized'));
      } else if (status === 403) {
        message = data?.message || 'You do not have permission to access this resource.';
      } else if (status === 404) {
        message = data?.message || 'Requested resource not found.';
      } else if (status === 409) {
        message = data?.message || 'A conflict occurred with the current state.';
      } else if (status === 500) {
        message = data?.message || 'Server error. Please try again later.';
      } else if (status === 503) {
        message = data?.message || 'Service temporarily unavailable. Please try again later.';
      }

      throw new ApiError(message, status, data);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(error.message || 'Network error. Please check your connection.', 0);
  }
}

export const apiClient = {
  get: (endpoint, params = null, options = {}) => {
    let url = endpoint;
    if (params) {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query.append(key, value);
        }
      });
      const queryString = query.toString();
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    }
    return request(url, { ...options, method: 'GET' });
  },

  post: (endpoint, body = null, options = {}) => {
    return request(endpoint, { ...options, method: 'POST', body });
  },

  put: (endpoint, body = null, options = {}) => {
    return request(endpoint, { ...options, method: 'PUT', body });
  },

  patch: (endpoint, body = null, options = {}) => {
    return request(endpoint, { ...options, method: 'PATCH', body });
  },

  delete: (endpoint, options = {}) => {
    return request(endpoint, { ...options, method: 'DELETE' });
  },
};

export default apiClient;
