// This script sets up the necessary environment variables for running the frontend
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5005/api';
process.env.PORT = '3005';

console.log('Running frontend on port:', process.env.PORT);
console.log('Using API URL:', process.env.NEXT_PUBLIC_API_URL);

// Launch Next.js dev server with proper port
const { spawn } = require('child_process');
const path = require('path');

const nextProcess = spawn('npx', ['next', 'dev', '-p', process.env.PORT], {
  cwd: path.join(__dirname, '..', 'frontend'),
  stdio: 'inherit',
  env: {
    ...process.env,
    NEXT_PUBLIC_API_URL: config.backend.env.CORS_ORIGIN + '/api'
  }
});

nextProcess.on('error', (err) => {
  console.error('Failed to start frontend:', err);
});
