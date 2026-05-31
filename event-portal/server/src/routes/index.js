// Route registry — mounts all API routes onto the Express app
// /api/auth         — login and register
// /api/events       — event CRUD
// /api/registrations — registration management

import { Router } from 'express';

import authRoutes from './auth.routes.js';
import eventRoutes from './event.routes.js';
import registrationRoutes from './registration.routes.js';

export function registerRoutes(app) {
  const router = Router();

  // Health check endpoint
  router.get('/health', (req, res) => res.json({ ok: true }));

  // Mount route groups
  app.use('/api/auth', authRoutes);
  app.use('/api/events', eventRoutes);
  app.use('/api/registrations', registrationRoutes);

  // Root info endpoint
  app.get('/', (req, res) => res.json({ message: 'Event Portal API' }));

  app.use('/api', router);
}
