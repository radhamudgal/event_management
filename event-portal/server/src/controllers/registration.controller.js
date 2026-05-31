// Registration controller — handles event registrations
// createRegistration: participant registers for an event (checks capacity, duplicates)
// cancelRegistration: participant cancels their own registration
// myRegistrations: participant sees their own registrations
// adminRegistrations: admin sees all registrations (with optional eventId filter)
// organizerRegistrations: organizer sees registrations for their own events only

import mongoose from 'mongoose';
import { Event } from '../models/Event.js';
import { Registration } from '../models/Registration.js';

// POST /api/registrations — requires auth
// Creates a new registration for the logged-in user
export async function createRegistration(req, res) {
  const userId = req.user.id;
  const { eventId, ticketType, notes } = req.body;

  if (!eventId) return res.status(400).json({ message: 'eventId is required' });

  // Use a transaction to prevent race conditions on capacity
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Check event exists and is active
    const event = await Event.findById(eventId).session(session);
    if (!event) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Event not found' });
    }
    if (event.status !== 'active') {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Event is not active' });
    }

    // Check if user already registered
    const existing = await Registration.findOne({ userId, eventId }).session(session);
    if (existing) {
      await session.abortTransaction();
      return res.status(409).json({ message: 'You are already registered for this event' });
    }

    // Check capacity
    const confirmedCount = await Registration.countDocuments({
      eventId,
      status: 'confirmed'
    }).session(session);

    if (confirmedCount >= event.capacity) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Event capacity reached' });
    }

    // Create the registration
    const reg = await Registration.create(
      [{ userId, eventId, ticketType: ticketType || 'standard', notes: notes || '' }],
      { session }
    );

    await session.commitTransaction();
    return res.status(201).json(reg[0]);
  } catch (err) {
    try {
      await session.abortTransaction();
    } catch {
      // ignore abort errors
    }

    // Handle duplicate key error from unique index
    if (err && (err.code === 11000 || err.name === 'MongoServerError')) {
      return res.status(409).json({ message: 'You are already registered for this event' });
    }

    return res.status(500).json({ message: err?.message || 'Failed to register' });
  } finally {
    session.endSession();
  }
}

// POST /api/registrations/:id/cancel — requires auth
// Cancels a registration (only the owner can cancel their own)
export async function cancelRegistration(req, res) {
  const userId = req.user.id;
  const { id } = req.params;

  const reg = await Registration.findById(id);
  if (!reg) return res.status(404).json({ message: 'Registration not found' });

  // Only the user who registered can cancel
  if (reg.userId.toString() !== userId) {
    return res.status(403).json({ message: 'Not allowed' });
  }

  if (reg.status === 'cancelled') {
    return res.status(400).json({ message: 'Registration already cancelled' });
  }

  reg.status = 'cancelled';
  await reg.save();

  return res.json({ message: 'Registration cancelled', registration: reg });
}

// GET /api/registrations/me — requires auth
// Returns all registrations for the logged-in user, with event details populated
export async function myRegistrations(req, res) {
  const regs = await Registration.find({ userId: req.user.id })
    .populate('eventId')
    .sort({ createdAt: -1 });

  res.json(regs);
}

// GET /api/registrations — requires auth + admin
// Returns all registrations across all events (admin only)
// Supports ?eventId filter
export async function adminRegistrations(req, res) {
  const { eventId } = req.query;
  const filter = {};
  if (eventId) filter.eventId = eventId;

  const regs = await Registration.find(filter)
    .populate('userId', 'name email role')
    .populate('eventId')
    .sort({ createdAt: -1 });

  res.json(regs);
}

// GET /api/registrations/organizer — requires auth + organizer or admin
// Returns registrations only for events created by the logged-in organizer
// Supports ?eventId filter (must be one of their events)
export async function organizerRegistrations(req, res) {
  const { eventId } = req.query;

  // Find all events created by this organizer
  const myEvents = await Event.find({ createdBy: req.user.id }).select('_id');
  const myEventIds = myEvents.map((e) => e._id);

  // Build filter — only registrations for their events
  const filter = { eventId: { $in: myEventIds } };

  // If a specific eventId is requested, verify it belongs to this organizer
  if (eventId) {
    const isOwned = myEventIds.some((id) => id.toString() === eventId);
    if (!isOwned) {
      return res.status(403).json({ message: 'That event does not belong to you' });
    }
    filter.eventId = eventId;
  }

  const regs = await Registration.find(filter)
    .populate('userId', 'name email role')
    .populate('eventId')
    .sort({ createdAt: -1 });

  res.json(regs);
}
