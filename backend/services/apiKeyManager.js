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
    this.currentKeyIndex = 2; // Start with the working key (index 2)
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

      // Update availability status based on current time
      this._refreshKeyAvailability();
      
      // Check if we need to reset monthly counters
      this._checkMonthlyReset();
      
      // Make sure the current key index is valid
      if (this.currentKeyIndex >= this.keys.length) {
        this.currentKeyIndex = 0;
      }
      
      // Ensure we're starting with a working key
      this._ensureWorkingKey();
      
      console.log(`Loaded ${this.keys.length} API keys from config`);
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
    
    // If current key has hit monthly limit, try to rotate
    if (this.keys[this.currentKeyIndex].monthlyUsage >= MONTHLY_REQUEST_LIMIT) {
      console.warn(`Current API key has reached its monthly limit of ${MONTHLY_REQUEST_LIMIT} requests`);
      this.rotateToNextAvailableKey();
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
    
    // Find any available key that hasn't hit monthly limits
    const availableKeys = this.keys.filter(k => 
      k.isAvailable && k.monthlyUsage < MONTHLY_REQUEST_LIMIT
    );
    
    if (availableKeys.length === 0) {
      console.warn('No available API keys! All keys are rate limited or have reached monthly quotas.');
      
      // Find keys that are just rate limited but not quota-limited
      const rateLimitedKeys = this.keys.filter(k => 
        !k.isAvailable && k.monthlyUsage < MONTHLY_REQUEST_LIMIT
      );
      
      if (rateLimitedKeys.length > 0) {
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
    
    // Find the index of the next available key
    let foundNextKey = false;
    let startSearchIndex = (this.currentKeyIndex + 1) % this.keys.length;
    let nextKeyIndex = startSearchIndex;
    
    do {
      if (this.keys[nextKeyIndex].isAvailable && 
          this.keys[nextKeyIndex].monthlyUsage < MONTHLY_REQUEST_LIMIT) {
        foundNextKey = true;
        break;
      }
      nextKeyIndex = (nextKeyIndex + 1) % this.keys.length;
    } while (nextKeyIndex !== startSearchIndex);
    
    if (foundNextKey) {
      this.currentKeyIndex = nextKeyIndex;
      console.log(`Rotated to next available API key: ${this.keys[this.currentKeyIndex].key.substring(0, 10)}...`);
      return true;
    }
    
    return false;
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