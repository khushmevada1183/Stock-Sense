/**
 * API Key Management Routes
 * 
 * Routes to add, remove, list, and rotate API keys
 */

const express = require('express');
const router = express.Router();
const apiKeyManager = require('../services/apiKeyManager');

// Authentication middleware for API key routes
// This is a simple example - in production, use proper authentication
const authMiddleware = (req, res, next) => {
  // Get the admin password from environment variable
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  
  // Check if the password matches
  const providedPassword = req.headers['x-admin-password'];
  if (!providedPassword || providedPassword !== adminPassword) {
    return res.status(401).json({ error: 'Unauthorized. Admin password required.' });
  }
  
  next();
};

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all API keys (with masked values for security)
router.get('/', (req, res) => {
  try {
    const keys = apiKeyManager.getAllKeys();
    res.json({ keys });
  } catch (error) {
    console.error('Error getting API keys:', error);
    res.status(500).json({ error: 'Failed to retrieve API keys' });
  }
});

// Add a new API key
router.post('/', (req, res) => {
  try {
    const { apiKey } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }
    
    // Validate API key format (simple check for demonstration)
    if (!apiKey.startsWith('sk-') || apiKey.length < 20) {
      return res.status(400).json({ error: 'Invalid API key format' });
    }
    
    const added = apiKeyManager.addKey(apiKey);
    
    if (!added) {
      return res.status(409).json({ error: 'Key already exists in rotation' });
    }
    
    res.status(201).json({ message: 'API key added successfully' });
  } catch (error) {
    console.error('Error adding API key:', error);
    res.status(500).json({ error: 'Failed to add API key' });
  }
});

// Remove an API key
router.delete('/', (req, res) => {
  try {
    const { apiKey } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }
    
    const removed = apiKeyManager.removeKey(apiKey);
    
    if (!removed) {
      return res.status(404).json({ error: 'API key not found in rotation' });
    }
    
    res.json({ message: 'API key removed successfully' });
  } catch (error) {
    console.error('Error removing API key:', error);
    res.status(500).json({ error: 'Failed to remove API key' });
  }
});

// Manually rotate to the next available key
router.post('/rotate', (req, res) => {
  try {
    const rotated = apiKeyManager.rotateToNextAvailableKey();
    
    if (!rotated) {
      return res.status(503).json({ 
        error: 'No available API keys to rotate to',
        message: 'All API keys are currently rate limited. Please try again later.'
      });
    }
    
    res.json({ message: 'Rotated to next available API key successfully' });
  } catch (error) {
    console.error('Error rotating API key:', error);
    res.status(500).json({ error: 'Failed to rotate API key' });
  }
});

// Create a simple CLI utility script
router.get('/cli-script', (req, res) => {
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  
  const scriptContent = '#!/bin/bash\n' +
    '# API Key Management CLI for Indian Stock Analyzer\n' +
    '# Usage: ./api-key-manager.sh [command] [arguments]\n\n' +
    'BASE_URL="http://localhost:3001/api/keys"\n' +
    'ADMIN_PASSWORD="' + adminPassword + '"\n\n' +
    'case "$1" in\n' +
    '  list)\n' +
    '    echo "Listing all API keys..."\n' +
    '    curl -s -X GET "$BASE_URL" -H "x-admin-password: $ADMIN_PASSWORD" | json_pp\n' +
    '    ;;\n' +
    '  add)\n' +
    '    if [ -z "$2" ]; then\n' +
    '      echo "Error: API key is required"\n' +
    '      echo "Usage: ./api-key-manager.sh add <api-key>"\n' +
    '      exit 1\n' +
    '    fi\n\n' +
    '    echo "Adding new API key: $2"\n' +
    '    curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -H "x-admin-password: $ADMIN_PASSWORD" -d \'{"apiKey": "\'"$2"\'"}\'| json_pp\n' +
    '    ;;\n' +
    '  remove)\n' +
    '    if [ -z "$2" ]; then\n' +
    '      echo "Error: API key is required"\n' +
    '      echo "Usage: ./api-key-manager.sh remove <api-key>"\n' +
    '      exit 1\n' +
    '    fi\n\n' +
    '    echo "Removing API key: ${2:0:5}...${2: -4}"\n' +
    '    curl -s -X DELETE "$BASE_URL" -H "Content-Type: application/json" -H "x-admin-password: $ADMIN_PASSWORD" -d \'{"apiKey": "\'"$2"\'"}\'| json_pp\n' +
    '    ;;\n' +
    '  rotate)\n' +
    '    echo "Rotating to next available API key..."\n' +
    '    curl -s -X POST "$BASE_URL/rotate" -H "x-admin-password: $ADMIN_PASSWORD" | json_pp\n' +
    '    ;;\n' +
    '  *)\n' +
    '    echo "Indian Stock API Key Manager"\n' +
    '    echo "====="\n' +
    '    echo "Commands:"\n' +
    '    echo "  list                      - List all API keys with status"\n' +
    '    echo "  add <api-key>             - Add a new API key to the rotation"\n' +
    '    echo "  remove <api-key>          - Remove an API key from rotation"\n' +
    '    echo "  rotate                    - Manually rotate to next available key"\n' +
    '    ;;\n' +
    'esac\n';

  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Disposition', 'attachment; filename="api-key-manager.sh"');
  res.send(scriptContent);
});

module.exports = router; 