/**
 * registration.routes.js
 * POST /api/registrations              — register for an event
 * POST /api/registrations/:id/cancel   — cancel a registration
 * GET  /api/registrations/me           — my own tickets
 * GET  /api/registrations              — admin: all registrations
 * GET  /api/registrations/organizer    — organizer: own events only
 */

import { Router } from 'express';
import { requireAuth, requireAdmin, requireOrganizer } from '../middleware/authMiddleware.js';
import {
  createRegistration, cancelRegistration, myRegistrations,
  adminRegistrations, organizerRegistrations
} from '../controllers/registration.controller.js';

const router = Router();
router.post('/',              requireAuth, createRegistration);
router.post('/:id/cancel',    requireAuth, cancelRegistration);
router.get('/me',             requireAuth, myRegistrations);
router.get('/',               requireAuth, requireAdmin, adminRegistrations);
router.get('/organizer',      requireAuth, requireOrganizer, organizerRegistrations);

export default router;
