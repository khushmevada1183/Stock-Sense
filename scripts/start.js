/**
 * Simplified startup script for Stock-Sense application
 * This script starts the backend and frontend servers with specific ports
 */

const { spawn } = require('child_process');
const path = require('path');

// Configuration
const BACKEND_PORT = 5005;
const FRONTEND_PORT = 3005;

console.log('======================================');
console.log('🚀 STOCK-SENSE STARTER');
console.log('======================================');
console.log(`Backend will run on: http://localhost:${BACKEND_PORT}`);
console.log(`Frontend will run on: http://localhost:${FRONTEND_PORT}`);
console.log('--------------------------------------');

// Start backend server
console.log('Starting backend server...');
const backend = spawn('node', ['server.js'], {
  cwd: path.join(__dirname, 'backend'),
  env: {
    ...process.env,
    PORT: BACKEND_PORT.toString(),
    STOCK_API_KEY: 'sk-live-0KwlkkkbLj6KxWuyNimN0gkigsRck7mYP1CTq3Zq',
    CORS_ORIGIN: `http://localhost:${FRONTEND_PORT}`
  },
  stdio: 'inherit'
});

// Start frontend server after a short delay
console.log('Starting frontend server...');
setTimeout(() => {
  const frontend = spawn('npm', ['run', 'dev', '--', '-p', FRONTEND_PORT.toString()], {
    cwd: path.join(__dirname, 'frontend'),
    env: {
      ...process.env,
      NEXT_PUBLIC_API_URL: `http://localhost:${BACKEND_PORT}/api`,
      PORT: FRONTEND_PORT.toString()
    },
    stdio: 'inherit'
  });

  // Handle frontend process events
  frontend.on('error', (err) => {
    console.error('Failed to start frontend:', err);
  });

  frontend.on('exit', (code) => {
    console.log(`Frontend process exited with code ${code}`);
    // Kill backend if frontend exits
    backend.kill();
    process.exit();
  });
}, 2000);

// Handle backend process events
backend.on('error', (err) => {
  console.error('Failed to start backend:', err);
});

backend.on('exit', (code) => {
  console.log(`Backend process exited with code ${code}`);
  process.exit();
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  backend.kill();
  process.exit();
});
