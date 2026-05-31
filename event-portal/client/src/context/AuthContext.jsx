// AuthContext — provides user authentication state to the whole app
// Reads token from localStorage on mount, decodes it with jwt-decode
// Provides: user, token, login(token), logout()
// user shape: { id, email, name, role }

import { createContext, useContext, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Initialize state from localStorage on first render
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('token');
    if (!stored) return null;
    try {
      return jwtDecode(stored); // { id, email, name, role, iat, exp }
    } catch {
      return null;
    }
  });

  // Call this after a successful login or register
  // Saves token to localStorage and decodes user info
  function login(newToken) {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    try {
      setUser(jwtDecode(newToken));
    } catch {
      setUser(null);
    }
  }

  // Call this to log out — clears token and user from state and storage
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

// Custom hook — use this in any component to access auth state
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
