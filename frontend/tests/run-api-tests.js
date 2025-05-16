#!/usr/bin/env node

/**
 * Command-line script to run the API tests
 */

// Set up environment for tests
process.env.NODE_ENV = 'test';

// Use esbuild to transpile TypeScript and bundle the tests
const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

console.log('Building test bundle...');

// Define API URLs and keys from command line arguments
const args = process.argv.slice(2);
let stockSymbol = 'RELIANCE';
let verbose = true;
let testStandardAPI = true;
let testIndianAPI = true;
let apiRotationTest = true;
let standardApiUrl = 'http://localhost:5002/api';
let indianApiUrl = 'https://stock.indianapi.in';
let standardApiKey = '';
let indianApiKey = 'sk-live-0KwlkkkbLj6KxWuyNimN0gkigsRck7mYP1CTq3Zq';

// Parse command line arguments
args.forEach(arg => {
  if (arg.startsWith('--symbol=')) {
    stockSymbol = arg.split('=')[1];
  } else if (arg === '--quiet') {
    verbose = false;
  } else if (arg === '--no-standard') {
    testStandardAPI = false;
  } else if (arg === '--no-indian') {
    testIndianAPI = false;
  } else if (arg === '--no-rotation') {
    apiRotationTest = false;
  } else if (arg.startsWith('--standard-url=')) {
    standardApiUrl = arg.split('=')[1];
  } else if (arg.startsWith('--indian-url=')) {
    indianApiUrl = arg.split('=')[1];
  } else if (arg.startsWith('--standard-key=')) {
    standardApiKey = arg.split('=')[1];
  } else if (arg.startsWith('--indian-key=')) {
    indianApiKey = arg.split('=')[1];
  } else if (arg === '--help') {
    console.log('Usage: node run-api-tests.js [options]');
    console.log('Options:');
    console.log('  --symbol=SYMBOL        Stock symbol to use for tests (default: RELIANCE)');
    console.log('  --quiet                Disable verbose logging');
    console.log('  --no-standard          Skip standard API tests');
    console.log('  --no-indian            Skip Indian API tests');
    console.log('  --no-rotation          Skip API rotation tests');
    console.log('  --standard-url=URL     URL for standard API');
    console.log('  --indian-url=URL       URL for Indian API');
    console.log('  --standard-key=KEY     API key for standard API');
    console.log('  --indian-key=KEY       API key for Indian API');
    console.log('  --help                 Show this help message');
    process.exit(0);
  } else {
    console.warn(`Unknown argument: ${arg}`);
  }
});

// Override CONFIG for our tests
process.env.TEST_CONFIG = JSON.stringify({
  stockSymbol,
  verbose,
  testStandardAPI,
  testIndianAPI,
  apiRotationTest,
  standardApiUrl,
  indianApiUrl,
  standardApiKey,
  indianApiKey,
  timeoutMs: 10000
});

// Create a temporary test file with NODE_ENV adjustments
const apiTestPath = path.resolve(__dirname, 'api-test.ts');
const tempTestPath = path.resolve(__dirname, '.temp-test.js');

try {
  // Build the test bundle
  esbuild.buildSync({
    entryPoints: [apiTestPath],
    bundle: true,
    platform: 'node',
    outfile: tempTestPath,
    format: 'cjs',
    define: {
      'process.env.NEXT_PUBLIC_API_URL': JSON.stringify(standardApiUrl),
      'process.env.NEXT_PUBLIC_INDIAN_API_URL': JSON.stringify(indianApiUrl),
      'process.env.NEXT_PUBLIC_API_KEY': JSON.stringify(standardApiKey),
      'process.env.NEXT_PUBLIC_INDIAN_API_KEY': JSON.stringify(indianApiKey)
    },
    target: ['node14']
  });
  
  console.log('Build successful. Running tests...');
  console.log('-----------------------------------');
  
  // Run the tests
  require(tempTestPath);
  
  // Clean up
  setTimeout(() => {
    fs.unlinkSync(tempTestPath);
  }, 1000);
  
} catch (error) {
  console.error('Error building or running tests:', error);
  process.exit(1);
} 