import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children, navigate, allowedRoles = null }) {
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isAuthenticated && navigate) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  if (allowedRoles && allowedRoles.length > 0 && user?.role) {
    if (!allowedRoles.includes(user.role)) {
      return (
        <div className="card" style={{ padding: 40, textAlign: 'center', margin: '40px auto', maxWidth: 480 }}>
          <p className="eyebrow" style={{ color: 'hsl(var(--peach))' }}>Access restricted</p>
          <h2>Restricted Section</h2>
          <p>Your current role ({user.role}) does not have permission to view this section.</p>
          <button className="button button-primary" onClick={() => navigate && navigate('/dashboard')} style={{ marginTop: 16 }}>
            Return to Dashboard
          </button>
        </div>
      );
    }
  }

  return children;
}

export default ProtectedRoute;
