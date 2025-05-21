/**
 * Stock-Sense Build Script
 * 
 * This script builds both the backend and frontend applications
 * with proper error handling and verbose logging.
 */

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

console.log('=======================================');
console.log('🚀 INDIAN STOCK ANALYZER - BUILD SCRIPT');
console.log('=======================================\n');

// Ensure .env file exists
if (!fs.existsSync(path.join(__dirname, '.env'))) {
  console.log('Creating default .env file...');
  fs.writeFileSync(
    path.join(__dirname, '.env'),
    'PORT=5005\nBACKEND_PORT=5005\nFRONTEND_PORT=3005\nNODE_ENV=production\nCORS_ORIGIN=*\n'
  );
}

// Install root dependencies
console.log('Installing root dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
} catch (error) {
  console.error('Error installing root dependencies:', error);
  process.exit(1);
    }

// Install backend dependencies
console.log('\nInstalling backend dependencies...');
try {
  execSync('cd backend && npm install', { stdio: 'inherit' });
} catch (error) {
  console.error('Error installing backend dependencies:', error);
  process.exit(1);
}

// Install frontend dependencies
console.log('\nInstalling frontend dependencies...');
try {
  execSync('cd frontend && npm install', { stdio: 'inherit' });
  } catch (error) {
  console.error('Error installing frontend dependencies:', error);
    process.exit(1);
  }

// Build frontend
console.log('\nBuilding frontend...');
try {
  execSync('cd frontend && npm run build', { stdio: 'inherit' });
} catch (error) {
  console.error('Error building frontend:', error);
  process.exit(1);
}

// Build backend (if needed)
console.log('\nBackend is JavaScript - no build required');

console.log('\n=======================================');
console.log('✅ BUILD COMPLETED SUCCESSFULLY');
console.log('=======================================');
console.log('You can now start the application with:');
console.log('  npm start\n');
console.log('Or run the development servers with:');
console.log('  node scripts/run.js\n');
