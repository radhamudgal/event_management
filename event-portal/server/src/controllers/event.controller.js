/**
 * event.controller.js — Event CRUD
 * listEvents   → public, search + filter, includes spotsLeft per event
 * getEvent     → public, single event with spotsLeft
 * createEvent  → organizer/admin only, sets createdBy = current user
 * updateEvent  → organizer (own) or admin (any)
 * deleteEvent  → organizer (own) or admin (any)
 */

import { Event } from '../models/Event.js';
import { Registration } from '../models/Registration.js';

// GET /api/events — public
export async function listEvents(req, res) {
  const { q, status } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (q) filter.$or = [
    { title: { $regex: q, $options: 'i' } },
    { description: { $regex: q, $options: 'i' } },
    { location: { $regex: q, $options: 'i' } }
  ];

  const events = await Event.find(filter).populate('createdBy', 'name email').sort({ startDate: 1 }).lean();

  // Count confirmed registrations for all events in one query
  const counts = await Registration.aggregate([
    { $match: { eventId: { $in: events.map(e => e._id) }, status: 'confirmed' } },
    { $group: { _id: '$eventId', count: { $sum: 1 } } }
  ]);
  const countMap = Object.fromEntries(counts.map(c => [c._id.toString(), c.count]));

  res.json(events.map(ev => ({
    ...ev,
    registeredCount: countMap[ev._id.toString()] || 0,
    spotsLeft: Math.max(0, ev.capacity - (countMap[ev._id.toString()] || 0))
  })));
}

// GET /api/events/:id — public
export async function getEvent(req, res) {
  const event = await Event.findById(req.params.id).populate('createdBy', 'name email').lean();
  if (!event) return res.status(404).json({ message: 'Event not found' });

  const registeredCount = await Registration.countDocuments({ eventId: event._id, status: 'confirmed' });
  res.json({ ...event, registeredCount, spotsLeft: Math.max(0, event.capacity - registeredCount) });
}

// POST /api/events — organizer/admin only
export async function createEvent(req, res) {
  const { title, startDate, endDate, capacity } = req.body;
  if (!title || !startDate || !endDate || !capacity)
    return res.status(400).json({ message: 'title, startDate, endDate, capacity required' });

  const event = await Event.create({ ...req.body, capacity: Number(capacity), createdBy: req.user.id });
  res.status(201).json(event);
}

// PUT /api/events/:id — auth required (ownership enforced below)
export async function updateEvent(req, res) {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  if (req.user.role === 'organizer' && event.createdBy.toString() !== req.user.id)
    return res.status(403).json({ message: 'You can only edit your own events' });

  Object.assign(event, req.body);
  if (req.body.capacity) event.capacity = Number(req.body.capacity);
  await event.save();
  res.json(event);
}

// DELETE /api/events/:id — auth required (ownership enforced below)
export async function deleteEvent(req, res) {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  if (req.user.role === 'organizer' && event.createdBy.toString() !== req.user.id)
    return res.status(403).json({ message: 'You can only delete your own events' });

  await event.deleteOne();
  res.json({ message: 'Event deleted' });
}
