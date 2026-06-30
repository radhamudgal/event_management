/**
 * events.js — Event API calls
 * listEvents  → GET /api/events (with optional ?q and ?status)
 * getEvent    → GET /api/events/:id
 * createEvent → POST /api/events
 * updateEvent → PUT /api/events/:id
 * deleteEvent → DELETE /api/events/:id
 */

import { apiFetch } from './client.js';

// Strip empty/undefined params before building query string
export function listEvents(params = {}) {
  const q = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
  ).toString();
  return apiFetch(`/api/events${q ? `?${q}` : ''}`);
}

export const getEvent    = (id)           => apiFetch(`/api/events/${id}`);
export const createEvent = (payload)      => apiFetch('/api/events',      { method: 'POST',   body: payload });
export const updateEvent = (id, payload)  => apiFetch(`/api/events/${id}`, { method: 'PUT',    body: payload });
export const deleteEvent = (id)           => apiFetch(`/api/events/${id}`, { method: 'DELETE' });
