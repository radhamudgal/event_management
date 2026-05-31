// API calls for events — list, get, create, update, delete
// Uses apiFetch from client.js which attaches the auth token automatically

import { apiFetch } from './client.js';

// GET /api/events — public
// params: { q, status } — optional search and filter
export async function listEvents(params = {}) {
  // Remove empty/undefined values so we don't send ?status=undefined
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null)
  );
  const query = new URLSearchParams(clean).toString();
  return apiFetch(`/api/events${query ? `?${query}` : ''}`);
}

// GET /api/events/:id — public
export async function getEvent(id) {
  return apiFetch(`/api/events/${id}`);
}

// POST /api/events — requires organizer or admin
export async function createEvent(payload) {
  return apiFetch('/api/events', { method: 'POST', body: payload });
}

// PUT /api/events/:id — requires auth (ownership checked on server)
export async function updateEvent(id, payload) {
  return apiFetch(`/api/events/${id}`, { method: 'PUT', body: payload });
}

// DELETE /api/events/:id — requires auth (ownership checked on server)
export async function deleteEvent(id) {
  return apiFetch(`/api/events/${id}`, { method: 'DELETE' });
}
