/**
 * AuthContext.jsx — Global authentication state
 * Reads JWT from localStorage on load and decodes user info.
 * Provides: user { id, email, name, role }, token, login(token), logout()
 */

import { createContext, useContext, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

// Decode token safely — returns null on failure
const decode = (token) => { try { return jwtDecode(token); } catch { return null; } };

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user,  setUser]  = useState(() => decode(localStorage.getItem('token')));

  // Save token after login/register
  function login(newToken) {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(decode(newToken));
  }

  // Clear everything on logout
  function logout() {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth state in any component
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
