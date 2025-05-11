/**
 * This script finds and updates all API URL references to ensure they use port 5002
 * instead of port 5000, which is needed for proper frontend-backend integration.
 */

const fs = require('fs');
const path = require('path');

// Regular expression to match API URL with port 5000
const API_URL_REGEX = /process\.env\.NEXT_PUBLIC_API_URL\s*\|\|\s*['"]http:\/\/localhost:5000\/api['"]/g;
const DIRECT_URL_REGEX = /['"]http:\/\/localhost:5000\/api['"]/g;
// Also match port 5001 references
const API_URL_REGEX_5001 = /process\.env\.NEXT_PUBLIC_API_URL\s*\|\|\s*['"]http:\/\/localhost:5001\/api['"]/g;
const DIRECT_URL_REGEX_5001 = /['"]http:\/\/localhost:5001\/api['"]/g;

// Get all directories to scan
console.log('Current directory:', __dirname);

// Directories to scan
const dirsToScan = [
  'app',
  'components',
  'services',
  'context'
];

console.log('Starting port fix script...');

// Counter for statistics
let totalFiles = 0;
let modifiedFiles = 0;

// Process each directory
for (const dir of dirsToScan) {
  const dirPath = path.join(__dirname, dir);
  console.log(`Checking if directory exists: ${dirPath}`);
  
  if (fs.existsSync(dirPath)) {
    console.log(`Processing directory: ${dir}`);
    processDirectory(dirPath);
  } else {
    console.log(`Directory does not exist: ${dir} - skipping`);
  }
}

// Process a directory recursively
function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dirPath, file.name);
    
    if (file.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.name.endsWith('.ts') || file.name.endsWith('.tsx') || 
             file.name.endsWith('.js') || file.name.endsWith('.jsx')) {
      processFile(fullPath);
    }
  }
}

// Process a single file
function processFile(filePath) {
  totalFiles++;
  console.log(`Checking file: ${filePath}`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Look for port 5000 or 5001 references
    if (content.includes('localhost:5000') || content.includes('localhost:5001')) {
      console.log(`Found port 5000/5001 reference in: ${filePath}`);
      
      // Replace all instances
      const updatedContent = content
        .replace(API_URL_REGEX, "process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api'")
        .replace(DIRECT_URL_REGEX, "'http://localhost:5002/api'")
        .replace(API_URL_REGEX_5001, "process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api'")
        .replace(DIRECT_URL_REGEX_5001, "'http://localhost:5002/api'");
      
      // If content changed, write it back
      if (content !== updatedContent) {
        fs.writeFileSync(filePath, updatedContent, 'utf8');
        console.log(`✅ Updated: ${filePath}`);
        modifiedFiles++;
      }
    }
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error.message);
  }
}

// Print summary
console.log('\n=== Summary ===');
console.log(`Checked ${totalFiles} files`);
console.log(`Modified ${modifiedFiles} files`);
console.log('Script completed!'); 