'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  getProfile,
  login as loginRequest,
  logout as logoutRequest,
  signup,
} from '@/api/api';
import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  loadAuthTokens,
  saveAuthTokens,
} from '@/lib/auth';
import { logger } from '@/lib/logger';

export interface User {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  fullName?: string | null;
  role?: string;
  emailVerified?: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  fullName?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const defaultAuthContext: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  clearError: () => {},
};

const AuthContext = createContext<AuthState>(defaultAuthContext);

const normalizeUser = (raw: unknown): User | null => {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const payload = raw as Record<string, unknown>;

  if (!payload.id || !payload.email) {
    return null;
  }

  return {
    id: String(payload.id),
    email: String(payload.email),
    first_name: payload.first_name ? String(payload.first_name) : null,
    last_name: payload.last_name ? String(payload.last_name) : null,
    fullName: payload.fullName ? String(payload.fullName) : null,
    role: payload.role ? String(payload.role) : 'user',
    emailVerified: Boolean(payload.emailVerified),
  };
};

const extractAuthData = (response: unknown) => {
  if (!response || typeof response !== 'object') {
    return {
      user: null,
      accessToken: null,
      refreshToken: null,
    };
  }

  const payload = response as { data?: Record<string, unknown> };
  const data = payload.data || {};

  return {
    user: normalizeUser(data.user),
    accessToken: typeof data.accessToken === 'string' ? data.accessToken : null,
    refreshToken: typeof data.refreshToken === 'string' ? data.refreshToken : null,
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const hydrateProfile = async () => {
    try {
      const profileResponse = await getProfile();
      const profileData = profileResponse?.data || profileResponse;
      const profileUser = normalizeUser(profileData?.user || profileData);

      if (!profileUser) {
        throw new Error('Failed to load user profile.');
      }

      setUser(profileUser);
      setIsAuthenticated(true);
      return profileUser;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load profile';
      logger.error('hydrateProfile failed', message);

      const statusCode =
        typeof err === 'object' && err !== null && 'status' in err
          ? Number((err as { status?: unknown }).status)
          : NaN;
      const shouldClearAuth = statusCode === 401 || statusCode === 403;

      if (shouldClearAuth) {
        clearAuthTokens();
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
      } else if (getAccessToken()) {
        // Keep the existing auth session on transient backend/network failures.
        setIsAuthenticated(true);
      }

      throw err;
    }
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        loadAuthTokens();
        const storedAccessToken = getAccessToken();

        if (!storedAccessToken) {
          setLoading(false);
          return;
        }

        setToken(storedAccessToken);
        await hydrateProfile();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Authentication initialization failed';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await loginRequest({ email, password });
      const { user: authUser, accessToken, refreshToken } = extractAuthData(response);

      if (accessToken) {
        saveAuthTokens({ accessToken, refreshToken });
        setToken(accessToken);
      }

      if (authUser) {
        setUser(authUser);
        setIsAuthenticated(true);
      } else {
        await hydrateProfile();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setLoading(true);
      setError(null);

      const payload = {
        email: userData.email,
        password: userData.password,
        fullName:
          userData.fullName ||
          [userData.first_name, userData.last_name].filter(Boolean).join(' ').trim(),
      };

      const response = await signup(payload);
      const { user: authUser, accessToken, refreshToken } = extractAuthData(response);

      if (accessToken) {
        saveAuthTokens({ accessToken, refreshToken });
        setToken(accessToken);
      }

      if (authUser) {
        setUser(authUser);
        setIsAuthenticated(true);
      } else {
        await hydrateProfile();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    const refreshToken = getRefreshToken();

    if (refreshToken) {
      logoutRequest(refreshToken).catch((err) => {
        logger.warn('logout request failed', err instanceof Error ? err.message : err);
      });
    }

    clearAuthTokens();
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        error,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
