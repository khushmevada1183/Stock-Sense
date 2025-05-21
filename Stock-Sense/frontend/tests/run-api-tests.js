/**
 * API Test Runner
 * 
 * This script runs various API tests for the Indian Stock Analyzer.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Test configuration
const config = {
  testDir: path.join(__dirname, 'api'),
  results: {
    passed: 0,
    failed: 0,
    skipped: 0,
    total: 0
  },
  testFiles: [
    // Add your test files here
    'ipo-api-test.js', // IPO API test
  ]
};

// Color codes for console output
const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

/**
 * Logs a message with color
 * @param {string} message Message to log
 * @param {string} color Color to use
 */
function colorLog(message, color = COLORS.reset) {
  console.log(`${color}${message}${COLORS.reset}`);
}

/**
 * Run a specific test file
 * @param {string} testFile Path to test file
 * @returns {Promise<boolean>} Success status
 */
async function runTest(testFile) {
  const fullPath = path.join(config.testDir, testFile);
  
  // Check if file exists
  if (!fs.existsSync(fullPath)) {
    colorLog(`Test file not found: ${fullPath}`, COLORS.red);
    config.results.skipped++;
    return false;
  }
  
  try {
    colorLog(`\n🚀 Running test: ${testFile}`, COLORS.cyan);
    colorLog('======================================', COLORS.cyan);
    
    // Try to get the exported test functions
    const testModule = require(fullPath);
    
    // Check if the module exports a specific test function
    if (typeof testModule.testIpoApi === 'function') {
      await testModule.testIpoApi();
    } else if (typeof testModule.test === 'function') {
      await testModule.test();
    } else if (typeof testModule.runTest === 'function') {
      await testModule.runTest();
  } else {
      // If no specific test function found, assume the require itself runs the test
      colorLog('No exported test function found, assuming tests run on require', COLORS.yellow);
  }
    
    colorLog('======================================', COLORS.cyan);
    colorLog(`✅ Test completed: ${testFile}`, COLORS.green);
    config.results.passed++;
    return true;
  } catch (error) {
    colorLog('======================================', COLORS.cyan);
    colorLog(`❌ Test failed: ${testFile}`, COLORS.red);
    colorLog(`Error: ${error.message}`, COLORS.red);
    config.results.failed++;
    return false;
  }
}

/**
 * Run the basic IPO API test
 */
async function runBasicIpoTest() {
  try {
    colorLog(`\n🚀 Running basic IPO API test`, COLORS.cyan);
    colorLog('======================================', COLORS.cyan);
    
    const { testIpoEndpoint } = require('./ipo-api-test');
    await testIpoEndpoint();
    
    colorLog('======================================', COLORS.cyan);
    colorLog(`✅ Basic IPO API test completed`, COLORS.green);
    config.results.passed++;
    return true;
  } catch (error) {
    colorLog('======================================', COLORS.cyan);
    colorLog(`❌ Basic IPO API test failed`, COLORS.red);
    colorLog(`Error: ${error.message}`, COLORS.red);
    config.results.failed++;
    return false;
  }
}

/**
 * Run all specified tests
 */
async function runAllTests() {
  colorLog('\n📊 Indian Stock Analyzer API Tests', COLORS.magenta);
  colorLog('======================================', COLORS.magenta);
  
  // Update total tests count (API tests + basic IPO test)
  config.results.total = config.testFiles.length + 1;
  
  // Run the basic IPO test first
  await runBasicIpoTest();
  
  // Run each API test sequentially
  for (const testFile of config.testFiles) {
    await runTest(testFile);
  }
  
  // Print results
  colorLog('\n📈 Test Results:', COLORS.magenta);
  colorLog('======================================', COLORS.magenta);
  colorLog(`Total tests: ${config.results.total}`, COLORS.white);
  colorLog(`Passed: ${config.results.passed}`, COLORS.green);
  colorLog(`Failed: ${config.results.failed}`, COLORS.red);
  colorLog(`Skipped: ${config.results.skipped}`, COLORS.yellow);
  colorLog('======================================', COLORS.magenta);
  
  if (config.results.failed > 0) {
    colorLog('❌ Some tests failed!', COLORS.red);
    process.exit(1);
  } else {
    colorLog('✅ All tests passed!', COLORS.green);
  }
}

// Check for specific test to run from command line arguments
const specificTest = process.argv[2];
if (specificTest) {
  if (specificTest === 'ipo') {
    // Use the specialized IPO test runner
    colorLog(`Running IPO API tests using the specialized runner...`, COLORS.yellow);
    const ipoTestRunner = path.join(__dirname, 'run-ipo-test.js');
    
    // Check if the runner exists
    if (fs.existsSync(ipoTestRunner)) {
      const args = process.argv.slice(3); // Get any additional arguments
      require(ipoTestRunner);
      process.exit(0);
    } else {
      colorLog(`IPO test runner not found. Falling back to standard runner.`, COLORS.yellow);
      config.testFiles = ['ipo-api-test.js'];
      runAllTests().catch(handleFatalError);
    }
  } else {
    // Run specified test if it exists
    const testFile = `${specificTest}.js`;
    if (config.testFiles.includes(testFile)) {
      config.testFiles = [testFile];
      colorLog(`Running only: ${testFile}`, COLORS.yellow);
      runAllTests().catch(handleFatalError);
    } else {
      colorLog(`Test not found: ${testFile}`, COLORS.red);
      process.exit(1);
    }
  }
} else {
  // Run all tests
  runAllTests().catch(handleFatalError);
}

function handleFatalError(error) {
  colorLog(`\n❌ Fatal error: ${error.message}`, COLORS.red);
  process.exit(1);
} 