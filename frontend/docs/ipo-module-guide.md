# IPO Module Developer Guide

## Overview
The IPO (Initial Public Offering) module displays current, upcoming, and recently listed IPOs from the Indian stock market. It fetches data from an external API, processes it, and displays it in various formats.

## Table of Contents
1. [Architecture](#architecture)
2. [Data Flow](#data-flow)
3. [API Integration](#api-integration)
4. [Error Handling](#error-handling) 
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)
7. [Best Practices](#best-practices)

## Architecture

The IPO module consists of:

- **Frontend Components**:
  - `IpoPage`: Main page that shows IPO statistics and data
  - `IpoCard`: Card component to display individual IPO information
  - `SimpleIpoCard`: Simplified card for Recently Listed IPOs

- **Services**:
  - `ipoService.js`: Handles API calls, data processing, and caching

- **Types**:
  - `IpoItem`: TypeScript interface for IPO data
  - `UpcomingIpo` and `ListedIpo`: Specialized interfaces

- **Utility Functions**:
  - Formatting functions for price, dates, and listing gains
  - Field normalization functions

## Data Flow

1. User loads the IPO page
2. Page component calls `ipoService.fetchIPOData()`
3. Service checks cache and fetches from API if needed
4. API response is processed and normalized
5. Data is stored in component state and displayed
6. Optional real-time updates refresh the data on an interval

## API Integration

### API Endpoint
The module connects to the Indian Stock API at `https://stock.indianapi.in/ipo`.

### Authentication
- API authentication uses API keys stored in `config.js`
- Multiple API keys are maintained for key rotation

### Key Rotation System
The module implements an advanced API key rotation system to handle rate limits:

1. API keys are stored in a pool in `config.js`
2. The system rotates keys automatically when:
   - A rate limit (429) error is received
   - A configurable number of consecutive failures occurs
   - A scheduled rotation interval elapses

### Handling Rate Limits
When a 429 (Too Many Requests) error is encountered:
1. The system logs the rate limit error
2. It rotates to the next API key in the pool
3. The request is retried with the new key
4. If all keys are rate-limited, the error is reported to the user

## Error Handling

The IPO module handles several types of errors:

### API Errors
- **Status 429**: Rate limit exceeded → Key rotation
- **Status 401/403**: Authentication failures → Clear error message
- **Status 404**: Endpoint not found → Error with endpoint details
- **Status 405**: Method Not Allowed → Warning about GET-only API
- **Status 5xx**: Server errors → Generic server error message

### Network Errors
- **ECONNABORTED**: Timeout → Clear timeout message
- **ECONNREFUSED**: Connection refused → Server down message
- **ENOTFOUND**: Host not found → DNS/connectivity message

### Data Processing Errors
- Invalid or missing data fields are handled with fallbacks
- Validation ensures the UI receives properly formatted data
- Anomalies are logged for debugging

## Testing

### Running IPO Tests
Use the test runner to test component and API functionality:

```bash
# Run all tests
node tests/run-ipo-tests.js

# Run only component tests
node tests/run-ipo-tests.js --component-only

# Run only API tests
node tests/run-ipo-tests.js --api-only

# Run with verbose logging
node tests/run-ipo-tests.js --verbose
```

### Component Tests
Component tests verify:
1. IPO data formatting
2. Handling different field name variations
3. Color coding for gains/losses
4. Price and date formatting

### API Integration Tests
API tests verify:
1. API connectivity
2. Response structure validation
3. Error handling
4. Key rotation (optional test)

## Troubleshooting

### Common Issues

#### No IPO Data Displayed
- Check network tab for API errors
- Verify API key validity in config.js
- Check if all API keys are rate-limited
- Test with `node tests/test-ipo-api-service.js` to verify connection

#### Rate Limit Errors
- Ensure key rotation is enabled in config (KEY_ROTATION.ENABLED)
- Add more API keys to the rotation pool if needed
- Increase RETRY_ATTEMPTS in config
- Implement exponential backoff by adjusting RETRY_DELAY

#### Data Format Issues
- If API format changes, adjust the `processIPOData` function
- Check console for field parsing errors
- Update type definitions if needed

#### Testing API Key Valid Status
```bash
# Quick curl test to verify key status
curl -H "X-Api-Key: YOUR_API_KEY" https://stock.indianapi.in/ipo
```

## Best Practices

1. **API Key Management**:
   - Never hardcode API keys in components
   - Rotate keys to prevent rate limiting
   - Store sensitive keys in environment variables for production

2. **Error Resilience**:
   - Always implement retry logic for transient failures
   - Provide helpful error messages to users
   - Log detailed error information for debugging

3. **Data Normalization**:
   - Always normalize API responses before using in UI components
   - Handle missing or inconsistent fields with sensible defaults
   - Validate data structure to prevent UI errors

4. **Performance Optimization**:
   - Implement caching to reduce API calls
   - Use windowing/virtualization for long lists
   - Debounce real-time updates to prevent excessive API calls

---

## Field Reference

### Key IPO Data Fields

| Field Name | Type | Description | Fallback/Alternative |
|------------|------|-------------|----------------------|
| name | string | Company name | company_name |
| company_name | string | Company name | name |
| symbol | string | Stock symbol | Required |
| status | string | IPO status | subscription_status |
| listing_gains | number | Decimal gain/loss | listing_gain |
| listing_gain | string | Formatted gain/loss | Calculated from listing_gains |
| issue_price | number | IPO issue price | Extracted from ipo_price |
| ipo_price | string | Formatted IPO price | Formatted from issue_price |
| listing_price | number | Listing price | Required for listed IPOs |
| listing_date | string | Date of listing | Required for listed IPOs |
| price_range | string | Price range | min_price & max_price |
| is_sme | boolean | SME IPO flag | false | 