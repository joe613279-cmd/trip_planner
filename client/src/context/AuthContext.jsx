import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('voyagecraft_token'));
  const [authLoading, setAuthLoading] = useState(true);

  // Restore session from token
  const verifySession = useCallback(async () => {
    const savedToken = localStorage.getItem('voyagecraft_token');
    if (!savedToken) {
      setUser(null);
      setAuthLoading(false);
      return;
    }

    try {
      setAuthLoading(true);
      const res = await api.getMe();
      if (res.success && res.user) {
        setUser(res.user);
      } else {
        localStorage.removeItem('voyagecraft_token');
        setUser(null);
      }
    } catch (err) {
      localStorage.removeItem('voyagecraft_token');
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    verifySession();
  }, [verifySession]);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    if (res.success) {
      localStorage.setItem('voyagecraft_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
  };

  const register = async ({ name, email, password, role = 'user' }) => {
    const res = await api.register({ name, email, password, role });
    if (res.success) {
      localStorage.setItem('voyagecraft_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (err) {
      // Ignore network errors during logout
    }
    localStorage.removeItem('voyagecraft_token');
    setToken(null);
    setUser(null);
  };

  const isAdmin = Boolean(user && user.role === 'admin');
  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAdmin,
        isAuthenticated,
        authLoading,
        login,
        register,
        logout,
        refreshSession: verifySession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
