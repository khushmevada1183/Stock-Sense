# API Rate Limit Handling

## Current Status (RESOLVED)

The Indian Stock API rate limit issue has been resolved by adding multiple API keys to the rotation pool. The API key rotation system is now fully functional and will automatically rotate between keys when rate limits are encountered.

### Previous Issue

Previously, our application was experiencing API rate limit issues with the Indian Stock API due to:

1. Having only a single API key in the rotation pool
2. That API key being rate-limited (returning 429 Too Many Requests)
3. The API not providing explicit reset time information in headers

## Solution Implemented

We have implemented the following solution:

1. **Added Multiple API Keys**: We've added 10 valid API keys to the rotation pool:
   ```javascript
   API_KEYS: [
     'sk-live-V4dyXhcHcQCFuxnLYWKmBM2jzKxDilFMl4BklW67',
     'sk-live-kQSxsVhWZyIk8sGy2gzXGBvi97RETSP88OOG2qt3',
     'sk-live-QtygcAU1VLXuNtIHRAVNWnLrtoTpL0yctd2DEko5',
     'sk-live-bi47a6KsAGkHsFAguG0sKBNzCf8VbTVFweOy1eFE',
     'sk-live-uZup2KEHVqDo2zyAunRH0zp9aaRNpyGgxKU7GApI',
     'sk-live-rB1W61qZPLlzufRlnRfS937jYQBEmM8D4TUPdpFh',
     'sk-live-1jzFVqgbxWnQCwRgG9NynigeR72HtkbioKch1VaD',
     'sk-live-2SrhjLseRYGxjv8JzfGFZ3D4ZyGOqZatL8ADODKL',
     'sk-live-2cEMmBrNbaIP1v3OjVNwNMbRnO49hvCeOayo5jAA',
     'sk-live-jtOlHh18hooTAJQmcLUz4mngn9gxSvY4uRyVUpGJ'
   ]
   ```

2. **Enabled Key Rotation**: The key rotation system will automatically switch to a different key when a 429 error is encountered:
   ```javascript
   KEY_ROTATION: {
     ENABLED: true,
     AUTO_ROTATE_ON_429: true,
     ROTATION_INTERVAL: 60 * 60 * 1000, // 1 hour regular rotation
     MAX_CONSECUTIVE_FAILURES: 2,
     RETRY_DELAY: 1000
   }
   ```

3. **Disabled Mock Data Fallback**: Since we now have multiple working API keys, we've disabled the mock data fallback:
   ```javascript
   SHOW_MOCK_DATA_WHEN_API_FAILS: false
   ```

## API Limitations and Requirements

**IMPORTANT**: The Indian Stock API has the following requirements and limitations:

1. **GET Requests Only**: The API only accepts GET requests. HEAD, POST, PUT, and other HTTP methods will return 405 Method Not Allowed errors.

2. **Rate Limits**: Each API key has its own rate limit. When exceeded, the API returns a 429 Too Many Requests status code.

3. **No Reset Headers**: The API does not provide standard rate limit headers (X-RateLimit-*) to indicate when rate limits will reset.

4. **JSON Response Format**: The IPO endpoint returns data in the following JSON structure:
   ```json
   {
     "upcoming": [...],
     "listed": [...],
     "active": [...],
     "closed": [...]
   }
   ```

5. **Authentication**: All requests must include the API key in the `X-Api-Key` header.

## Testing Results

We've tested the solution using the following scripts:

1. `frontend/tests/check-multiple-api-keys.js` - Used to identify valid API keys
2. `frontend/tests/test-ipo-with-new-keys.js` - Verified that the new keys work with the IPO endpoint

The tests confirmed that:
- All keys in the rotation pool are valid and working
- The API returns proper JSON data in the expected format
- The key rotation system effectively handles rate limit scenarios

## Future Recommendations

While the current implementation solves the immediate issue, here are some additional recommendations for maintaining robust API access:

### 1. Regular Key Rotation Monitoring

Periodically check the health of the API keys to ensure they remain valid:

```bash
node frontend/tests/check-multiple-api-keys.js
```

### 2. Implement Better Caching

Consider increasing cache duration for non-time-sensitive data:

```javascript
CACHE_DURATION: 15 * 60 * 1000, // 15 minutes cache duration
```

### 3. Implement Tiered Polling Frequencies

Adjust polling frequencies based on data importance:
- Critical data (current prices): Poll every 1-5 minutes
- Important data (IPO listings): Poll every 30-60 minutes
- Background data (company profiles): Poll once per day

### 4. Advanced Error Handling

Enhance error handling with:
- Exponential backoff for retries
- Detailed user feedback during API issues
- Proactive monitoring of rate limit usage

### 5. Server-Side Proxy (Future)

For production use, consider implementing a server-side proxy to:
- Centralize API key management
- Implement server-side caching
- Aggregate requests from multiple clients
- Manage rate limits more effectively

## API Key Management

To maintain a healthy rotation pool:
1. Regularly test all keys to identify any that have become invalid
2. Periodically register new API keys to expand the pool
3. Remove keys that are consistently problematic
4. Document key origins and expiration dates if applicable 