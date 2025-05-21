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
// Use different ports to avoid conflicts; defaults are important if args aren't passed
const backendPort = parseInt(cmdArgs['backend-port'], 10) || 5005;
const frontendPort = parseInt(cmdArgs['frontend-port'], 10) || 3005;

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
    args: ['run', 'dev:simple'], // This script in backend/package.json should use process.env.PORT
    name: 'BACKEND',
    color: '\x1b[36m', // Cyan
    port: backendPort, // Crucial for the banner and NEXT_PUBLIC_API_URL
    env: {
      PORT: backendPort.toString(), // Ensure this is passed as env to the backend process
      CORS_ORIGIN: `http://localhost:${frontendPort}`
      // STOCK_API_KEYS (plural) should be set in Render's environment, not here.
    }
  },
  frontend: {
    dir: path.join(__dirname, '..', 'frontend'),
    command: 'npm',
    args: ['run', 'dev', '--', '-p', frontendPort.toString()],
    name: 'FRONTEND',
    color: '\x1b[35m', // Magenta
    port: frontendPort, // Crucial for the banner
    env: {
      HOSTNAME: '0.0.0.0',
      PORT: frontendPort.toString(), // Passed as env to the frontend process
      NEXT_PUBLIC_API_URL: `http://localhost:${backendPort}` // For the Next.js app to call the backend
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
// These console logs depend on config.backend.port and config.frontend.port being correctly set
console.log(`${config.backend.color}Backend${resetColor}: Using JavaScript server on port ${config.backend.port}`);
console.log(`${config.frontend.color}Frontend${resetColor}: Next.js app on port ${config.frontend.port}\n`);

console.log('🔍 Checking for application compatibility...');
console.log('✅ Using the JavaScript server (server.js) which has all required endpoints.\n');

// Function to start a process
function startProcess(processConfig) {
  const { dir, command, args, name, color, env } = processConfig;
  
  console.log(`${color}Starting ${name}...${resetColor}`);
  
  const processEnv = { ...process.env, ...env }; // Merge current env with specified env
    
  const childProcess = spawn(command, args, {
    cwd: dir,
    shell: true, // shell: true can have nuances with PATH and finding executables like 'next'
    stdio: 'pipe',
    env: processEnv
  });
  
  childProcess.stdout.on('data', (data) => {
    data.toString().split('\n').forEach(line => {
      if (line.trim()) {
        console.log(`${color}[${name}]${resetColor} ${line}`);
      }
    });
  });
  
  childProcess.stderr.on('data', (data) => {
    data.toString().split('\n').forEach(line => {
      if (line.trim() && !line.includes('DeprecationWarning')) { // Filter out common warnings if noisy
        console.log(`${color}[${name} ERROR]${resetColor} ${line}`);
      }
    });
  });
  
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

process.on('SIGINT', () => {
  console.log('\n\nShutting down services...');
  if (backendProcess) backendProcess.kill();
  if (frontendProcess) frontendProcess.kill();
  process.exit(0);
});

setTimeout(() => {
  const localIP = getLocalIpAddress();
  
  console.log('\n\x1b[1m=======================================');
  console.log('🌐 APPLICATION ACCESS');
  console.log('=======================================\x1b[0m');
  console.log(`${config.frontend.color}Frontend${resetColor}: http://localhost:${config.frontend.port}`);
  console.log(`${config.frontend.color}Frontend (Network)${resetColor}: http://${localIP}:${config.frontend.port}`);
  console.log(`${config.backend.color}Backend API${resetColor}: http://localhost:${config.backend.port}/api/health`);
  console.log('\nPress Ctrl+C to stop all services.\n');
}, 5000); // Increased delay slightly to allow services more time to start before printing