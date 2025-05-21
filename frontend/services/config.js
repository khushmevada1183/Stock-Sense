// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_INDIAN_API_URL || 'https://stock.indianapi.in',
  API_KEY: process.env.NEXT_PUBLIC_INDIAN_API_KEY || 'sk-live-0KwlkkkbLj6KxWuyNimN0gkigsRck7mYP1CTq3Zq',
  // API key rotation pool with all valid keys
  API_KEYS: process.env.NEXT_PUBLIC_INDIAN_API_KEYS ? 
    process.env.NEXT_PUBLIC_INDIAN_API_KEYS.split(',') : 
    [
      // Default API keys if environment variables are not set
      'sk-live-V4dyXhcHcQCFuxnLYWKmBM2jzKxDilFMl4BklW67',
      'sk-live-kQSxsVhWZyIk8sGy2gzXGBvi97RETSP88OOG2qt3',
      'sk-live-QtygcAU1VLXuNtIHRAVNWnLrtoTpL0yctd2DEko5',
      'sk-live-bi47a6KsAGkHsFAguG0sKBNzCf8VbTVFweOy1eFE',
      'sk-live-uZup2KEHVqDo2zyAunRH0zp9aaRNpyGgxKU7GApI',
      'sk-live-rB1W61qZPLlzufRlnRfS937jYQBEmM8D4TUPdpFh',
      'sk-live-1jzFVqgbxWnQCwRgG9NynigeR72HtkbioKch1VaD',
      'sk-live-2SrhjLseRYGxjv8JzfGFZ3D4ZyGOqZatL8ADODKL',
      'sk-live-2cEMmBrNbaIP1v3OjVNwNMbRnO49hvCeOayo5jAA',
      'sk-live-jtOlHh18hooTAJQmcLUz4mngn9gxSvY4uRyVUpGJ',
      'sk-live-K4wtBGXesvkus7wdkmT3uQ1g9qnlaLuN8TqQoXht'
    ],
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes cache duration
  // API key rotation settings
  KEY_ROTATION: {
    ENABLED: true,
    AUTO_ROTATE_ON_429: true, // Automatically rotate on rate limit error
    ROTATION_INTERVAL: 60 * 60 * 1000, // 1 hour regular rotation
    MAX_CONSECUTIVE_FAILURES: 2, // Maximum failures before forced rotation
    RETRY_DELAY: 1000, // Delay between retries in ms
  }
};

// Feature flags
export const FEATURES = {
  ENABLE_REAL_TIME_UPDATES: true,
  ENABLE_CACHING: true,
  ENABLE_OFFLINE_MODE: false,
  SHOW_MOCK_DATA_WHEN_API_FAILS: false // Disabled since we now have working API keys
};

// Mock data (fallback when API fails)
export const MOCK_DATA = {
  // Placeholder for mock data
  // Will be populated on demand
};

export default {
  API_CONFIG,
  FEATURES,
  MOCK_DATA
}; 