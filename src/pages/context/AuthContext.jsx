import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';
import { employeeApi } from '../api/employeeApi';
import { getToken, getEmployeeId, clearSession, setSession, setEmployeeId } from '../api/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getToken());
  const [employeeId, setEmployeeIdState] = useState(() => getEmployeeId());
  const [employee, setEmployee] = useState(null);
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('workbloom_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  // True only during the initial mount-time resolution when a token
  // already exists (returning session / page refresh). Lets MainApp
  // hold off rendering pages until the real employeeId is known,
  // instead of pages briefly reading a stale/guessed value.
  const [isRestoringSession, setIsRestoringSession] = useState(() => Boolean(getToken()));
  // Distinguishes "we haven't checked yet" from "checked, no linked
  // Employee record" - lets the UI show a clear message instead of
  // silently failing every downstream API call with employeeId=null.
  const [employeeLinkStatus, setEmployeeLinkStatus] = useState('unknown');

  /**
   * Resolves the REAL employeeId + Employee profile via GET
   * /api/employees/me (the caller's own record, from their JWT - never
   * guessed). This is the fix for a real bug: AuthResponse only returns
   * the auth User's `id`, which is a separate entity/ID sequence from
   * Employee (no FK between them; linked only by unique email). Every
   * other backend module (Dashboard, Wellness, Travel, Notifications,
   * Buddy, etc.) expects the Employee id, so guessing wrong here breaks
   * every subsequent API call the app makes.
   *
   * A 404 here is an expected, real outcome (not a bug) for an account
   * that has registered but has no Employee record yet - registration
   * only creates a User; HR provisions the Employee separately via
   * POST /api/employees. Callers should treat employeeId === null as
   * "no employee profile linked yet", not as a loading/error state.
   */
  const resolveEmployeeProfile = useCallback(async () => {
    try {
      const profile = await employeeApi.getMyProfile();
      setEmployeeId(profile.id);
      setEmployeeIdState(String(profile.id));
      setEmployee(profile);
      setEmployeeLinkStatus('linked');

      // Merge the REAL employee id (and profile fields) onto `user`,
      // which every page receives as a prop and reads `user.id` /
      // `user.employeeId` from as "my employeeId". This overwrites the
      // auth User's own `id` (from AuthResponse) with the correct
      // Employee id under the same key - see the module docstring
      // above for why that distinction matters. Fields already present
      // on `user` (email, fullName, role, token) are preserved.
      setUser((prev) => {
        const merged = { ...prev, ...profile, id: profile.id, employeeId: profile.id };
        localStorage.setItem('workbloom_user', JSON.stringify(merged));
        return merged;
      });

      return profile;
    } catch (err) {
      if (err?.status === 404) {
        setEmployeeId(null);
        setEmployeeIdState(null);
        setEmployee(null);
        setEmployeeLinkStatus('unlinked');
      }
      // Network/5xx errors: leave whatever employeeId/user is already
      // cached alone rather than clearing it out from under an active
      // session.
      return null;
    }
  }, []);

  // Sync user state to local storage
  useEffect(() => {
    if (user) {
      localStorage.setItem('workbloom_user', JSON.stringify(user));
    }
  }, [user]);

  // On mount: if a token already exists (returning session), resolve the
  // real employeeId. This also self-heals any browser that cached a
  // wrong employeeId from before this fix existed.
  useEffect(() => {
    if (getToken()) {
      resolveEmployeeProfile().finally(() => setIsRestoringSession(false));
    } else {
      setIsRestoringSession(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle unauthorized event dispatched by apiClient (401 response)
  useEffect(() => {
    const handleUnauthorized = () => {
      setToken(null);
      setEmployeeIdState(null);
      setEmployee(null);
      setUser(null);
      setEmployeeLinkStatus('unknown');
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

      setSession(response);
      setToken(authToken || getToken());
      setUser(u);

      // Resolve the REAL employeeId - do not trust response.id (see
      // resolveEmployeeProfile's docstring above).
      await resolveEmployeeProfile();

      return response;
    } finally {
      setIsLoading(false);
    }
  }, [resolveEmployeeProfile]);

  const handleRegister = useCallback(async (userData) => {
    setIsLoading(true);
    try {
      const response = await authApi.register(userData);
      const authToken = response?.token || response?.accessToken || response?.jwt;
      const u = response?.user || response;

      setSession(response);
      setToken(authToken || getToken());
      setUser(u);

      // A freshly self-registered account normally has no Employee
      // record yet (see docstring) - this will usually resolve to
      // employeeLinkStatus === 'unlinked', which is expected, not an
      // error.
      await resolveEmployeeProfile();

      return response;
    } finally {
      setIsLoading(false);
    }
  }, [resolveEmployeeProfile]);

  const handleLogout = useCallback(() => {
    clearSession();
    setToken(null);
    setEmployeeIdState(null);
    setEmployee(null);
    setUser(null);
    setEmployeeLinkStatus('unknown');
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
    employee,
    employeeLinkStatus, // 'unknown' | 'linked' | 'unlinked'
    isAuthenticated: Boolean(token),
    isLoading,
    isRestoringSession,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    updateUser,
    refreshEmployeeProfile: resolveEmployeeProfile,
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
