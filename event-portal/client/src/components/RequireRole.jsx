// RequireRole — redirects if the user doesn't have one of the required roles
// Usage: <RequireRole roles={['admin', 'organizer']}><Page /></RequireRole>
// Redirects to /login if not logged in, to / if wrong role

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function RequireRole({ roles, children }) {
  const { user, token } = useAuth();

  // Not logged in at all
  if (!token) return <Navigate to="/login" replace />;

  // Logged in but wrong role
  if (!roles.includes(user?.role)) return <Navigate to="/" replace />;

  return children;
}
