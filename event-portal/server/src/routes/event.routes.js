/**
 * event.routes.js
 * GET    /api/events        — public, list all events
 * GET    /api/events/:id    — public, single event
 * POST   /api/events        — organizer or admin
 * PUT    /api/events/:id    — auth (ownership checked in controller)
 * DELETE /api/events/:id    — auth (ownership checked in controller)
 */

import { Router } from 'express';
import { requireAuth, requireOrganizer } from '../middleware/authMiddleware.js';
import { listEvents, getEvent, createEvent, updateEvent, deleteEvent } from '../controllers/event.controller.js';

const router = Router();
router.get('/',     listEvents);
router.get('/:id',  getEvent);
router.post('/',    requireAuth, requireOrganizer, createEvent);
router.put('/:id',  requireAuth, updateEvent);
router.delete('/:id', requireAuth, deleteEvent);

export default router;
