// API calls for authentication — login and register
// Uses apiFetch from client.js which handles token headers automatically

import { apiFetch } from './client.js';

// POST /api/auth/register
// payload: { name, email, password, role }
// Returns: { token, user }
export async function registerUser(payload) {
  return apiFetch('/api/auth/register', { method: 'POST', body: payload });
}

// POST /api/auth/login
// payload: { email, password }
// Returns: { token, user }
export async function loginUser(payload) {
  return apiFetch('/api/auth/login', { method: 'POST', body: payload });
}
