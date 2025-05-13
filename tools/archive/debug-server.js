/**
 * Debug script to check server connectivity and API issues
 */

const http = require('http');
const express = require('express');
const cors = require('cors');

// Create a minimal Express app for testing
const app = express();
const PORT = 5003; // Using a different port for testing

// Basic middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ status: 'success', message: 'Test endpoint is working' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'UP', timestamp: new Date() });
});

// Start server with error handling
try {
  const server = app.listen(PORT, () => {
    console.log(`Debug server running on port ${PORT}`);
    console.log(`Test URL: http://localhost:${PORT}/api/test`);
    console.log(`Health URL: http://localhost:${PORT}/api/health`);
  });

  // Listen for errors
  server.on('error', (error) => {
    console.error('Server error:', error.message);
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Try another port.`);
    }
  });
} catch (error) {
  console.error('Failed to start server:', error.message);
}

// Check if ports are in use
function checkPort(port) {
  const tester = http.createServer();
  
  return new Promise((resolve) => {
    tester.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${port} is in use`);
        resolve(false);
      } else {
        console.log(`Error checking port ${port}:`, err.message);
        resolve(false);
      }
    });
    
    tester.once('listening', () => {
      console.log(`Port ${port} is available`);
      tester.close();
      resolve(true);
    });
    
    tester.listen(port);
  });
}

// Check multiple ports
async function checkPorts() {
  console.log('Checking port availability...');
  await checkPort(5000);
  await checkPort(5001);
  await checkPort(5002);
  await checkPort(5003);
  console.log('Port check complete');
}

// Run port check
checkPorts(); 