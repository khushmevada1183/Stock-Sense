const ACCESS_TOKEN_KEY = 'stock_sense_access_token';
const REFRESH_TOKEN_KEY = 'stock_sense_refresh_token';

let inMemoryAccessToken: string | null = null;
let inMemoryRefreshToken: string | null = null;

const canUseStorage = () => typeof window !== 'undefined';

const readToken = (key: string): string | null => {
  if (!canUseStorage()) {
    return null;
  }

  return window.sessionStorage.getItem(key);
};

const writeToken = (key: string, value: string | null) => {
  if (!canUseStorage()) {
    return;
  }

  if (value) {
    window.sessionStorage.setItem(key, value);
  } else {
    window.sessionStorage.removeItem(key);
  }
};

const decodeJwtPayload = (token: string): Record<string, unknown> | null => {
  try {
    const segments = token.split('.');
    if (segments.length < 2) {
      return null;
    }

    const payload = segments[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const decoded = atob(payload);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
};

const getTokenExpiryMs = (token: string): number | null => {
  const payload = decodeJwtPayload(token);
  const exp = payload?.exp;

  if (typeof exp !== 'number') {
    return null;
  }

  return exp * 1000;
};

export const loadAuthTokens = () => {
  if (!inMemoryAccessToken) {
    inMemoryAccessToken = readToken(ACCESS_TOKEN_KEY);
  }

  if (!inMemoryRefreshToken) {
    inMemoryRefreshToken = readToken(REFRESH_TOKEN_KEY);
  }

  return {
    accessToken: inMemoryAccessToken,
    refreshToken: inMemoryRefreshToken,
  };
};

export const saveAuthTokens = (tokens: {
  accessToken?: string | null;
  refreshToken?: string | null;
}) => {
  if (tokens.accessToken !== undefined) {
    inMemoryAccessToken = tokens.accessToken;
    writeToken(ACCESS_TOKEN_KEY, tokens.accessToken || null);
  }

  if (tokens.refreshToken !== undefined) {
    inMemoryRefreshToken = tokens.refreshToken;
    writeToken(REFRESH_TOKEN_KEY, tokens.refreshToken || null);
  }
};

export const clearAuthTokens = () => {
  inMemoryAccessToken = null;
  inMemoryRefreshToken = null;
  writeToken(ACCESS_TOKEN_KEY, null);
  writeToken(REFRESH_TOKEN_KEY, null);
};

export const getAccessToken = () => {
  if (!inMemoryAccessToken) {
    inMemoryAccessToken = readToken(ACCESS_TOKEN_KEY);
  }

  return inMemoryAccessToken;
};

export const getRefreshToken = () => {
  if (!inMemoryRefreshToken) {
    inMemoryRefreshToken = readToken(REFRESH_TOKEN_KEY);
  }

  return inMemoryRefreshToken;
};

export const isAccessTokenExpiringSoon = (thresholdSeconds = 60) => {
  const token = getAccessToken();
  if (!token) {
    return true;
  }

  const expiryMs = getTokenExpiryMs(token);
  if (!expiryMs) {
    return false;
  }

  const thresholdMs = thresholdSeconds * 1000;
  return Date.now() >= expiryMs - thresholdMs;
};
