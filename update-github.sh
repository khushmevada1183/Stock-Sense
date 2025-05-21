#!/bin/bash

# Script to update stock-sense-build repository on GitHub

echo "=== Starting GitHub update process ==="

# Add all changed files
echo "Adding all files to git staging..."
git add .

# Commit changes with a meaningful message
echo "Committing changes..."
git commit -m "Fix API key rotation system and improve server reliability

- Enhanced API key rotation system to handle rate limiting properly
- Added diagnostics endpoint for API key status monitoring
- Updated server.js to use apiKeyManager for all API calls
- Added testing script for API key rotation verification
- Improved error handling for Missing API key errors
- Added Docker and deployment configurations"

# Push to GitHub
echo "Pushing changes to GitHub..."
git push origin main

echo "=== GitHub update complete! ==="
echo "Repository updated: https://github.com/khushmevada5005/stock-sense-build" 