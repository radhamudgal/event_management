// Auth middleware — protects routes by verifying JWT tokens
// requireAuth: any logged-in user
// requireAdmin: only admin role
// requireOrganizer: organizer OR admin role

import jwt from 'jsonwebtoken';

// Verify the Bearer token and attach user payload to req.user
export function requireAuth(req, res, next) {
  const header = req.headers.authorization;

  // Check that Authorization header exists and starts with "Bearer "
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid Authorization header' });
  }

  const token = header.slice('Bearer '.length);

  try {
    // Verify and decode the token
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, email, name, role }
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// Only allow admin role
export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}

// Allow organizer OR admin role (organizers manage their own events)
export function requireOrganizer(req, res, next) {
  const role = req.user?.role;
  if (role !== 'organizer' && role !== 'admin') {
    return res.status(403).json({ message: 'Organizer or admin access required' });
  }
  next();
}
