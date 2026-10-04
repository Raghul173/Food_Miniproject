import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Fetch authenticated user profile on app load
  const refreshUser = useCallback(async () => {
    const currentToken = localStorage.getItem('token');
    if (!currentToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/me');
      if (res.data?.success && res.data?.data?.user) {
        setUser(res.data.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.data.user));
      } else {
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } catch (err) {
      console.error('Failed to restore session:', err);
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data?.success) {
        const { token: newToken, user: userData } = res.data.data;
        setToken(newToken);
        setUser(userData);
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        return { success: true, user: userData };
      }
      return { success: false, message: res.data?.message || 'Login failed' };
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid email or password';
      return { success: false, message };
    }
  };

  const register = async (formData) => {
    try {
      const res = await api.post('/auth/register', formData);
      if (res.data?.success) {
        const { token: newToken, user: userData } = res.data.data;
        setToken(newToken);
        setUser(userData);
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        return { success: true, user: userData };
      }
      return { success: false, message: res.data?.message || 'Registration failed' };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      return { success: false, message, errors: err.response?.data?.errors };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // ignore network errors on logout
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    refreshUser,
    isAuthenticated: !!user,
    isDonor: user?.role === 'DONOR',
    isRecipient: user?.role === 'RECIPIENT',
    isAdmin: user?.role === 'ADMIN',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
