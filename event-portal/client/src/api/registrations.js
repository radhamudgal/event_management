/**
 * registrations.js — Registration API calls
 * registerForEvent       → POST /api/registrations
 * cancelRegistration     → POST /api/registrations/:id/cancel
 * myRegistrations        → GET  /api/registrations/me
 * adminRegistrations     → GET  /api/registrations (admin only)
 * organizerRegistrations → GET  /api/registrations/organizer
 */

import { apiFetch } from './client.js';

export const registerForEvent       = (payload)  => apiFetch('/api/registrations', { method: 'POST', body: payload });
export const cancelRegistration     = (id)        => apiFetch(`/api/registrations/${encodeURIComponent(id)}/cancel`, { method: 'POST' });
export const myRegistrations        = ()          => apiFetch('/api/registrations/me');
export const adminRegistrations     = (eventId)   => apiFetch(`/api/registrations${eventId ? `?eventId=${encodeURIComponent(eventId)}` : ''}`);
export const organizerRegistrations = (eventId)   => apiFetch(`/api/registrations/organizer${eventId ? `?eventId=${encodeURIComponent(eventId)}` : ''}`);
