# IPO Module Testing

This directory contains tests for the IPO module functionality, focusing on:
1. Component rendering and data handling
2. API integration and error handling

## Available Tests

### Component Tests
- **test-simple-ipo-card.js**: Tests IPO card components, formatting utilities, and field normalization

### API Tests
- **test-ipo-api-service.js**: Tests API connectivity, response validation, and error handling

### Test Runner
- **run-ipo-tests.js**: Unified test runner that executes all tests and generates a report

## Running Tests

### Run All Tests
```bash
node tests/run-ipo-tests.js
```

### Run Only Component Tests
```bash
node tests/run-ipo-tests.js --component-only
```

### Run Only API Tests
```bash
node tests/run-ipo-tests.js --api-only
```

### With Verbose Output
```bash
node tests/run-ipo-tests.js --verbose
```

### Testing API Rate Limit Handling (Optional)
```bash
# This will make multiple rapid requests to test key rotation
TEST_RATE_LIMITS=true node tests/test-ipo-api-service.js
```

## Test Results

Test results are saved in the `tests/results` directory with timestamps. Each test run generates detailed logs for review.

## Understanding Test Output

### Successful Tests
Successful tests will show:
- ✓ [Test description]
- A summary of passed tests

### Failed Tests
Failed tests will show:
- ✗ [Test description]
- Expected vs actual values
- Error details

## Troubleshooting Failing Tests

### Component Test Failures
- Check the test output for format mismatches
- Verify the formatting functions match the IPO card implementation

### API Test Failures
- Verify API connectivity (check network/firewall)
- Ensure API keys in config.js are valid
- Check if the API is rate limiting requests
- Verify the API response structure hasn't changed

## Adding New Tests

To add a new test:
1. Create a new test file in the tests directory
2. Add it to the `tests` array in run-ipo-tests.js
3. Run with the test runner

See the existing tests for examples of the testing pattern. 