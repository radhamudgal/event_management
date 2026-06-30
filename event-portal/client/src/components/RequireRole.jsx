/**
 * RequireRole.jsx — Route guard
 * Redirects to /login if not logged in.
 * Redirects to / if user doesn't have the required role.
 * Usage: <RequireRole roles={['admin', 'organizer']}><Page /></RequireRole>
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function RequireRole({ roles, children }) {
  const { user, token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (!roles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
}
