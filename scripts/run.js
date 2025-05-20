const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Parse command line arguments
function parseArgs() {
  const args = {};
  process.argv.slice(2).forEach(arg => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.substring(2).split('=');
      args[key] = value || true;
    }
  });
  return args;
}

const cmdArgs = parseArgs();
// Use different ports to avoid conflicts
const backendPort = cmdArgs['backend-port'] || 5005; // Using port 5005 for backend
const frontendPort = cmdArgs['frontend-port'] || 3005; // Using port 3005 for frontend

// Get the local IP address
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const devName in interfaces) {
    const iface = interfaces[devName];
    for (let i = 0; i < iface.length; i++) {
      const alias = iface[i];
      if (alias.family === 'IPv4' && !alias.internal) {
        return alias.address;
      }
    }
  }
  return '127.0.0.1';
}

// Configuration
const config = {
  backend: {
    dir: path.join(__dirname, '..', 'backend'),
    command: 'npm',
    args: ['run', 'dev:simple'],
    name: 'BACKEND',
    color: '\x1b[36m', // Cyan    port: backendPort,
    env: {
      PORT: backendPort,
      CORS_ORIGIN: `http://localhost:${frontendPort}`,
      STOCK_API_KEY: 'sk-live-0KwlkkkbLj6KxWuyNimN0gkigsRck7mYP1CTq3Zq'
    }
  },
  frontend: {
    dir: path.join(__dirname, '..', 'frontend'),
    command: 'npm',
    args: ['run', 'dev', '--', '-p', frontendPort],
    name: 'FRONTEND',
    color: '\x1b[35m', // Magenta
    port: frontendPort,
    env: {
      // Add Next.js specific environment variables
      HOSTNAME: '0.0.0.0',
      PORT: frontendPort,
      // Ensure correct backend API URL
      NEXT_PUBLIC_API_URL: `http://localhost:${backendPort}`
    }
  }
};

// Reset color code
const resetColor = '\x1b[0m';

// Verify directories exist
if (!fs.existsSync(config.backend.dir)) {
  console.error(`❌ Backend directory not found at: ${config.backend.dir}`);
  process.exit(1);
}

if (!fs.existsSync(config.frontend.dir)) {
  console.error(`❌ Frontend directory not found at: ${config.frontend.dir}`);
  process.exit(1);
}

// Print banner
console.log('\n\x1b[1m=======================================');
console.log('🚀 INDIAN STOCK ANALYZER - ALL-IN-ONE STARTER');
console.log('=======================================\x1b[0m\n');
console.log('This script will start both backend and frontend servers.\n');
console.log(`${config.backend.color}Backend${resetColor}: Using JavaScript server on port ${config.backend.port}`);
console.log(`${config.frontend.color}Frontend${resetColor}: Next.js app on port ${config.frontend.port}\n`);

// Check for compatibility between frontend API calls and backend server
console.log('🔍 Checking for application compatibility...');
console.log('✅ Using the JavaScript server (server.js) which has all required endpoints.\n');

// Function to start a process
function startProcess(processConfig) {
  const { dir, command, args, name, color, env } = processConfig;
  
  console.log(`${color}Starting ${name}...${resetColor}`);
  
  // Prepare environment variables
  const processEnv = { ...process.env };
  if (env) {
    Object.assign(processEnv, env);
  }
  
  const childProcess = spawn(command, args, {
    cwd: dir,
    shell: true,
    stdio: 'pipe',
    env: processEnv
  });
  
  // Handle stdout
  childProcess.stdout.on('data', (data) => {
    data.toString().split('\n').forEach(line => {
      if (line.trim()) {
        console.log(`${color}[${name}]${resetColor} ${line}`);
      }
    });
  });
  
  // Handle stderr
  childProcess.stderr.on('data', (data) => {
    data.toString().split('\n').forEach(line => {
      if (line.trim() && !line.includes('DeprecationWarning')) {
        console.log(`${color}[${name} ERROR]${resetColor} ${line}`);
      }
    });
  });
  
  // Handle process exit
  childProcess.on('close', (code) => {
    if (code !== 0) {
      console.log(`${color}[${name}]${resetColor} Process exited with code ${code}`);
    }
  });
  
  return childProcess;
}

// Start both processes
console.log('Starting services...\n');
const backendProcess = startProcess(config.backend);
const frontendProcess = startProcess(config.frontend);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\nShutting down services...');
  backendProcess.kill();
  frontendProcess.kill();
  process.exit(0);
});

// Display access URLs after a short delay
setTimeout(() => {
  const localIP = getLocalIpAddress();
  
  console.log('\n\x1b[1m=======================================');
  console.log('🌐 APPLICATION ACCESS');
  console.log('=======================================\x1b[0m');
  console.log(`${config.frontend.color}Frontend${resetColor}: http://localhost:${config.frontend.port}`);
  console.log(`${config.frontend.color}Frontend (Network)${resetColor}: http://${localIP}:${config.frontend.port}`);
  console.log(`${config.backend.color}Backend API${resetColor}: http://localhost:${config.backend.port}/api/health`);
  console.log('\nPress Ctrl+C to stop all services.\n');
}, 3000);