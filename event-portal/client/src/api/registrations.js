// API calls for registrations — register, cancel, view tickets
// Uses apiFetch from client.js which attaches the auth token automatically

import { apiFetch } from './client.js';

// POST /api/registrations — register for an event
// payload: { eventId, ticketType, notes }
export async function registerForEvent(payload) {
  return apiFetch('/api/registrations', { method: 'POST', body: payload });
}

// POST /api/registrations/:id/cancel — cancel a registration
export async function cancelRegistration(registrationId) {
  return apiFetch(`/api/registrations/${encodeURIComponent(registrationId)}/cancel`, {
    method: 'POST'
  });
}

// GET /api/registrations/me — participant's own registrations
export async function myRegistrations() {
  return apiFetch('/api/registrations/me');
}

// GET /api/registrations — admin only, all registrations
// eventId: optional filter by event
export async function adminRegistrations(eventId) {
  const query = eventId ? `?eventId=${encodeURIComponent(eventId)}` : '';
  return apiFetch(`/api/registrations${query}`);
}

// GET /api/registrations/organizer — organizer's events' registrations
// eventId: optional filter (must be one of their events)
export async function organizerRegistrations(eventId) {
  const query = eventId ? `?eventId=${encodeURIComponent(eventId)}` : '';
  return apiFetch(`/api/registrations/organizer${query}`);
}
