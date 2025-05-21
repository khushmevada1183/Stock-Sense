#!/bin/bash

echo "===== Indian Stock Analyzer Frontend Installation ====="
echo "Installing all required dependencies for the Stock Analyzer frontend..."

# Clean installation (optional, uncomment if needed)
# echo "Cleaning node_modules and package-lock.json..."
# rm -rf node_modules
# rm -f package-lock.json

# Install all dependencies from package.json
npm install

# Make sure these specific dependencies are installed
echo "Ensuring UI component libraries are installed..."
npm install @radix-ui/react-slot @radix-ui/react-tabs @radix-ui/react-progress class-variance-authority clsx tailwind-merge next-themes

echo "Dependencies installed successfully!"

# Provide info about the fixed configuration
echo "Configuration updates:"
echo "- Fixed next.config.js to remove deprecated settings"
echo "- Added cross-origin request allowance for development"
echo "- Added all required UI components"

echo "Starting the development server..."
# Run the development server
npm run dev 