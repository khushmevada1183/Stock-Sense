// Configuration constants for the application
export const FEATURES = {
  ENABLE_REAL_TIME_UPDATES: false,
  ENABLE_CACHING: true,
  ENABLE_DEBUG_MODE: false
};

export const API_CONFIG = {
  BASE_URL: 'INTEGRATION_DISABLED',
  TIMEOUT: 0,
  RETRY_ATTEMPTS: 0,
  CACHE_DURATION: 0,
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
