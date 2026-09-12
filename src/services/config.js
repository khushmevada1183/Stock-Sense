// Configuration constants for the application
export const FEATURES = {
  ENABLE_REAL_TIME_UPDATES: true,
  ENABLE_CACHING: true,
  ENABLE_DEBUG_MODE: false
};

const getBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && envUrl.startsWith('http') && !envUrl.includes('localhost')) {
    return envUrl;
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://stock-sense-backend-api.appwrite.network/api/v1';
  }
  return envUrl || 'http://localhost:10000/api/v1';
};

export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  TIMEOUT: 15000,
  RETRY_ATTEMPTS: 1,
  CACHE_DURATION: 300000,
  KEY_ROTATION: {
    ENABLED: false,
    AUTO_ROTATE_ON_429: false,
    MAX_CONSECUTIVE_FAILURES: 0
  },
  API_KEYS: []
};

const appConfig = {
  FEATURES,
  API_CONFIG
};

export default appConfig;
