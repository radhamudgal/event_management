/**
 * client.js — Central API fetch utility
 * All API calls use apiFetch() which auto-attaches the JWT token.
 * Dev:  VITE_API_BASE_URL is empty → Vite proxy handles /api/* → localhost:5000
 * Prod: set VITE_API_BASE_URL to your deployed backend URL
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

// Get stored token from localStorage
const getToken = () => localStorage.getItem('token');

// Central fetch — adds auth header and parses JSON response
export async function apiFetch(path, { method = 'GET', body, headers = {} } = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await res.text().then(t => { try { return JSON.parse(t); } catch { return t; } });
  if (!res.ok) {
    const err = new Error(data?.message || `Error ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data;
}
