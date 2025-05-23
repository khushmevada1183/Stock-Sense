/**
 * Entry point for the application
 * This file exists to support deployments where the process runs from the root directory
 */

const { spawn } = require('child_process');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');
const os = require('os');

// Load environment variables
dotenv.config();

const BACKEND_PORT = process.env.PORT || 10000;
const FRONTEND_PORT = process.env.FRONTEND_PORT || 10001;

// Configure Node.js memory limits - reduced for low-memory environment
process.env.NODE_OPTIONS = process.env.NODE_OPTIONS || '--max_old_space_size=384'; // Lowered for Free Tier
console.log(`Node.js memory settings: ${process.env.NODE_OPTIONS}`);

console.log(`Using backend port: ${BACKEND_PORT}, frontend port: ${FRONTEND_PORT}`);

// Validate environment
if (!process.env.STOCK_API_KEY) {
  console.warn('\n⚠️  Warning: STOCK_API_KEY not found in environment variables');
  console.warn('Some features may not work correctly.\n');
}

// Helper to spawn process with error handling
function spawnProcess(command, args, options = {}) {
  console.log(`Executing: ${command} ${args.join(' ')}`);
  
  const proc = spawn(command, args, {
    ...options,
    stdio: 'pipe',
    env: {
      ...process.env,
      PORT: options.isBackend ? BACKEND_PORT : FRONTEND_PORT,
      NODE_OPTIONS: process.env.NODE_OPTIONS, // Ensure child processes inherit memory settings
    },
  });

  const prefix = options.isBackend ? '[BACKEND]' : '[FRONTEND]';

  proc.stdout.on('data', (data) => {
    console.log(`${prefix} ${data.toString().trim()}`);
  });

  proc.stderr.on('data', (data) => {
    console.error(`${prefix} ERROR] ${data.toString().trim()}`);
  });

  proc.on('error', (err) => {
    console.error(`${prefix} Process error: ${err.message}`);
  });

  return proc;
}

// Start backend
const backend = spawnProcess('node', ['backend/server.js'], { isBackend: true });

// Check for different possible frontend build locations
const standaloneServerPath = path.join(__dirname, 'frontend', '.next', 'standalone', 'server.js');
const nextBuildPath = path.join(__dirname, 'frontend', '.next');

let frontendStartCommand;

// Determine the best way to start the frontend
if (fs.existsSync(standaloneServerPath)) {
  console.log('Found standalone build, using it for frontend');
  frontendStartCommand = { cmd: 'node', args: ['.next/standalone/server.js'] };
} else if (fs.existsSync(nextBuildPath)) {
  console.log('Found Next.js build directory, using npm start');
  frontendStartCommand = { 
    cmd: os.platform() === 'win32' ? 'npm.cmd' : 'npm', 
    args: ['run', 'start'] 
  };
} else {
  console.error('No Next.js build found! Try running "npm run build:frontend" first');
  console.log('Attempting to build the frontend now...');
  
  // Try to build the frontend if it doesn't exist
  const buildCmd = os.platform() === 'win32' ? 'npm.cmd' : 'npm';
  const buildProc = spawn(buildCmd, ['run', 'build'], {
    cwd: path.join(__dirname, 'frontend'),
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_OPTIONS: '--max_old_space_size=384', // Reduced memory for low-resource environment
    }
  });
  
  buildProc.on('close', (code) => {
    if (code !== 0) {
      console.error(`Frontend build failed with code ${code}`);
      process.exit(1);
    }
    
    console.log('Frontend build completed, starting frontend');
    frontendStartCommand = { 
      cmd: os.platform() === 'win32' ? 'npm.cmd' : 'npm', 
      args: ['run', 'start'] 
    };
    
    startFrontend();
  });
  
  // Return early to avoid starting frontend before build completes
  return;
}

console.log(`Starting frontend with: ${frontendStartCommand.cmd} ${frontendStartCommand.args.join(' ')}`);

// Start frontend
function startFrontend() {
  const frontend = spawnProcess(
    frontendStartCommand.cmd, 
    frontendStartCommand.args, 
    {
      cwd: path.join(__dirname, 'frontend'),
    }
  );
}

// Start frontend if we didn't need to build it
if (frontendStartCommand) {
  startFrontend();
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nShutting down services...');
  backend.kill();
  if (frontend) frontend.kill();
  process.exit(0);
}); 