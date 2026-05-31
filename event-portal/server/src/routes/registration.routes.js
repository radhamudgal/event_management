// Registration routes
// POST /          — any logged-in user can register for an event
// POST /:id/cancel — any logged-in user can cancel their own registration
// GET  /me         — participant sees their own registrations
// GET  /           — admin only, sees all registrations
// GET  /organizer  — organizer/admin, sees registrations for their events only

import { Router } from 'express';
import { requireAuth, requireAdmin, requireOrganizer } from '../middleware/authMiddleware.js';
import {
  createRegistration,
  cancelRegistration,
  myRegistrations,
  adminRegistrations,
  organizerRegistrations
} from '../controllers/registration.controller.js';

const router = Router();

// Register for an event
router.post('/', requireAuth, createRegistration);

// Cancel a registration
router.post('/:id/cancel', requireAuth, cancelRegistration);

// My own registrations (participant dashboard)
router.get('/me', requireAuth, myRegistrations);

// Admin: all registrations across all events
router.get('/', requireAuth, requireAdmin, adminRegistrations);

// Organizer: registrations for their own events only
router.get('/organizer', requireAuth, requireOrganizer, organizerRegistrations);

export default router;
