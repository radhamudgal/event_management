/**
 * auth.js — Auth API calls
 * registerUser → POST /api/auth/register
 * loginUser    → POST /api/auth/login
 */

import { apiFetch } from './client.js';

export const registerUser = (payload) => apiFetch('/api/auth/register', { method: 'POST', body: payload });
export const loginUser    = (payload) => apiFetch('/api/auth/login',    { method: 'POST', body: payload });
