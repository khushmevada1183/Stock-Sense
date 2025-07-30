#!/usr/bin/env node

const { spawn } = require('child_process');
const http = require('http');

console.log('🚀 Starting development servers...');

// Start the backend server
console.log('📡 Starting API server...');
const apiProcess = spawn('node', ['api/server.js'], {
  stdio: 'pipe',
  shell: true
});

apiProcess.stdout.on('data', (data) => {
  console.log(`[API] ${data.toString().trim()}`);
});

apiProcess.stderr.on('data', (data) => {
  console.error(`[API ERROR] ${data.toString().trim()}`);
});

// Function to check if backend is ready
function checkBackend() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:10000/health', (res) => {
      if (res.statusCode === 200) {
        console.log('✅ Health check passed');
        resolve(true);
      } else {
        console.log(`❌ Health check failed with status: ${res.statusCode}`);
        resolve(false);
      }
    });
    
    req.on('error', (error) => {
      console.log(`❌ Health check error: ${error.message}`);
      resolve(false);
    });
    
    req.setTimeout(1000, () => {
      console.log('❌ Health check timeout');
      req.destroy();
      resolve(false);
    });
  });
}

// Wait for backend to be ready, then start frontend
async function waitForBackendAndStartFrontend() {
  console.log('⏳ Waiting for API server to be ready...');
  
  let attempts = 0;
  const maxAttempts = 30; // 30 seconds max wait
  
  while (attempts < maxAttempts) {
    console.log(`📡 Health check attempt ${attempts + 1}/${maxAttempts}...`);
    const isReady = await checkBackend();
    
    if (isReady) {
      console.log('✅ API server is ready! Starting frontend...');
      
      // Start the frontend server
      const frontendProcess = spawn('npx', ['next', 'dev'], {
        stdio: 'pipe',
        shell: true
      });
      
      frontendProcess.stdout.on('data', (data) => {
        console.log(`[FRONTEND] ${data.toString().trim()}`);
      });
      
      frontendProcess.stderr.on('data', (data) => {
        console.error(`[FRONTEND ERROR] ${data.toString().trim()}`);
      });
      
      frontendProcess.on('error', (error) => {
        console.error('[FRONTEND ERROR] Failed to start frontend:', error.message);
      });
      
      // Handle process cleanup
      process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down servers...');
        apiProcess.kill();
        frontendProcess.kill();
        process.exit(0);
      });
      
      process.on('SIGTERM', () => {
        apiProcess.kill();
        frontendProcess.kill();
        process.exit(0);
      });
      
      return;
    } else {
      console.log(`❌ Health check failed, retrying in 1 second...`);
    }
    
    attempts++;
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
  }
  
  console.error('❌ API server failed to start within 30 seconds');
  apiProcess.kill();
  process.exit(1);
}

// Handle API process errors
apiProcess.on('error', (error) => {
  console.error('Failed to start API server:', error);
  process.exit(1);
});

apiProcess.on('exit', (code) => {
  if (code !== 0) {
    console.error(`API server exited with code ${code}`);
    process.exit(1);
  }
});

// Start the sequence
waitForBackendAndStartFrontend();
