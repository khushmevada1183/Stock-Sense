'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { logger } from '@/lib/logger';

const AUTH_STORAGE_KEY = 'stock-sense-auth';

// User type definition
export interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
}

// Auth context state interface
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

// Default auth context
const defaultAuthContext: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: true,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  clearError: () => {},
};

// Register data interface
interface RegisterData {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

const makeUserFromEmail = (email: string, firstName?: string, lastName?: string): User => ({
  id: `local-${email.toLowerCase()}`,
  email,
  first_name: firstName || null,
  last_name: lastName || null,
  role: 'user',
});

const persistAuthState = (token: string, user: User) => {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify({ token, user })
  );
};

const clearAuthState = () => {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem(AUTH_STORAGE_KEY);
};

// Create auth context
const AuthContext = createContext<AuthState>(defaultAuthContext);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state on page load
  useEffect(() => {
    const loadUser = async () => {
      try {
        const raw = localStorage.getItem(AUTH_STORAGE_KEY);
        if (!raw) {
          setLoading(false);
          return;
        }

        const parsed = JSON.parse(raw) as { token?: string; user?: User };
        if (!parsed.token || !parsed.user) {
          clearAuthState();
          setLoading(false);
          return;
        }

        setToken(parsed.token);
        setUser(parsed.user);
        setIsAuthenticated(true);
      } catch (err: unknown) {
        clearAuthState();
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        logger.error('Auth initialization error:', err instanceof Error ? err.message : 'Failed to initialize authentication.');
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      if (!email || !password) {
        throw new Error('Email and password are required.');
      }

      const localToken = `local-token-${Date.now()}`;
      const localUser = makeUserFromEmail(email);

      persistAuthState(localToken, localUser);

      setToken(localToken);
      setUser(localUser);
      setIsAuthenticated(true);

      return;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed. Please check your credentials and try again.';
      setError(errorMessage);
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData: RegisterData) => {
    try {
      setLoading(true);
      setError(null);

      if (!userData.email || !userData.password) {
        throw new Error('Email and password are required.');
      }

      const localToken = `local-token-${Date.now()}`;
      const localUser = makeUserFromEmail(
        userData.email,
        userData.first_name,
        userData.last_name
      );

      persistAuthState(localToken, localUser);

      setToken(localToken);
      setUser(localUser);
      setIsAuthenticated(true);

      return;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed. Please try again with a different email.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    clearAuthState();

    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  // Clear error function
  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => useContext(AuthContext); 