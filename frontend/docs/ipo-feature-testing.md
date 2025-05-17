# IPO Feature Testing Guide

This guide explains how to test the IPO feature and its API integration in the Indian Stock Analyzer application.

## Overview

The IPO page fetches real-time data from the Indian Stock Market API, specifically from the `/ipo` endpoint. The page displays:

1. IPO Statistics (upcoming, active, recently listed)
2. Upcoming IPOs 
3. Active IPOs
4. Recently Listed IPOs

The application uses an API key rotation system to handle rate limits and ensure uninterrupted service.

## API Key Management

### Current Status

Currently, there is only one valid API key (`sk-live-0KwlkkkbLj6KxWuyNimN0gkigsRck7mYP1CTq3Zq`), which may be rate-limited at times. When rate-limited, you'll see a `429` error response with the message "API key requests limit exceeded".

### Adding More API Keys

To ensure uninterrupted service, you should:

1. Register for additional API keys at [Indian API Marketplace](https://indianapi.in)
2. Add the valid keys to the rotation pool in `services/config.js`
3. The system will automatically rotate between keys when rate limits are hit

```javascript
// Add keys to the rotation pool
API_KEYS: [
  'sk-live-0KwlkkkbLj6KxWuyNimN0gkigsRck7mYP1CTq3Zq',
  'your-new-valid-key-1',
  'your-new-valid-key-2'
]
```

## Testing the API Integration

### Quick API Test

To quickly test if the API connection is working without wasting API quota:

```bash
# From the frontend directory
node tests/run-api-tests.js ipo
```

This test sends a single request to the IPO endpoint and verifies that the API is accessible. A `429` rate limit error actually confirms the API connection is working correctly.

### API Key Rotation Test

The application implements an API key rotation system that automatically:
- Rotates keys when rate limits are hit
- Schedules regular key rotation
- Reuses cached data when appropriate
- Provides detailed error messages

### Manual Testing in Browser

To test the IPO feature in the browser:

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open the IPO page at http://localhost:3000/ipo

3. Check the browser console for API logs:
   - API request details
   - Response data structure
   - Key rotation events (if rate limit is hit)

### Common Issues and Solutions

1. **Rate Limit Errors**: The message "API rate limit exceeded" indicates your API key has reached its rate limit. 
   - Solution: The application has an automatic key rotation system to handle this
   - You need to add more valid API keys in the `config.js` file

2. **Invalid API Key Errors**: A `401` error with "Invalid API key" message indicates the key is incorrect or has expired.
   - Solution: Verify the key format and validity, and obtain a new key if necessary

3. **No Data Shown**: If the IPO page shows empty sections:
   - Check the browser console for error messages
   - Verify the API key is valid
   - Check network requests for API responses

4. **Connection Errors**: If the API can't be reached:
   - Verify internet connection
   - Check if the API endpoint is correct
   - Verify firewall/proxy settings

## API Response Structure

The IPO API returns data in one of these formats:

1. Array of IPO objects
2. Object with `data` property containing an array
3. Object with `ipoData` property containing an array
4. Object with `results` property containing an array

The application normalizes these formats to a consistent structure for display.

## IPO Data Processing

The application processes raw API data to:

1. Categorize IPOs as upcoming, active, or recently listed
2. Format dates, currencies, and percentages
3. Sort IPOs by relevant dates
4. Calculate missing fields (gains, returns) when not provided by API

## Configuration

API settings can be modified in:
- `stock-analyzer/frontend/services/config.js` - API URL, keys, and rotation settings
- `stock-analyzer/frontend/services/api/ipoService.js` - API service implementation 