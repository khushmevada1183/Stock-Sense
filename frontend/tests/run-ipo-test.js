/**
 * IPO API Test Runner
 * 
 * This script provides a simple way to run the IPO API test directly.
 * It runs both the simple connection test and the detailed API test.
 */

const path = require('path');
const readline = require('readline');
const { testIpoEndpoint } = require('./ipo-api-test');
const { testIpoApi } = require('./api/ipo-api-test');

// ANSI color codes for console output
const COLORS = {
  RESET: '\x1b[0m',
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  MAGENTA: '\x1b[35m',
  CYAN: '\x1b[36m',
  BRIGHT: '\x1b[1m',
  DIM: '\x1b[2m'
};

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to prompt for input
function promptUser(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim().toLowerCase());
    });
  });
}

async function runTests() {
  console.log(`${COLORS.BRIGHT}${COLORS.MAGENTA}=== Indian Stock API - IPO Endpoint Test ====${COLORS.RESET}`);
  console.log(`${COLORS.CYAN}This test verifies API connectivity with minimal API usage${COLORS.RESET}`);
  
  try {
    // Determine which tests to run
    const testArg = process.argv[2]?.toLowerCase();
    
    // Run basic test first if not skipped
    if (testArg !== 'detailed-only') {
      console.log(`${COLORS.YELLOW}Running basic IPO API connection test...${COLORS.RESET}\n`);
      await testIpoEndpoint();
    }
    
    // Run detailed test if requested or after prompt
    if (testArg === 'detailed' || testArg === 'full' || testArg === 'detailed-only') {
      console.log(`\n${COLORS.YELLOW}Running detailed IPO API test...${COLORS.RESET}\n`);
      await testIpoApi();
    } else {
      const shouldRunDetailed = await promptUser(`\n${COLORS.YELLOW}Run detailed API test too? (uses more API quota) [y/N]: ${COLORS.RESET}`);
      
      if (shouldRunDetailed === 'y' || shouldRunDetailed === 'yes') {
        console.log(`\n${COLORS.YELLOW}Running detailed IPO API test...${COLORS.RESET}\n`);
        await testIpoApi();
      }
    }
    
    console.log(`\n${COLORS.GREEN}${COLORS.BRIGHT}✓ Test runner completed successfully${COLORS.RESET}`);
  } catch (error) {
    console.log(`\n${COLORS.RED}${COLORS.BRIGHT}× Test runner failed: ${error.message}${COLORS.RESET}`);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run the test
runTests().catch(error => {
  console.error(`${COLORS.RED}Unhandled error: ${error.message}${COLORS.RESET}`);
  rl.close();
  process.exit(1);
}); 