/**
 * registration.controller.js — Event registrations
 * createRegistration     → register for an event (checks capacity & duplicates)
 * cancelRegistration     → cancel your own registration
 * myRegistrations        → get logged-in user's tickets
 * adminRegistrations     → admin: all registrations
 * organizerRegistrations → organizer: registrations for their own events
 */

import { Event } from '../models/Event.js';
import { Registration } from '../models/Registration.js';

// POST /api/registrations
export async function createRegistration(req, res) {
  const { eventId, ticketType, notes } = req.body;
  if (!eventId) return res.status(400).json({ message: 'eventId is required' });

  try {
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.status !== 'active') return res.status(400).json({ message: 'Event is not active' });

    const duplicate = await Registration.findOne({ userId: req.user.id, eventId });
    if (duplicate) return res.status(409).json({ message: 'Already registered for this event' });

    const count = await Registration.countDocuments({ eventId, status: 'confirmed' });
    if (count >= event.capacity) return res.status(400).json({ message: 'Event is full' });

    const reg = await Registration.create({
      userId: req.user.id, eventId,
      ticketType: ticketType || 'standard',
      notes: notes || ''
    });
    res.status(201).json(reg);
  } catch (err) {
    // Unique index violation (race condition fallback)
    if (err.code === 11000) return res.status(409).json({ message: 'Already registered for this event' });
    res.status(500).json({ message: err.message });
  }
}

// POST /api/registrations/:id/cancel
export async function cancelRegistration(req, res) {
  const reg = await Registration.findById(req.params.id);
  if (!reg) return res.status(404).json({ message: 'Registration not found' });
  if (reg.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Not allowed' });
  if (reg.status === 'cancelled') return res.status(400).json({ message: 'Already cancelled' });

  reg.status = 'cancelled';
  await reg.save();
  res.json({ message: 'Registration cancelled' });
}

// GET /api/registrations/me
export async function myRegistrations(req, res) {
  const regs = await Registration.find({ userId: req.user.id }).populate('eventId').sort({ createdAt: -1 });
  res.json(regs);
}

// GET /api/registrations — admin only
export async function adminRegistrations(req, res) {
  const filter = req.query.eventId ? { eventId: req.query.eventId } : {};
  const regs = await Registration.find(filter)
    .populate('userId', 'name email role')
    .populate('eventId')
    .sort({ createdAt: -1 });
  res.json(regs);
}

// GET /api/registrations/organizer — organizer only
export async function organizerRegistrations(req, res) {
  const myEvents = await Event.find({ createdBy: req.user.id }).select('_id');
  const myEventIds = myEvents.map(e => e._id);

  const filter = { eventId: { $in: myEventIds } };

  if (req.query.eventId) {
    const owned = myEventIds.some(id => id.toString() === req.query.eventId);
    if (!owned) return res.status(403).json({ message: 'That event is not yours' });
    filter.eventId = req.query.eventId;
  }

  const regs = await Registration.find(filter)
    .populate('userId', 'name email role')
    .populate('eventId')
    .sort({ createdAt: -1 });
  res.json(regs);
}
