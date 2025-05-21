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

// Check if standalone server.js exists
const standaloneServerPath = path.join(__dirname, 'frontend', '.next', 'standalone', 'server.js');
const frontendStartCommand = fs.existsSync(standaloneServerPath) ? 
  { cmd: 'node', args: ['.next/standalone/server.js'] } : 
  { cmd: os.platform() === 'win32' ? 'npm.cmd' : 'npm', args: ['run', 'start'] };

console.log(`Starting frontend with: ${frontendStartCommand.cmd} ${frontendStartCommand.args.join(' ')}`);

// Start frontend
const frontend = spawnProcess(
  frontendStartCommand.cmd, 
  frontendStartCommand.args, 
  {
    cwd: path.join(__dirname, 'frontend'),
  }
);

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nShutting down services...');
  backend.kill();
  frontend.kill();
  process.exit(0);
}); 