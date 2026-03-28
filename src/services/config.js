// Configuration constants for the application
export const FEATURES = {
  ENABLE_REAL_TIME_UPDATES: true,
  ENABLE_CACHING: true,
  ENABLE_DEBUG_MODE: false
};

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  CACHE_DURATION: 300000, // 5 minutes in milliseconds
  KEY_ROTATION: {
    ENABLED: true,
    AUTO_ROTATE_ON_429: true,
    MAX_CONSECUTIVE_FAILURES: 2
  },
  API_KEYS: process.env.NEXT_PUBLIC_INDIAN_API_KEYS?.split(',') || []
};

const appConfig = {
  FEATURES,
  API_CONFIG
};

export default appConfig;
