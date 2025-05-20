/**
 * Stock-Sense Build Script
 * 
 * This script builds both the backend and frontend applications
 * with proper error handling and verbose logging.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

console.log(`${colors.bright}${colors.cyan}==================================${colors.reset}`);
console.log(`${colors.bright}${colors.cyan}  STOCK-SENSE BUILD PROCESS${colors.reset}`);
console.log(`${colors.bright}${colors.cyan}==================================${colors.reset}\n`);

// Function to run a command in a specific directory
function runCommand(command, args, cwd) {
  return new Promise((resolve, reject) => {
    console.log(`${colors.yellow}> Running: ${command} ${args.join(' ')}${colors.reset}`);
    
    const child = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: true
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

async function buildProject() {
  try {
    const rootDir = path.resolve(__dirname);
    const backendDir = path.join(rootDir, 'backend');
    const frontendDir = path.join(rootDir, 'frontend');

    // Check for the existence of project directories
    if (!fs.existsSync(backendDir)) {
      throw new Error(`Backend directory not found at: ${backendDir}`);
    }

    if (!fs.existsSync(frontendDir)) {
      throw new Error(`Frontend directory not found at: ${frontendDir}`);
    }

    // Build the backend (TypeScript)
    console.log(`\n${colors.bright}${colors.magenta}Building backend...${colors.reset}`);
    await runCommand('npm', ['run', 'build'], backendDir);
    console.log(`${colors.bright}${colors.green}✓ Backend built successfully!${colors.reset}\n`);

    // Build the frontend (Next.js)
    console.log(`${colors.bright}${colors.magenta}Building frontend...${colors.reset}`);
    await runCommand('npm', ['run', 'build'], frontendDir);
    console.log(`${colors.bright}${colors.green}✓ Frontend built successfully!${colors.reset}\n`);

    console.log(`${colors.bright}${colors.green}==================================${colors.reset}`);
    console.log(`${colors.bright}${colors.green}  BUILD SUCCESSFUL${colors.reset}`);
    console.log(`${colors.bright}${colors.green}==================================${colors.reset}\n`);

  } catch (error) {
    console.error(`\n${colors.bright}${colors.red}==================================${colors.reset}`);
    console.error(`${colors.bright}${colors.red}  BUILD FAILED${colors.reset}`);
    console.error(`${colors.bright}${colors.red}==================================${colors.reset}`);
    console.error(`\n${colors.red}Error: ${error.message}${colors.reset}\n`);
    process.exit(1);
  }
}

buildProject();
