// Event routes
// Public: list events, get single event
// Protected: create (organizer/admin), update/delete (auth + ownership checked in controller)

import { Router } from 'express';
import { requireAuth, requireOrganizer } from '../middleware/authMiddleware.js';
import {
  listEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent
} from '../controllers/event.controller.js';

const router = Router();

// Public routes — no auth needed
router.get('/', listEvents);
router.get('/:id', getEvent);

// Create event — must be organizer or admin
router.post('/', requireAuth, requireOrganizer, createEvent);

// Update/delete — auth required; ownership check happens inside the controller
router.put('/:id', requireAuth, updateEvent);
router.delete('/:id', requireAuth, deleteEvent);

export default router;
