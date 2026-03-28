#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

const { spawn } = require('child_process');
const http = require('http');

console.log('🏗️  Starting production build...');

// Start the backend server for build (if needed)
console.log('📡 Starting API server for build...');
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
        console.log('✅ API server ready for build');
        resolve(true);
      } else {
        console.log(`❌ API server not ready: ${res.statusCode}`);
        resolve(false);
      }
    });
    
    req.on('error', (error) => {
      console.log(`❌ API connection error: ${error.message}`);
      resolve(false);
    });
    
    req.setTimeout(2000, () => {
      console.log('❌ API health check timeout');
      req.destroy();
      resolve(false);
    });
  });
}

// Wait for backend to be ready, then start build
async function waitForBackendAndBuild() {
  console.log('⏳ Ensuring API server is ready for build...');
  
  let attempts = 0;
  const maxAttempts = 30; // 30 seconds max wait
  
  while (attempts < maxAttempts) {
    const isReady = await checkBackend();
    
    if (isReady) {
      console.log('✅ API server is ready! Starting build process...');
      
      // Start the build process
      const buildProcess = spawn('npx', ['--no-install', 'next', 'build'], {
        stdio: 'pipe',
        shell: true,
      });
      
      buildProcess.stdout.on('data', (data) => {
        console.log(`[BUILD] ${data.toString().trim()}`);
      });
      
      buildProcess.stderr.on('data', (data) => {
        console.error(`[BUILD ERROR] ${data.toString().trim()}`);
      });
      
      buildProcess.on('error', (error) => {
        console.error('[BUILD ERROR] Failed to start build:', error.message);
        apiProcess.kill();
        process.exit(1);
      });
      
      buildProcess.on('exit', (code) => {
        console.log(`\n🏁 Build process completed with code: ${code}`);
        
        // Kill the API server
        console.log('🛑 Shutting down API server...');
        apiProcess.kill();
        
        if (code === 0) {
          console.log('✅ Build successful!');
          process.exit(0);
        } else {
          console.log('❌ Build failed!');
          process.exit(1);
        }
      });
      
      // Handle process cleanup
      process.on('SIGINT', () => {
        console.log('\n🛑 Build interrupted, shutting down...');
        apiProcess.kill();
        buildProcess.kill();
        process.exit(1);
      });
      
      process.on('SIGTERM', () => {
        apiProcess.kill();
        buildProcess.kill();
        process.exit(1);
      });
      
      return;
    }
    
    attempts++;
    if (attempts % 5 === 0) {
      console.log(`Still waiting for API server... (${attempts}/${maxAttempts})`);
    }
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
  }
  
  console.error('❌ API server failed to start within 30 seconds');
  console.log('🤔 Continuing with build anyway (some builds don\'t need API)...');
  
  // Try building without API
  const buildProcess = spawn('npx', ['--no-install', 'next', 'build'], {
    stdio: 'pipe',
    shell: true
  });
  
  buildProcess.stdout.on('data', (data) => {
    console.log(`[BUILD] ${data.toString().trim()}`);
  });
  
  buildProcess.stderr.on('data', (data) => {
    console.error(`[BUILD ERROR] ${data.toString().trim()}`);
  });
  
  buildProcess.on('exit', (code) => {
    console.log(`\n🏁 Build process completed with code: ${code}`);
    apiProcess.kill();
    process.exit(code);
  });
}

// Handle API process errors
apiProcess.on('error', () => {
  console.log('API server failed to start, continuing with build anyway...');
  // Don't exit, continue with build
});

apiProcess.on('exit', (code) => {
  if (code !== 0) {
    console.log(`API server exited with code ${code}, but continuing with build...`);
  }
});

// Start the sequence
waitForBackendAndBuild();
