#!/bin/bash

echo "Installing dependencies for optimized Stock Analyzer..."

# Navigate to the project root
cd "$(dirname "$0")"

# Install root level dependencies
echo "Installing root project dependencies..."
npm install

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install dotenv helmet express-rate-limit --save

# Fix any vulnerabilities if possible
echo "Fixing vulnerabilities..."
npm audit fix --force

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd ../frontend
npm install --save-dev @types/node @types/react @types/react-dom typescript

# Fix any vulnerabilities if possible
npm audit fix --force

echo "Dependencies installation complete!"
echo "You may now run the application using npm start" 