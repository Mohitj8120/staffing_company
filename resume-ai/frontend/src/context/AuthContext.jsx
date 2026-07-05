import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../config';

const AuthContext = createContext(null);

// Simple JWT expiry check (without library)
function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp) {
      return Date.now() >= payload.exp * 1000;
    }
    return false; // No exp claim = treat as valid
  } catch {
    return true; // Malformed token = expired
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    const stored = localStorage.getItem('jwt_token');
    // Immediately discard expired tokens at startup
    if (stored && isTokenExpired(stored)) {
      localStorage.removeItem('jwt_token');
      return null;
    }
    return stored;
  });
  const [loading, setLoading] = useState(true);
  const syncedTokenRef = useRef(null);

  // Sync token changes across multiple open tabs in the same browser session
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'jwt_token') {
        const newToken = e.newValue;
        if (newToken && isTokenExpired(newToken)) {
          localStorage.removeItem('jwt_token');
          setToken(null);
        } else {
          setToken(newToken);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    // Prevent double-sync in StrictMode for same token
    if (syncedTokenRef.current === token) {
      // If we already synced the token, make sure we aren't stuck in a loading state
      setLoading(false);
      return;
    }
    syncedTokenRef.current = token;

    async function syncUser() {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Quick client-side expiry check
      if (isTokenExpired(token)) {
        logout();
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else if (response.status === 401 || response.status === 403) {
          // Token is truly invalid/expired — clear session
          logout();
        } else {
          // Server error (500, 502, etc.) — keep the session alive
          // The user will just see a loading state briefly
          console.warn('Server returned', response.status, '— keeping session');
        }
      } catch (err) {
        // Network error — keep token, don't logout
        console.warn('Network error syncing session — keeping token:', err.message);
      } finally {
        setLoading(false);
      }
    }
    syncUser();
  }, [token]);

  const loginWithGoogle = async (googleCredential) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ credential: googleCredential })
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Google exchange failed');
      }

      const result = await response.json();
      localStorage.setItem('jwt_token', result.token);
      setToken(result.token);
      setUser(result.user);
      return result.user;
    } catch (err) {
      console.error('Login error:', err);
      logout();
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('jwt_token');
    setToken(null);
    setUser(null);
    setLoading(false);
  };

  const getToken = async () => {
    return token;
  };

  useEffect(() => {
    if (user) {
      import('@sentry/react').then((Sentry) => {
        Sentry.setUser({ id: String(user.id), email: user.email });
      }).catch(() => {});
    } else {
      import('@sentry/react').then((Sentry) => {
        Sentry.setUser(null);
      }).catch(() => {});
    }
  }, [user]);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated, loginWithGoogle, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
