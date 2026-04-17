// Configuration constants for the application
export const FEATURES = {
  ENABLE_REAL_TIME_UPDATES: true,
  ENABLE_CACHING: true,
  ENABLE_DEBUG_MODE: false
};

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000/api/v1',
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
