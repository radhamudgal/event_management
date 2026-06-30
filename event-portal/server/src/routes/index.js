/**
 * routes/index.js — Mounts all API route groups
 */

import authRoutes         from './auth.routes.js';
import eventRoutes        from './event.routes.js';
import registrationRoutes from './registration.routes.js';

export function registerRoutes(app) {
  app.get('/api/health', (_, res) => res.json({ ok: true }));
  app.use('/api/auth',          authRoutes);
  app.use('/api/events',        eventRoutes);
  app.use('/api/registrations', registrationRoutes);
  app.get('/', (_, res) => res.json({ message: 'Evently API' }));
}
