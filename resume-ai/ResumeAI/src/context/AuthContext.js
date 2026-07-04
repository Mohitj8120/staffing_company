import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

const AuthContext = createContext(null);

// Simple JWT expiry check (without library) — same logic as web AuthContext
function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp) {
      return Date.now() >= payload.exp * 1000;
    }
    return false;
  } catch {
    return true;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const syncAttempted = useRef(false);

  // Load token from AsyncStorage on mount
  useEffect(() => {
    async function loadToken() {
      try {
        const stored = await AsyncStorage.getItem('jwt_token');
        if (stored && !isTokenExpired(stored)) {
          setToken(stored);
        } else if (stored) {
          await AsyncStorage.removeItem('jwt_token');
        }
      } catch (e) {
        console.warn('Failed to load token:', e);
      }
      setLoading(false);
    }
    loadToken();
  }, []);

  // Sync user data with backend when token changes
  useEffect(() => {
    if (loading) return;
    
    async function syncUser() {
      if (!token) {
        setUser(null);
        return;
      }

      if (isTokenExpired(token)) {
        logout();
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else if (response.status === 401 || response.status === 403) {
          logout();
        }
      } catch (err) {
        console.warn('Network error syncing session:', err.message);
      }
    }
    syncUser();
  }, [token, loading]);

  // Login with Google — sends idToken to backend, receives JWT
  const loginWithGoogle = async (googleIdToken) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: googleIdToken })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Google exchange failed');
      }

      const result = await response.json();
      await AsyncStorage.setItem('jwt_token', result.token);
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

  const logout = async () => {
    await AsyncStorage.removeItem('jwt_token');
    setToken(null);
    setUser(null);
    setLoading(false);
  };

  const getToken = async () => token;

  const isAuthenticated = !!token;

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
