import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';
import { getToken, getEmployeeId, clearSession, setSession } from '../api/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getToken());
  const [employeeId, setEmployeeId] = useState(() => getEmployeeId());
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('workbloom_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  // Sync state to local storage
  useEffect(() => {
    if (user) {
      localStorage.setItem('workbloom_user', JSON.stringify(user));
    }
  }, [user]);

  // Handle unauthorized event dispatched by apiClient (401 response)
  useEffect(() => {
    const handleUnauthorized = () => {
      setToken(null);
      setEmployeeId(null);
      setUser(null);
      clearSession();
    };

    window.addEventListener('workbloom:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('workbloom:unauthorized', handleUnauthorized);
  }, []);

  const handleLogin = useCallback(async (credentials) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(credentials);
      const authToken = response?.token || response?.accessToken || response?.jwt;
      const u = response?.user || response;
      const empId = response?.employeeId || response?.id || u?.employeeId || u?.id;

      setSession(response);
      setToken(authToken || getToken());
      setEmployeeId(empId ? String(empId) : getEmployeeId());
      setUser(u);
      return response;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRegister = useCallback(async (userData) => {
    setIsLoading(true);
    try {
      const response = await authApi.register(userData);
      const authToken = response?.token || response?.accessToken || response?.jwt;
      const u = response?.user || response;
      const empId = response?.employeeId || response?.id || u?.employeeId || u?.id;

      setSession(response);
      setToken(authToken || getToken());
      setEmployeeId(empId ? String(empId) : getEmployeeId());
      setUser(u);
      return response;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleLogout = useCallback(() => {
    clearSession();
    setToken(null);
    setEmployeeId(null);
    setUser(null);
    authApi.logout();
  }, []);

  const updateUser = useCallback((updatedFields) => {
    setUser((prev) => {
      const next = { ...prev, ...updatedFields };
      localStorage.setItem('workbloom_user', JSON.stringify(next));
      return next;
    });
  }, []);

  const value = {
    user,
    token,
    employeeId,
    isAuthenticated: Boolean(token),
    isLoading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
