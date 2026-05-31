// Event controller — CRUD operations for events
// listEvents: public, supports search and status filter
// getEvent: public, single event with spots left
// createEvent: organizer or admin only, sets createdBy to current user
// updateEvent: admin can update any, organizer can only update their own
// deleteEvent: same ownership rules as update

import { Event } from '../models/Event.js';
import { Registration } from '../models/Registration.js';

// GET /api/events — public
// Supports ?q (search title/description/location) and ?status filter
export async function listEvents(req, res) {
  const { q, status } = req.query;

  const filter = {};

  // Filter by status if provided
  if (status) filter.status = status;

  // Search across title, description, and location
  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { location: { $regex: q, $options: 'i' } }
    ];
  }

  // Get events sorted by start date (soonest first)
  const events = await Event.find(filter)
    .populate('createdBy', 'name email')
    .sort({ startDate: 1 })
    .lean();

  // Count confirmed registrations per event to calculate spots left
  const eventIds = events.map((e) => e._id);
  const counts = await Registration.aggregate([
    { $match: { eventId: { $in: eventIds }, status: 'confirmed' } },
    { $group: { _id: '$eventId', count: { $sum: 1 } } }
  ]);

  // Build a map of eventId -> count for quick lookup
  const countMap = Object.fromEntries(counts.map((c) => [c._id.toString(), c.count]));

  // Attach registeredCount and spotsLeft to each event
  const result = events.map((ev) => ({
    ...ev,
    registeredCount: countMap[ev._id.toString()] || 0,
    spotsLeft: Math.max(0, ev.capacity - (countMap[ev._id.toString()] || 0))
  }));

  res.json(result);
}

// GET /api/events/:id — public
// Returns a single event with spotsLeft calculated
export async function getEvent(req, res) {
  const event = await Event.findById(req.params.id)
    .populate('createdBy', 'name email')
    .lean();

  if (!event) return res.status(404).json({ message: 'Event not found' });

  // Count confirmed registrations for this event
  const registeredCount = await Registration.countDocuments({
    eventId: event._id,
    status: 'confirmed'
  });

  res.json({
    ...event,
    registeredCount,
    spotsLeft: Math.max(0, event.capacity - registeredCount)
  });
}

// POST /api/events — requires auth + organizer or admin
// Sets createdBy to the current user's ID
export async function createEvent(req, res) {
  const { title, description, location, startDate, endDate, capacity, organizer, status } =
    req.body;

  if (!title || !startDate || !endDate || !capacity) {
    return res.status(400).json({ message: 'title, startDate, endDate, and capacity are required' });
  }

  const event = await Event.create({
    title,
    description: description || '',
    location: location || '',
    startDate,
    endDate,
    capacity: Number(capacity),
    organizer: organizer || '',
    status: status || 'active',
    createdBy: req.user.id // track which user created this event
  });

  res.status(201).json(event);
}

// PUT /api/events/:id — requires auth
// Admin can update any event; organizer can only update events they created
export async function updateEvent(req, res) {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });

  // Ownership check: organizer can only edit their own events
  if (req.user.role === 'organizer') {
    if (event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only edit your own events' });
    }
  }

  // Apply updates (only update fields that were provided)
  const { title, description, location, startDate, endDate, capacity, organizer, status } =
    req.body;

  if (title !== undefined) event.title = title;
  if (description !== undefined) event.description = description;
  if (location !== undefined) event.location = location;
  if (startDate !== undefined) event.startDate = startDate;
  if (endDate !== undefined) event.endDate = endDate;
  if (capacity !== undefined) event.capacity = Number(capacity);
  if (organizer !== undefined) event.organizer = organizer;
  if (status !== undefined) event.status = status;

  await event.save();
  res.json(event);
}

// DELETE /api/events/:id — requires auth
// Admin can delete any event; organizer can only delete their own
export async function deleteEvent(req, res) {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });

  // Ownership check: organizer can only delete their own events
  if (req.user.role === 'organizer') {
    if (event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own events' });
    }
  }

  await event.deleteOne();
  res.json({ message: 'Event deleted' });
}
