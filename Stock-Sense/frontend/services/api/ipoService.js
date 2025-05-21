import axios from 'axios';
import { API_CONFIG } from '../config';

// API Configuration 
const API_BASE_URL = API_CONFIG.BASE_URL || 'https://stock.indianapi.in';

// IMPORTANT: This API only supports GET requests!
// Using HEAD, POST, PUT, or DELETE will result in 405 Method Not Allowed errors

// API Key rotation state
let currentKeyIndex = 0;
let consecutiveFailures = 0;
let lastKeyRotation = Date.now();

// Get current API key from the rotation pool
const getCurrentApiKey = () => {
  if (!API_CONFIG.API_KEYS || API_CONFIG.API_KEYS.length === 0) {
    return API_CONFIG.API_KEY; // Fallback to single key if no pool
  }
  return API_CONFIG.API_KEYS[currentKeyIndex];
};

// Rotate to the next API key in the pool
const rotateApiKey = (reason = 'manual') => {
  if (!API_CONFIG.API_KEYS || API_CONFIG.API_KEYS.length <= 1) {
    console.warn('API key rotation not possible: Insufficient keys in pool');
    return false;
  }
  
  const oldKey = getCurrentApiKey();
  const oldIndex = currentKeyIndex;
  
  // Move to next key in rotation
  currentKeyIndex = (currentKeyIndex + 1) % API_CONFIG.API_KEYS.length;
  const newKey = getCurrentApiKey();
  
  // Reset consecutive failures counter
  consecutiveFailures = 0;
  lastKeyRotation = Date.now();
  
  // Update axios instance headers with new key
  apiClient.defaults.headers['X-Api-Key'] = newKey;
  
  console.log(`API key rotated (reason: ${reason}). Key index changed from ${oldIndex} to ${currentKeyIndex}`);
  return true;
};

// Schedule regular key rotation if enabled
if (API_CONFIG.KEY_ROTATION?.ENABLED && API_CONFIG.KEY_ROTATION?.ROTATION_INTERVAL > 0) {
  setInterval(() => {
    rotateApiKey('scheduled');
  }, API_CONFIG.KEY_ROTATION.ROTATION_INTERVAL);
}

// Create Axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'X-Api-Key': getCurrentApiKey(),
    'Content-Type': 'application/json'
  },
  timeout: API_CONFIG.TIMEOUT || 10000 // 10 second timeout
});

// Cache configuration
const CACHE_DURATION = API_CONFIG.CACHE_DURATION || 5 * 60 * 1000; // 5 minutes cache
let ipoDataCache = {
  data: null,
  timestamp: 0
};

/**
 * Fetches IPO data from the API with automatic key rotation on rate limit
 * @returns {Promise<Object>} Processed IPO data
 */
export const fetchIPOData = async () => {
  let attempts = 0;
  const maxAttempts = API_CONFIG.RETRY_ATTEMPTS || 3;
  
  while (attempts < maxAttempts) {
    try {
      // Check if cache is valid
      const now = Date.now();
      if (ipoDataCache.data && (now - ipoDataCache.timestamp < CACHE_DURATION)) {
        console.log('Using cached IPO data');
        return ipoDataCache.data;
      }

      // Make API request - Note: Only GET is supported by this API!
      console.log(`Fetching fresh IPO data from API (attempt ${attempts + 1}/${maxAttempts})`);
      console.log(`Using API key: ${getCurrentApiKey().substring(0, 12)}...`);
      console.log(`Requesting from: ${API_BASE_URL}/ipo`);
      
      // Add a timeout to better detect connection issues
      const { data } = await apiClient.get('/ipo');

      // Log successful API response
      console.log('API response received successfully');
      console.log('Raw IPO data structure:', Object.keys(data));
      
      // Reset consecutive failures on success
      consecutiveFailures = 0;
      
      // Process the data
      const processedData = processIPOData(data);
      
      // Update cache
      ipoDataCache = {
        data: processedData,
        timestamp: now
      };
      
      return processedData;
    } catch (error) {
      attempts++;
      console.error(`Error fetching IPO data (attempt ${attempts}/${maxAttempts}):`, error);
      
      // Handle rate limit errors with key rotation if enabled
      if (error.response && error.response.status === 429) {
        console.warn('API rate limit hit');
        consecutiveFailures++;
        
        if (API_CONFIG.KEY_ROTATION?.AUTO_ROTATE_ON_429) {
          const rotated = rotateApiKey('rate_limit');
          if (rotated) {
            console.log(`Retrying with new API key after rate limit error`);
            // Small delay before retry
            await new Promise(r => setTimeout(r, API_CONFIG.KEY_ROTATION?.RETRY_DELAY || 1000));
            continue; // Retry immediately with new key
          }
        }
      } else if (error.response && error.response.status === 405) {
        // Handle Method Not Allowed errors - the API only supports GET
        console.error('API method not allowed: This API only supports GET requests');
        throw new Error('API method not allowed: The Indian Stock API only supports GET requests');
      } else {
        // For non-rate-limit errors, increment failure counter
        consecutiveFailures++;
      }
      
      // Check if we need to rotate due to consecutive failures
      if (
        consecutiveFailures >= (API_CONFIG.KEY_ROTATION?.MAX_CONSECUTIVE_FAILURES || 2) && 
        API_CONFIG.KEY_ROTATION?.ENABLED
      ) {
        const rotated = rotateApiKey('consecutive_failures');
        if (rotated && attempts < maxAttempts) {
          console.log(`Retrying with new API key after ${consecutiveFailures} consecutive failures`);
          // Small delay before retry
          await new Promise(r => setTimeout(r, API_CONFIG.KEY_ROTATION?.RETRY_DELAY || 1000));
          continue; // Retry with new key
        }
      }
      
      // Implement improved detailed error handling
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error(`Server responded with status: ${error.response.status}`);
        console.error('Error response data:', error.response.data);
        
        if (error.response.status === 429) {
          throw new Error('API rate limit exceeded. Please try again later.');
        } else if (error.response.status === 401) {
          throw new Error('API authentication failed. Check your API key.');
        } else if (error.response.status === 403) {
          throw new Error('API access forbidden. Your API key may be invalid or your subscription expired.');
        } else if (error.response.status === 404) {
          throw new Error('API endpoint not found. The IPO data endpoint may have changed.');
        } else if (error.response.status === 405) {
          throw new Error('Method not allowed. The Indian Stock API only supports GET requests.');
        } else if (error.response.status >= 500) {
          throw new Error(`API server error (${error.response.status}). The server is experiencing issues.`);
        } else {
          throw new Error(`API error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`);
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received from API request');
        if (error.code === 'ECONNABORTED') {
          throw new Error('API request timed out. The server took too long to respond.');
        } else if (error.code === 'ECONNREFUSED') {
          throw new Error('API connection refused. The server may be down or the URL is incorrect.');
        } else if (error.code === 'ENOTFOUND') {
          throw new Error('API host not found. Check your internet connection or API URL.');
        } else {
          throw new Error(`No response received from API. Please check your internet connection. Error code: ${error.code || 'unknown'}`);
        }
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error setting up request:', error.message);
        throw new Error(`Error connecting to API: ${error.message}`);
      }
    }
  }
  
  // If we've exhausted all retries
  throw new Error(`Failed to fetch IPO data after ${maxAttempts} attempts with ${API_CONFIG.API_KEYS?.length || 1} different API keys`);
};

/**
 * Process the raw IPO data into a format suitable for the UI
 * @param {Object} rawData - Raw data from the API
 * @returns {Object} Processed data
 */
const processIPOData = (rawData) => {
  // Initialize result structure
  const result = {
    statistics: {
      upcoming: 0,
      active: 0,
      recentlyListed: 0
    },
    upcomingIPOs: [],
    activeIPOs: [],
    recentlyListedIPOs: []
  };

  // Safety check for common API response formats
  let upcomingIPOsData = [];
  let activeIPOsData = [];
  let listedIPOsData = [];
  
  console.log('API response structure:', Object.keys(rawData));
  
  // Handle structured response with upcoming, active, listed, closed categories
  if (rawData && typeof rawData === 'object') {
    // Process upcoming IPOs
    if (rawData.upcoming && Array.isArray(rawData.upcoming)) {
      upcomingIPOsData = rawData.upcoming;
      console.log(`Found ${upcomingIPOsData.length} upcoming IPOs in response`);
    }
    
    // Process active IPOs
    if (rawData.active && Array.isArray(rawData.active)) {
      activeIPOsData = rawData.active;
      console.log(`Found ${activeIPOsData.length} active IPOs in response`);
    }
    
    // Process listed and closed IPOs (combine them as "recently listed")
    if (rawData.listed && Array.isArray(rawData.listed)) {
      listedIPOsData = [...listedIPOsData, ...rawData.listed];
      console.log(`Found ${rawData.listed.length} listed IPOs in response`);
    }
    
    if (rawData.closed && Array.isArray(rawData.closed)) {
      listedIPOsData = [...listedIPOsData, ...rawData.closed];
      console.log(`Found ${rawData.closed.length} closed IPOs in response`);
    }
  } else if (rawData && rawData.data && Array.isArray(rawData.data)) {
    // Fallback to legacy format
    upcomingIPOsData = rawData.data;
    console.log(`Using fallback: Processing ${upcomingIPOsData.length} IPOs from data array`);
  } else if (rawData && Array.isArray(rawData)) {
    // Fallback for array at root
    upcomingIPOsData = rawData;
    console.log(`Using fallback: Processing ${upcomingIPOsData.length} IPOs from root array`);
  } else {
    console.error('Unexpected API response format:', rawData);
    return result;
  }
  
  // Set statistics
  result.statistics.upcoming = upcomingIPOsData.length;
  result.statistics.active = activeIPOsData.length;
  result.statistics.recentlyListed = listedIPOsData.length;
  
  // Process upcoming IPOs
  upcomingIPOsData.forEach(ipo => {
    // Clean and normalize data - handle different possible field names from API
    const processedIpo = {
      company_name: ipo.company_name || ipo.companyName || ipo.name || 'Unknown Company',
      name: ipo.name, // Preserve original name field
      symbol: ipo.symbol || ipo.ticker || ipo.code || 'N/A',
      logo: ipo.logo || ipo.companyLogo || ipo.image || null,
      price_range: ipo.price_range || ipo.priceRange || `₹${ipo.minPrice || 0} - ₹${ipo.maxPrice || 0}`,
      issue_size: formatIssueSize(ipo.issue_size || ipo.issueSize || ipo.size),
      issue_type: ipo.issue_type || ipo.issueType || 'Book Built',
      open: formatDate(ipo.open || ipo.openDate || ipo.issueStartDate),
      close: formatDate(ipo.close || ipo.closeDate || ipo.issueEndDate),
      listing_date: formatDate(ipo.listing_date || ipo.listingDate),
      subscription_status: getStatusFromFields(ipo),
      status: ipo.status, // Keep original status field
      ipo_price: ipo.ipo_price || ipo.ipoPrice || ipo.issuePrice || 'N/A',
      issue_price: ipo.issue_price, // Keep original numeric issue_price
      listing_price: ipo.listing_price || ipo.listingPrice || 'N/A',
      listing_gain: ipo.listing_gain || ipo.listingGain || calculateGain(ipo.ipo_price, ipo.listing_price) || 'N/A',
      listing_gains: ipo.listing_gains, // Keep original listing_gains field
      current_price: ipo.current_price || ipo.currentPrice || ipo.latestPrice || 'N/A',
      current_return: ipo.current_return || ipo.currentReturn || calculateGain(ipo.ipo_price, ipo.current_price) || 'N/A',
      rhpLink: ipo.rhpLink || ipo.documents?.rhp || null,
      drhpLink: ipo.drhpLink || ipo.documents?.drhp || null,
      document_url: ipo.document_url, // Keep original document_url field
      description: ipo.description || ipo.about || '',
      lot_size: ipo.lot_size || ipo.lotSize || 'N/A',
      min_amount: formatCurrency(ipo.min_amount || ipo.minAmount || calculateMinInvestment(ipo)),
      
      // Include min_price and max_price directly from the API
      min_price: ipo.min_price,
      max_price: ipo.max_price,
      
      // Additional fields that might be in the API response
      exchange: ipo.exchange || 'NSE/BSE',
      registrar: ipo.registrar || 'N/A',
      listingGainPercentage: ipo.listingGainPercentage || extractPercentage(ipo.listing_gain) || 'N/A',
      gmp: ipo.gmp || ipo.greyMarketPremium || 'N/A',  // Grey Market Premium
      subscriptionRate: ipo.subscriptionRate || ipo.overallSubscription || 'N/A',
      retailSubscriptionRate: ipo.retailSubscriptionRate || ipo.retailSubscription || 'N/A',
      qibSubscriptionRate: ipo.qibSubscriptionRate || ipo.qibSubscription || 'N/A',
      niiSubscriptionRate: ipo.niiSubscriptionRate || ipo.niiSubscription || 'N/A',
      
      // Additional API fields
      is_sme: ipo.is_sme,
      additional_text: ipo.additional_text,
      bidding_start_date: ipo.bidding_start_date,
      bidding_end_date: ipo.bidding_end_date,
    };

    // Already categorized by the API response
    result.upcomingIPOs.push(processedIpo);
  });
  
  // Process active IPOs
  activeIPOsData.forEach(ipo => {
    // Clean and normalize data - handle different possible field names from API
    const processedIpo = {
      company_name: ipo.company_name || ipo.companyName || ipo.name || 'Unknown Company',
      name: ipo.name, // Preserve original name field
      symbol: ipo.symbol || ipo.ticker || ipo.code || 'N/A',
      logo: ipo.logo || ipo.companyLogo || ipo.image || null,
      price_range: ipo.price_range || ipo.priceRange || `₹${ipo.minPrice || 0} - ₹${ipo.maxPrice || 0}`,
      issue_size: formatIssueSize(ipo.issue_size || ipo.issueSize || ipo.size),
      issue_type: ipo.issue_type || ipo.issueType || 'Book Built',
      open: formatDate(ipo.open || ipo.openDate || ipo.issueStartDate),
      close: formatDate(ipo.close || ipo.closeDate || ipo.issueEndDate),
      listing_date: formatDate(ipo.listing_date || ipo.listingDate),
      subscription_status: 'Active', // Force status for active IPOs
      status: ipo.status, // Keep original status field
      ipo_price: ipo.ipo_price || ipo.ipoPrice || ipo.issuePrice || 'N/A',
      issue_price: ipo.issue_price, // Keep original numeric issue_price
      listing_price: ipo.listing_price || ipo.listingPrice || 'N/A',
      listing_gain: ipo.listing_gain || ipo.listingGain || calculateGain(ipo.ipo_price, ipo.listing_price) || 'N/A',
      listing_gains: ipo.listing_gains, // Keep original listing_gains field
      current_price: ipo.current_price || ipo.currentPrice || ipo.latestPrice || 'N/A',
      current_return: ipo.current_return || ipo.currentReturn || calculateGain(ipo.ipo_price, ipo.current_price) || 'N/A',
      rhpLink: ipo.rhpLink || ipo.documents?.rhp || null,
      drhpLink: ipo.drhpLink || ipo.documents?.drhp || null,
      document_url: ipo.document_url, // Keep original document_url field
      description: ipo.description || ipo.about || '',
      lot_size: ipo.lot_size || ipo.lotSize || 'N/A',
      min_amount: formatCurrency(ipo.min_amount || ipo.minAmount || calculateMinInvestment(ipo)),
      
      // Include min_price and max_price directly from the API
      min_price: ipo.min_price,
      max_price: ipo.max_price,
      
      // Additional fields that might be in the API response
      exchange: ipo.exchange || 'NSE/BSE',
      registrar: ipo.registrar || 'N/A',
      listingGainPercentage: ipo.listingGainPercentage || extractPercentage(ipo.listing_gain) || 'N/A',
      gmp: ipo.gmp || ipo.greyMarketPremium || 'N/A',  // Grey Market Premium
      subscriptionRate: ipo.subscriptionRate || ipo.overallSubscription || 'N/A',
      retailSubscriptionRate: ipo.retailSubscriptionRate || ipo.retailSubscription || 'N/A',
      qibSubscriptionRate: ipo.qibSubscriptionRate || ipo.qibSubscription || 'N/A',
      niiSubscriptionRate: ipo.niiSubscriptionRate || ipo.niiSubscription || 'N/A',
      
      // Additional API fields
      is_sme: ipo.is_sme,
      additional_text: ipo.additional_text,
      bidding_start_date: ipo.bidding_start_date,
      bidding_end_date: ipo.bidding_end_date,
    };
    
    // Add to active IPOs array
    result.activeIPOs.push(processedIpo);
  });
  
  // Process listed/closed IPOs
  listedIPOsData.forEach(ipo => {
    // Clean and normalize data - handle different possible field names from API
    const processedIpo = {
      // Preserve all original API fields
      ...ipo,
      
      // Add normalized fields that UI components expect
      company_name: ipo.company_name || ipo.companyName || ipo.name || 'Unknown Company',
      name: ipo.name, // Keep original name field
      symbol: ipo.symbol || ipo.ticker || ipo.code || 'N/A',
      logo: ipo.logo || ipo.companyLogo || ipo.image || null,
      price_range: ipo.price_range || ipo.priceRange || (ipo.min_price && ipo.max_price ? `₹${ipo.min_price} - ₹${ipo.max_price}` : 'N/A'),
      issue_size: formatIssueSize(ipo.issue_size || ipo.issueSize || ipo.size),
      issue_type: ipo.issue_type || ipo.issueType || 'Book Built',
      open: formatDate(ipo.open || ipo.openDate || ipo.bidding_start_date),
      close: formatDate(ipo.close || ipo.closeDate || ipo.bidding_end_date),
      listing_date: formatDate(ipo.listing_date || ipo.listingDate),
      subscription_status: ipo.subscription_status || ipo.status || 'Listed', // Default to Listed
      status: ipo.status || 'listed', // Ensure status is always set
      
      // Price and gain fields - critical for Recently Listed IPO display
      issue_price: ipo.issue_price, // Keep original numeric value
      ipo_price: ipo.ipo_price || (ipo.issue_price ? `₹${ipo.issue_price}` : 'N/A'),
      listing_price: ipo.listing_price,
      
      // Format listing gains properly - critical for display with % symbol
      listing_gain: ipo.listing_gain || 
        (typeof ipo.listing_gains === 'number' ? 
          `${(ipo.listing_gains * 100).toFixed(2)}%` : 
          (ipo.listing_gains || calculateGain(ipo.issue_price, ipo.listing_price) || 'N/A')),
          
      // Keep original listing_gains field (number format)
      listing_gains: ipo.listing_gains,
      
      // Add document links
      rhpLink: ipo.rhpLink || ipo.documents?.rhp || null,
      drhpLink: ipo.drhpLink || ipo.documents?.drhp || null,
      document_url: ipo.document_url, // Preserve original document_url from API
      
      // Other normalized fields
      description: ipo.description || ipo.about || '',
      lot_size: ipo.lot_size || ipo.lotSize || 'N/A',
      min_amount: formatCurrency(ipo.min_amount || ipo.minAmount || calculateMinInvestment(ipo)),
      
      // Ensure min_price and max_price are preserved for UI display
      min_price: ipo.min_price,
      max_price: ipo.max_price,
      
      // Additional fields from API - preserve them
      bidding_start_date: ipo.bidding_start_date,
      bidding_end_date: ipo.bidding_end_date,
      is_sme: ipo.is_sme,
      additional_text: ipo.additional_text
    };
    
    // Add to recently listed IPOs array
    result.recentlyListedIPOs.push(processedIpo);
  });

  // Add direct debug output for the first few listed IPOs
  if (result.recentlyListedIPOs.length > 0) {
    console.log(`API processed ${result.recentlyListedIPOs.length} recently listed IPOs`);
    console.log('First listed IPO after processing:', JSON.stringify(result.recentlyListedIPOs[0], null, 2));
    
    // Check required fields for UI display
    const firstIpo = result.recentlyListedIPOs[0];
    console.log('Key listed IPO fields check:');
    console.log('- company_name:', firstIpo.company_name);
    console.log('- name:', firstIpo.name);
    console.log('- symbol:', firstIpo.symbol);
    console.log('- status:', firstIpo.status);
    console.log('- subscription_status:', firstIpo.subscription_status);
    console.log('- issue_price:', firstIpo.issue_price, typeof firstIpo.issue_price);
    console.log('- ipo_price:', firstIpo.ipo_price);
    console.log('- listing_gains:', firstIpo.listing_gains, typeof firstIpo.listing_gains);
    console.log('- listing_gain:', firstIpo.listing_gain);
    console.log('- min_price:', firstIpo.min_price);
    console.log('- max_price:', firstIpo.max_price);
    console.log('- listing_price:', firstIpo.listing_price);
  }

  // Sort IPOs by relevant dates
  result.upcomingIPOs.sort((a, b) => {
    const dateA = tryParseDate(a.open) || new Date(9999, 11, 31);
    const dateB = tryParseDate(b.open) || new Date(9999, 11, 31);
    return dateA - dateB;
  });
  
  // Sort active IPOs by closing date (soonest first)
  result.activeIPOs.sort((a, b) => {
    const dateA = tryParseDate(a.close) || new Date(9999, 11, 31);
    const dateB = tryParseDate(b.close) || new Date(9999, 11, 31);
    return dateA - dateB;
  });

  result.recentlyListedIPOs.sort((a, b) => {
    const dateA = tryParseDate(a.listing_date) || new Date(0);
    const dateB = tryParseDate(b.listing_date) || new Date(0);
    return dateB - dateA; // Most recent first
  });

  console.log(`Processed IPO data: ${result.statistics.upcoming} upcoming, ${result.statistics.active} active, ${result.statistics.recentlyListed} recently listed IPOs`);
  return result;
};

/**
 * Try to parse a date string, returning null if invalid
 * @param {string} dateString Date string to parse
 * @returns {Date|null} Parsed date or null if invalid
 */
const tryParseDate = (dateString) => {
  if (!dateString || dateString === 'Not Announced' || dateString === 'N/A' || dateString === 'Not Issued') {
    return null;
  }
  
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
};

/**
 * Get status from various possible API field names
 * @param {Object} ipo IPO data 
 * @returns {string} Standardized status
 */
const getStatusFromFields = (ipo) => {
  // Check various possible field names for status
  const status = ipo.subscription_status || ipo.status || ipo.ipoStatus;
  if (status) return status;
  
  // If no explicit status, try to determine from dates
  const now = new Date();
  const openDate = tryParseDate(ipo.open || ipo.openDate || ipo.issueStartDate);
  const closeDate = tryParseDate(ipo.close || ipo.closeDate || ipo.issueEndDate);
  const listingDate = tryParseDate(ipo.listing_date || ipo.listingDate);
  
  if (openDate && openDate > now) {
    return 'Upcoming';
  } else if (openDate && openDate <= now && closeDate && closeDate >= now) {
    return 'Open';
  } else if (listingDate && listingDate <= now) {
    return 'Listed';
  } else if (closeDate && closeDate < now) {
    return 'Closed';
  }
  
  return 'Announced'; // Default status
};

/**
 * Calculate minimum investment amount from lot size and price
 * @param {Object} ipo IPO data
 * @returns {number|null} Minimum investment amount
 */
const calculateMinInvestment = (ipo) => {
  const lotSize = parseInt(ipo.lot_size || ipo.lotSize || '0', 10);
  let price = 0;
  
  // Try to get the price from various fields
  if (ipo.price_range) {
    // Extract first number from price range
    const match = ipo.price_range.match(/\d+(\.\d+)?/);
    if (match) {
      price = parseFloat(match[0]);
    }
  } else if (ipo.minPrice) {
    price = parseFloat(ipo.minPrice);
  } else if (ipo.maxPrice) {
    price = parseFloat(ipo.maxPrice);
  } else if (ipo.ipo_price) {
    // Extract number from ipo_price
    const match = ipo.ipo_price.match(/\d+(\.\d+)?/);
    if (match) {
      price = parseFloat(match[0]);
    }
  }
  
  if (lotSize && price) {
    return lotSize * price;
  }
  
  return null;
};

/**
 * Extract percentage from string
 * @param {string} percentString String containing percentage
 * @returns {string|null} Extracted percentage
 */
const extractPercentage = (percentString) => {
  if (!percentString) return null;
  
  // Try to extract percentage value with % sign
  const match = percentString.match(/(-?\d+(\.\d+)?)%/);
  if (match) {
    return match[0];
  }
  return null;
};

/**
 * Calculate price gain/loss as percentage
 * @param {string|number} initialPrice Initial price
 * @param {string|number} finalPrice Final price
 * @returns {string|null} Formatted percentage
 */
const calculateGain = (initialPrice, finalPrice) => {
  if (!initialPrice || !finalPrice) return null;
  
  // Extract numeric values
  const initial = extractNumericValue(initialPrice);
  const final = extractNumericValue(finalPrice);
  
  if (!initial || !final || initial === 0) return null;
  
  const gainPercent = ((final - initial) / initial) * 100;
  return `${gainPercent >= 0 ? '+' : ''}${gainPercent.toFixed(2)}%`;
};

/**
 * Extract numeric value from price string
 * @param {string|number} value Price value
 * @returns {number|null} Extracted numeric value
 */
const extractNumericValue = (value) => {
  if (typeof value === 'number') return value;
  if (!value || typeof value !== 'string') return null;
  
  // Extract numeric part from string like "₹123.45" or "123.45"
  const match = value.match(/(\d+(\.\d+)?)/);
  return match ? parseFloat(match[0]) : null;
};

/**
 * Format issue size for display
 * @param {string|number} issueSize Issue size
 * @returns {string} Formatted issue size
 */
const formatIssueSize = (issueSize) => {
  if (!issueSize) return 'N/A';
  
  // If already formatted with Cr/Crore, return as is
  if (typeof issueSize === 'string' && 
     (issueSize.includes('Cr') || issueSize.includes('crore') || issueSize.includes('Crore'))) {
    return issueSize;
  }
  
  // Convert to number and format
  const sizeValue = extractNumericValue(issueSize);
  if (!sizeValue) return String(issueSize);
  
  return formatCurrency(sizeValue);
};

/**
 * Formats currency amounts for display
 * @param {string|number} amount - The amount to format
 * @returns {string} Formatted amount
 */
export const formatCurrency = (amount) => {
  if (!amount || amount === 'N/A' || amount === 'Not Issued') {
    return amount;
  }
  
  // Handle string amounts with "₹" or "Rs" prefix
  if (typeof amount === 'string') {
    // Remove currency symbols and commas for parsing
    const cleanAmount = amount.replace(/[₹Rs,\s]/g, '');
    if (isNaN(parseFloat(cleanAmount))) {
      return amount;
    }
    
    // Check if it contains "Cr" or "Crore"
    if (amount.includes('Cr') || amount.includes('Crore')) {
      return amount; // Already formatted as crores
    }
    
    // Parse and format
    const numAmount = parseFloat(cleanAmount);
    return formatIndianCurrency(numAmount);
  }
  
  // Handle numerical amounts
  return formatIndianCurrency(amount);
};

/**
 * Formats a number in Indian currency format (with crores and lakhs)
 * @param {number} amount - The amount to format
 * @returns {string} Formatted amount
 */
const formatIndianCurrency = (amount) => {
  if (amount >= 10000000) {
    // Convert to crores (1 crore = 10 million)
    return `₹${(amount / 10000000).toFixed(2)} Cr.`;
  } else if (amount >= 100000) {
    // Convert to lakhs (1 lakh = 100 thousand)
    return `₹${(amount / 100000).toFixed(2)} Lakh`;
  } else {
    // Regular formatting for smaller amounts
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  }
};

/**
 * Formats a date string into a user-friendly format
 * @param {string} dateString - The date string to format
 * @returns {string} Formatted date
 */
export const formatDate = (dateString) => {
  if (!dateString || dateString === 'Not Announced' || dateString === 'N/A') {
    return dateString || 'Not Announced';
  }
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString; // Return original if parsing fails
    }
    
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

export default {
  fetchIPOData,
  formatCurrency,
  formatDate
}; 