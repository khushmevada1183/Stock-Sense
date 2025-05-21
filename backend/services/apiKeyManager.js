/**
 * API Key Manager Service
 * 
 * This service manages multiple API keys and automatically rotates them when rate limits are hit.
 * It keeps track of:
 * 1. Which keys have hit their limits (both rate limits and monthly quotas)
 * 2. When those keys will become available again
 * 3. Rotating through available keys when needed
 */

const fs = require('fs');
const path = require('path');

// Monthly quota limit per API key
const MONTHLY_REQUEST_LIMIT = 500;

class ApiKeyManager {
  constructor(configPath) {
    this.configPath = configPath || path.join(__dirname, '../config/api-keys.json');
    this.keys = [];
    this.currentKeyIndex = 0; // Start with the first key and find a working one
    this.loadKeys();
  }

  /**
   * Load API keys from the configuration file
   */
  loadKeys() {
    try {
      // Make sure the directory exists
      const dir = path.dirname(this.configPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Create default config if it doesn't exist
      if (!fs.existsSync(this.configPath)) {
        const defaultKey = process.env.INDIAN_API_KEY || '';
        const defaultConfig = {
          keys: [
            {
              key: defaultKey,
              rateLimitResetTimestamp: 0,
              isAvailable: true,
              usageCount: 0,
              monthlyUsage: 0,
              lastMonthReset: new Date().toISOString().substring(0, 7), // YYYY-MM format
              lastErrorTimestamp: 0
            }
          ]
        };
        fs.writeFileSync(this.configPath, JSON.stringify(defaultConfig, null, 2));
      }

      // Load the config
      const config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
      this.keys = config.keys;

      // Filter out placeholder keys that start with "YOUR_API_KEY"
      this.keys = this.keys.filter(k => !k.key.startsWith('YOUR_API_KEY'));
      
      // Check if we have any keys left
      if (this.keys.length === 0) {
        console.warn('No valid API keys found in config. Using environment variable as fallback.');
        const defaultKey = process.env.INDIAN_API_KEY || '';
        this.keys = [
          {
            key: defaultKey,
            rateLimitResetTimestamp: 0,
            isAvailable: true,
            usageCount: 0,
            monthlyUsage: 0,
            lastMonthReset: new Date().toISOString().substring(0, 7),
            lastErrorTimestamp: 0
          }
        ];
      }

      // Update availability status based on current time
      this._refreshKeyAvailability();
      
      // Check if we need to reset monthly counters
      this._checkMonthlyReset();
      
      // Make sure the current key index is valid
      if (this.currentKeyIndex >= this.keys.length) {
        this.currentKeyIndex = 0;
      }
      
      // Log available keys count
      console.log(`Loaded ${this.keys.length} API keys from config`);
      console.log(`${this.keys.filter(k => k.isAvailable && k.monthlyUsage < MONTHLY_REQUEST_LIMIT).length} keys are available for use`);
      
      // Ensure we're starting with a working key
      this._ensureWorkingKey();
    } catch (error) {
      console.error('Error loading API keys:', error);
      
      // Initialize with environment variable as fallback
      const defaultKey = process.env.INDIAN_API_KEY || '';
      this.keys = [
        {
          key: defaultKey,
          rateLimitResetTimestamp: 0,
          isAvailable: true,
          usageCount: 0,
          monthlyUsage: 0,
          lastMonthReset: new Date().toISOString().substring(0, 7), // YYYY-MM format
          lastErrorTimestamp: 0
        }
      ];
    }
  }

  /**
   * Ensure we're starting with a working key
   * Try to use key at index 2 first, then rotate if needed
   */
  _ensureWorkingKey() {
    // If the current key is not available, try to find an available one
    if (!this.keys[this.currentKeyIndex] || !this.keys[this.currentKeyIndex].isAvailable) {
      this.rotateToNextAvailableKey();
    }
  }

  /**
   * Save the current key configuration
   */
  saveKeys() {
    try {
      const config = { keys: this.keys };
      fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2));
    } catch (error) {
      console.error('Error saving API keys:', error);
    }
  }

  /**
   * Get the current active API key
   */
  getCurrentKey() {
    this._refreshKeyAvailability();
    this._checkMonthlyReset();
    
    // Debug logs to track key rotation
    console.log(`Current key index: ${this.currentKeyIndex} of ${this.keys.length} total keys`);
    
    // Make sure current key index is valid
    if (this.currentKeyIndex >= this.keys.length) {
      console.warn('Current key index is out of bounds, resetting to 0');
      this.currentKeyIndex = 0;
    }
    
    const currentKey = this.keys[this.currentKeyIndex];
    console.log(`Current key: ${currentKey.key.substring(0, 10)}... (Monthly usage: ${currentKey.monthlyUsage}/${MONTHLY_REQUEST_LIMIT})`);
    console.log(`Available keys: ${this.keys.filter(k => k.isAvailable && k.monthlyUsage < MONTHLY_REQUEST_LIMIT).length}`);
    
    // If current key is not available or has hit monthly limit, try to rotate
    if (!currentKey.isAvailable || currentKey.monthlyUsage >= MONTHLY_REQUEST_LIMIT) {
      console.warn(`Current API key is unavailable or has reached its monthly limit`);
      const rotated = this.rotateToNextAvailableKey();
      console.log(`Key rotation attempted: ${rotated ? 'Success' : 'Failed'}`);
      if (rotated) {
        console.log(`Rotated to new key: ${this.keys[this.currentKeyIndex].key.substring(0, 10)}...`);
      } else {
        console.warn('Could not rotate to a new key, staying with current key');
      }
    }
    
    return this.keys[this.currentKeyIndex].key;
  }

  /**
   * Add a new API key to the rotation
   */
  addKey(apiKey) {
    // Check if key already exists
    if (this.keys.some(k => k.key === apiKey)) {
      return false; // Key already exists
    }

    this.keys.push({
      key: apiKey,
      rateLimitResetTimestamp: 0,
      isAvailable: true,
      usageCount: 0,
      monthlyUsage: 0,
      lastMonthReset: new Date().toISOString().substring(0, 7), // YYYY-MM format
      lastErrorTimestamp: 0
    });

    this.saveKeys();
    return true;
  }

  /**
   * Remove an API key from rotation
   */
  removeKey(apiKey) {
    const initialLength = this.keys.length;
    this.keys = this.keys.filter(k => k.key !== apiKey);
    
    // Make sure we always have at least one key
    if (this.keys.length === 0) {
      const defaultKey = process.env.INDIAN_API_KEY || '';
      this.keys.push({
        key: defaultKey,
        rateLimitResetTimestamp: 0,
        isAvailable: true,
        usageCount: 0,
        monthlyUsage: 0,
        lastMonthReset: new Date().toISOString().substring(0, 7), // YYYY-MM format
        lastErrorTimestamp: 0
      });
    }

    // Adjust current index if needed
    if (this.currentKeyIndex >= this.keys.length) {
      this.currentKeyIndex = 0;
    }

    this.saveKeys();
    return initialLength !== this.keys.length;
  }

  /**
   * Mark the current key as rate limited
   * @param {number} resetTimeInSeconds - When the key will be available again (in seconds)
   */
  markCurrentKeyRateLimited(resetTimeInSeconds = 1) {
    const resetTimestamp = Date.now() + (resetTimeInSeconds * 1000);
    this.keys[this.currentKeyIndex].isAvailable = false;
    this.keys[this.currentKeyIndex].rateLimitResetTimestamp = resetTimestamp;
    this.keys[this.currentKeyIndex].lastErrorTimestamp = Date.now();
    
    // Try to rotate to next available key
    this.rotateToNextAvailableKey();
    
    this.saveKeys();
  }

  /**
   * Record that the current key was used successfully
   */
  recordSuccessfulUse() {
    this.keys[this.currentKeyIndex].usageCount++;
    this.keys[this.currentKeyIndex].monthlyUsage++;
    
    // Check if we've hit the monthly limit
    if (this.keys[this.currentKeyIndex].monthlyUsage >= MONTHLY_REQUEST_LIMIT) {
      console.warn(`API Key ${this.keys[this.currentKeyIndex].key.substring(0, 10)}... has reached its monthly limit of ${MONTHLY_REQUEST_LIMIT} requests`);
      // Try to rotate to next available key
      this.rotateToNextAvailableKey();
    }
    
    this.saveKeys();
  }

  /**
   * Rotate to the next available API key
   * @returns {boolean} - Whether rotation was successful
   */
  rotateToNextAvailableKey() {
    this._refreshKeyAvailability();
    this._checkMonthlyReset();
    
    // Debug log - current key status
    const currentKey = this.keys[this.currentKeyIndex];
    console.log(`Current key status - Key: ${currentKey.key.substring(0, 10)}..., Available: ${currentKey.isAvailable}, MonthlyUsage: ${currentKey.monthlyUsage}/${MONTHLY_REQUEST_LIMIT}`);
    
    // Find any available key that hasn't hit monthly limits
    const availableKeys = this.keys.filter(k => 
      k.isAvailable && k.monthlyUsage < MONTHLY_REQUEST_LIMIT
    );
    
    console.log(`Found ${availableKeys.length} available keys out of ${this.keys.length} total keys`);
    
    if (availableKeys.length === 0) {
      console.warn('No available API keys! All keys are rate limited or have reached monthly quotas.');
      
      // Find keys that are just rate limited but not quota-limited
      const rateLimitedKeys = this.keys.filter(k => 
        !k.isAvailable && k.monthlyUsage < MONTHLY_REQUEST_LIMIT
      );
      
      if (rateLimitedKeys.length > 0) {
        console.log(`Found ${rateLimitedKeys.length} rate-limited keys that haven't reached monthly quota`);
        // Find the key that will become available the soonest
        const nextAvailableKey = rateLimitedKeys.reduce((earliest, current) => {
          if (!earliest) return current;
          return current.rateLimitResetTimestamp < earliest.rateLimitResetTimestamp ? current : earliest;
        }, null);
        
        if (nextAvailableKey) {
          const waitTime = Math.max(0, nextAvailableKey.rateLimitResetTimestamp - Date.now());
          console.log(`Next key will be available in ${Math.ceil(waitTime / 1000)} seconds`);
        }
      } else {
        console.error('All API keys have reached their monthly quotas. No more requests possible until next month.');
      }
      
      return false;
    }
    
    // Find the index of the next available key - improved algorithm
    // Start searching from the next key after the current one
    const startIndex = (this.currentKeyIndex + 1) % this.keys.length;
    let nextKeyIndex = null;
    
    // Log debugging info
    console.log(`Starting search for next key at index ${startIndex}`);
    
    // First try: look for available keys starting from startIndex
    for (let i = 0; i < this.keys.length; i++) {
      const checkIndex = (startIndex + i) % this.keys.length;
      const keyToCheck = this.keys[checkIndex];
      
      console.log(`Checking key at index ${checkIndex}: ${keyToCheck.key.substring(0, 10)}..., Available: ${keyToCheck.isAvailable}, MonthlyUsage: ${keyToCheck.monthlyUsage}`);
      
      if (keyToCheck.isAvailable && keyToCheck.monthlyUsage < MONTHLY_REQUEST_LIMIT) {
        nextKeyIndex = checkIndex;
        console.log(`Found available key at index ${nextKeyIndex}`);
        break;
      }
    }
    
    // If we found a key, update the current index
    if (nextKeyIndex !== null) {
      const oldIndex = this.currentKeyIndex;
      this.currentKeyIndex = nextKeyIndex;
      console.log(`Rotated from key index ${oldIndex} to ${nextKeyIndex}: ${this.keys[this.currentKeyIndex].key.substring(0, 10)}...`);
      return true;
    } else {
      console.log(`Could not find an available key after full rotation. Staying with current key index ${this.currentKeyIndex}`);
      return false;
    }
  }

  /**
   * Get all API keys with their status
   */
  getAllKeys() {
    this._refreshKeyAvailability();
    this._checkMonthlyReset();
    
    return this.keys.map(k => ({
      key: `${k.key.substring(0, 10)}...${k.key.substring(k.key.length - 4)}`, // Only show partial key for security
      isAvailable: k.isAvailable,
      resetTime: k.rateLimitResetTimestamp > Date.now() 
        ? new Date(k.rateLimitResetTimestamp).toISOString() 
        : 'Available now',
      usageCount: k.usageCount,
      monthlyUsage: k.monthlyUsage,
      monthlyLimit: MONTHLY_REQUEST_LIMIT,
      monthlyRemaining: Math.max(0, MONTHLY_REQUEST_LIMIT - k.monthlyUsage),
      monthlyUsagePercent: Math.round((k.monthlyUsage / MONTHLY_REQUEST_LIMIT) * 100),
      isCurrent: this.keys[this.currentKeyIndex].key === k.key
    }));
  }

  /**
   * Private: Update availability status based on current time
   */
  _refreshKeyAvailability() {
    const now = Date.now();
    this.keys.forEach(key => {
      if (!key.isAvailable && key.rateLimitResetTimestamp <= now) {
        key.isAvailable = true;
      }
    });
  }
  
  /**
   * Private: Check if we need to reset monthly usage counters
   */
  _checkMonthlyReset() {
    const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM format
    
    let saveNeeded = false;
    this.keys.forEach(key => {
      if (key.lastMonthReset !== currentMonth) {
        key.monthlyUsage = 0;
        key.lastMonthReset = currentMonth;
        saveNeeded = true;
      }
    });
    
    if (saveNeeded) {
      console.log(`Monthly usage counters reset for ${currentMonth}`);
      this.saveKeys();
    }
  }
}

// Create and export a singleton instance
const apiKeyManager = new ApiKeyManager();

module.exports = apiKeyManager; 