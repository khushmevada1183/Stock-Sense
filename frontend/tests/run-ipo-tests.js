/**
 * Test Runner for IPO Component and API tests
 * Run with: node tests/run-ipo-tests.js
 * 
 * Options:
 *   --api-only     Run only API tests
 *   --component-only   Run only component tests
 *   --verbose      Show detailed output
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get command line arguments
const args = process.argv.slice(2);
const runApiOnly = args.includes('--api-only');
const runComponentOnly = args.includes('--component-only');
const verbose = args.includes('--verbose');

// Set up test results directory
const resultDir = path.join(__dirname, 'results');
if (!fs.existsSync(resultDir)) {
  fs.mkdirSync(resultDir);
}

// Test definitions
const tests = [
  {
    name: 'IPO Component Tests',
    command: 'node',
    args: ['tests/test-simple-ipo-card.js'],
    type: 'component',
    description: 'Tests the IPO card components and formatting utilities'
  },
  {
    name: 'IPO API Service Tests',
    command: 'node',
    args: ['tests/test-ipo-api-service.js'],
    type: 'api',
    description: 'Tests API connectivity and data handling'
  }
];

// Run tests based on arguments
const testsToRun = tests.filter(test => {
  if (runApiOnly) return test.type === 'api';
  if (runComponentOnly) return test.type === 'component';
  return true;
});

console.log('==================================');
console.log('Running IPO Tests');
console.log('==================================');

if (verbose) {
  console.log(`Running ${testsToRun.length} of ${tests.length} tests\n`);
}

// Run tests and collect results
const results = [];
const startTime = Date.now();

testsToRun.forEach(test => {
  console.log(`\nRunning: ${test.name}`);
  console.log(`Description: ${test.description}`);
  
  // Add verbose flag if needed
  const testArgs = [...test.args];
  if (verbose) {
    process.env.VERBOSE = 'true';
  }
  
  // Run the test
  const result = spawnSync(test.command, testArgs, { 
    encoding: 'utf8',
    env: process.env
  });
  
  // Process output
  const success = result.status === 0;
  const output = result.stdout + result.stderr;
  
  // Save detailed output
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const outputFilename = `${test.name.toLowerCase().replace(/\s+/g, '-')}-${timestamp}.log`;
  fs.writeFileSync(path.join(resultDir, outputFilename), output);
  
  // Log result summary
  const resultStr = success ? 'PASSED' : 'FAILED';
  console.log(`Result: ${resultStr}`);
  
  if (!success) {
    console.log(`Exit code: ${result.status}`);
    console.log('Error output:');
    
    // Extract error messages for display
    const errorLines = output
      .split('\n')
      .filter(line => line.includes('Error:') || line.includes('✗'))
      .slice(0, 5) // Show at most 5 error lines
      .map(line => `  ${line}`);
    
    if (errorLines.length > 0) {
      console.log(errorLines.join('\n'));
      if (output.split('\n').filter(line => line.includes('Error:') || line.includes('✗')).length > 5) {
        console.log('  ... more errors in log file');
      }
    } else {
      // If no specific error messages found, show the last few lines
      console.log(
        output
          .split('\n')
          .slice(-10)
          .map(line => `  ${line}`)
          .join('\n')
      );
    }
  }
  
  // Save result
  results.push({
    name: test.name,
    success,
    outputFile: outputFilename,
    time: Date.now() // Track when the test finished
  });
});

// Calculate total duration
const endTime = Date.now();
const durationSec = ((endTime - startTime) / 1000).toFixed(2);

// Generate report
const passedTests = results.filter(r => r.success).length;
const failedTests = results.length - passedTests;

console.log('\n==================================');
console.log('IPO Test Summary');
console.log('==================================');
console.log(`Tests run: ${results.length}`);
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${failedTests}`);
console.log(`Duration: ${durationSec} seconds`);
console.log('\nDetailed results:');

results.forEach((result, index) => {
  console.log(`${index + 1}. ${result.name}: ${result.success ? 'PASSED' : 'FAILED'}`);
  console.log(`   Log file: ${result.outputFile}`);
});

console.log('\nDetailed logs saved in:', resultDir);

// Exit with error code if any tests failed
process.exit(failedTests > 0 ? 1 : 0); 