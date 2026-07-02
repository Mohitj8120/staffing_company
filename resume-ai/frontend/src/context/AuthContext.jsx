import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('jwt_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function syncUser() {
      if (!token) {
        setUser(null);
        setLoading(false);
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
        } else {
          // Token expired or invalid
          logout();
        }
      } catch (err) {
        console.error('Failed to sync user session:', err);
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
