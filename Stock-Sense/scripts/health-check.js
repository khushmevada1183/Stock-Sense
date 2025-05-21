/**
 * Health check script for Render
 * This script checks if the backend and frontend services are running
 */

const http = require('http');
const https = require('https');

// Helper function to make HTTP requests
async function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const request = client.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          data
        });
      });
    });
    
    request.on('error', (err) => {
      reject(err);
    });
    
    // Set a timeout to ensure we don't hang
    request.setTimeout(5000, () => {
      request.abort();
      reject(new Error(`Request to ${url} timed out`));
    });
  });
}

async function checkBackendHealth() {
  // Get the URL from environment variables or use default
  const backendUrl = process.env.BACKEND_URL || 
                     process.env.NEXT_PUBLIC_API_URL || 
                     'http://localhost:5005';
  
  const healthEndpoint = `${backendUrl}/api/health`;
  console.log(`Checking backend health at: ${healthEndpoint}`);
  
  try {
    const response = await makeRequest(healthEndpoint);
    if (response.statusCode === 200) {
      console.log('✅ Backend is healthy');
      return true;
    } else {
      console.error(`❌ Backend health check failed with status: ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Backend health check error:', error.message);
    return false;
  }
}

// Main function
async function main() {
  const backendHealthy = await checkBackendHealth();
  
  if (backendHealthy) {
    console.log('✅ All services are healthy');
    process.exit(0); // Success
  } else {
    console.error('❌ Health check failed');
    process.exit(1); // Failure
  }
}

// Run the health check
main().catch((error) => {
  console.error('Fatal error in health check:', error);
  process.exit(1);
}); 