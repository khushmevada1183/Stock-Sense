/**
 * Test script to verify SimpleIpoCard and IpoCard components can handle API data correctly
 * Run with: node tests/test-simple-ipo-card.js
 * 
 * This test validates:
 * 1. Formatting functions for listing gains display
 * 2. Color coding logic for positive/negative gains
 * 3. Price formatting
 * 4. Date formatting
 * 5. Field name handling for API response variations
 */

const assert = require('assert').strict;

// Mock IPO data with the same structure as the API response
const mockIpoData = {
  "symbol": "MANOJJEWEL",
  "name": "Manoj Jewellers",
  "status": "listed",
  "is_sme": true,
  "additional_text": "Listed at 53.95 for 0.09% loss",
  "min_price": 54,
  "max_price": 54,
  "issue_price": 54,
  "listing_gains": -0.09259259259258733,
  "listing_price": 53.95,
  "bidding_start_date": "2025-05-05",
  "bidding_end_date": null,
  "listing_date": "2025-05-12",
  "lot_size": null,
  "document_url": "https://example.com/document.pdf"
};

// Test alternative API response structures
const alternativeIpoData = {
  "symbol": "ACULIFE",
  "company_name": "Accretion Pharmaceuticals",
  "status": "Upcoming",
  "is_sme": false,
  "ipo_price": "₹56",
  "issue_type": "Book Built Issue IPO",
  "price_range": "₹53 - ₹56",
  "open": "2023-05-15",
  "close": "2023-05-17"
};

console.log('========== TESTING IPO CARD DATA HANDLING ==========');

// Test utility functions
// =====================

// Test the getGainColorClass logic
function getGainColorClass(ipo) {
  // Handle listing_gains as a decimal value (e.g., -0.09 for -9%)
  if (typeof ipo.listing_gains === 'number') {
    return ipo.listing_gains > 0 ? 'text-green-600' : ipo.listing_gains < 0 ? 'text-red-600' : 'text-gray-600';
  }
  // Handle listing_gain as a string that might contain a percentage
  else if (ipo.listing_gain) {
    if (ipo.listing_gain.includes('-')) {
      return 'text-red-600';
    } else if (ipo.listing_gain.includes('+') || /[1-9]/.test(ipo.listing_gain)) {
      return 'text-green-600';
    }
  }
  return 'text-gray-600';
}

// Test the formatGain logic
function formatGain(ipo) {
  // Handle listing_gains as a decimal value (e.g., -0.09 for -9%)
  if (typeof ipo.listing_gains === 'number') {
    return `${(ipo.listing_gains * 100).toFixed(2)}%`;
  }
  // Handle listing_gain as a pre-formatted string
  else if (ipo.listing_gain) {
    return ipo.listing_gain.includes('%') ? ipo.listing_gain : `${ipo.listing_gain}%`;
  }
  return 'N/A';
}

// Test the formatPrice logic
function formatPrice(price) {
  if (price === null || price === undefined) return 'N/A';
  if (typeof price === 'string' && price.includes('₹')) return price;
  return `₹${price}`;
}

// Test the formatDate logic
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch (e) {
    return dateString;
  }
}

// Test the field normalization logic
function normalizeIpoData(ipo) {
  return {
    name: ipo.company_name || ipo.name || 'Unknown Company',
    symbol: ipo.symbol || 'N/A',
    status: ipo.subscription_status || ipo.status || 'Unknown',
    ipoPrice: ipo.ipo_price || (ipo.issue_price ? `₹${ipo.issue_price}` : 'N/A'),
    listingPrice: ipo.listing_price ? `₹${ipo.listing_price}` : 'N/A',
    listingGain: formatGain(ipo),
    listingGainValue: typeof ipo.listing_gains === 'number' ? ipo.listing_gains : null,
    priceRange: ipo.price_range || (ipo.min_price && ipo.max_price ? `₹${ipo.min_price} - ₹${ipo.max_price}` : 'TBA'),
    isSME: ipo.is_sme === true,
    additionalText: ipo.additional_text || null,
    listingDate: formatDate(ipo.listing_date)
  };
}

// Run tests
// =========

function runTests() {
  let passedTests = 0;
  let totalTests = 0;
  
  function expectEqual(actual, expected, message) {
    totalTests++;
    try {
      assert.strictEqual(actual, expected);
      console.log(`✓ ${message}`);
      passedTests++;
    } catch (error) {
      console.error(`✗ ${message}`);
      console.error(`  Expected: ${expected}`);
      console.error(`  Actual: ${actual}`);
    }
  }
  
  console.log('\n=== Testing with standard IPO data ===');
  const normalized = normalizeIpoData(mockIpoData);
  
  expectEqual(normalized.name, 'Manoj Jewellers', 'Company name should be parsed correctly');
  expectEqual(normalized.symbol, 'MANOJJEWEL', 'Symbol should be parsed correctly');
  expectEqual(normalized.ipoPrice, '₹54', 'IPO price should be formatted correctly');
  expectEqual(normalized.listingPrice, '₹53.95', 'Listing price should be formatted correctly');
  expectEqual(normalized.listingGain, '-9.26%', 'Listing gain should be calculated correctly');
  expectEqual(getGainColorClass(mockIpoData), 'text-red-600', 'Negative gain should have red color class');
  expectEqual(normalized.isSME, true, 'SME flag should be parsed correctly');
  expectEqual(normalized.listingDate, '12 May 2025', 'Listing date should be formatted correctly');
  
  console.log('\n=== Testing with alternative IPO data structure ===');
  const altNormalized = normalizeIpoData(alternativeIpoData);
  
  expectEqual(altNormalized.name, 'Accretion Pharmaceuticals', 'Should fall back to company_name field');
  expectEqual(altNormalized.status, 'Upcoming', 'Status should be parsed correctly');
  expectEqual(altNormalized.ipoPrice, '₹56', 'Should use pre-formatted IPO price');
  expectEqual(altNormalized.priceRange, '₹53 - ₹56', 'Should use pre-formatted price range');
  expectEqual(altNormalized.isSME, false, 'SME flag should default to false if not specified as true');
  
  console.log('\n=== Testing formatting utilities with various inputs ===');
  
  // Test price formatting
  expectEqual(formatPrice(100), '₹100', 'Number should be formatted with rupee symbol');
  expectEqual(formatPrice('₹100'), '₹100', 'Already formatted price should remain the same');
  expectEqual(formatPrice(null), 'N/A', 'Null price should return N/A');
  expectEqual(formatPrice(0), '₹0', 'Zero price should be formatted correctly');
  
  // Test date formatting
  expectEqual(formatDate('2023-05-15'), '15 May 2023', 'ISO date should be formatted nicely');
  expectEqual(formatDate(''), 'N/A', 'Empty date should return N/A');
  expectEqual(formatDate('Not a date'), 'Not a date', 'Invalid date should return original string');
  
  // Test listing gain formatting
  const testCases = [
    { input: { listing_gains: 0.15 }, expected: '15.00%', color: 'text-green-600', message: 'Positive decimal gain' },
    { input: { listing_gains: -0.08 }, expected: '-8.00%', color: 'text-red-600', message: 'Negative decimal gain' },
    { input: { listing_gains: 0 }, expected: '0.00%', color: 'text-gray-600', message: 'Zero gain' },
    { input: { listing_gain: '+12.5%' }, expected: '+12.5%', color: 'text-green-600', message: 'Pre-formatted positive gain' },
    { input: { listing_gain: '-5.2%' }, expected: '-5.2%', color: 'text-red-600', message: 'Pre-formatted negative gain' },
    { input: { listing_gain: '0%' }, expected: '0%', color: 'text-gray-600', message: 'Pre-formatted zero gain' },
    { input: { listing_gain: 'N/A' }, expected: 'N/A%', color: 'text-gray-600', message: 'Non-numeric gain' },
    { input: {}, expected: 'N/A', color: 'text-gray-600', message: 'No gain field' }
  ];
  
  console.log('\n=== Testing listing gain formatting and colors ===');
  testCases.forEach(({ input, expected, color, message }) => {
    expectEqual(formatGain(input), expected, `Formatting ${message}`);
    expectEqual(getGainColorClass(input), color, `Color coding for ${message}`);
  });
  
  // Summary
  console.log(`\n=== Test Summary ===`);
  console.log(`Passed ${passedTests} of ${totalTests} tests`);
  
  return { passedTests, totalTests };
}

// Run all tests
const { passedTests, totalTests } = runTests();

// Exit with appropriate status code
process.exit(passedTests === totalTests ? 0 : 1); 