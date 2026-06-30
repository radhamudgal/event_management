/**
 * authMiddleware.js — JWT route protection
 * requireAuth      → any logged-in user (attaches req.user)
 * requireAdmin     → admin role only
 * requireOrganizer → organizer OR admin
 */

import jwt from 'jsonwebtoken';

// Verify Bearer token and attach decoded user to req.user
export function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ message: 'No token provided' });

  try {
    req.user = jwt.verify(auth.slice(7), process.env.JWT_SECRET); // { id, email, name, role }
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// Only admin role
export function requireAdmin(req, res, next) {
  req.user?.role === 'admin' ? next() : res.status(403).json({ message: 'Admin access required' });
}

// Organizer or admin
export function requireOrganizer(req, res, next) {
  ['organizer', 'admin'].includes(req.user?.role)
    ? next()
    : res.status(403).json({ message: 'Organizer access required' });
}
