// Add API key status endpoint
router.get('/api-keys/status', async (req, res) => {
  try {
    const apiKeyManager = require('../../services/apiKeyManager');
    const keys = apiKeyManager.getAllKeys();
    const currentKey = apiKeyManager.getCurrentKey();
    
    // Add diagnostic information
    const diagnosticInfo = {
      totalKeys: keys.length,
      availableKeys: keys.filter(k => k.isAvailable && k.monthlyRemaining > 0).length,
      rateLimitedKeys: keys.filter(k => !k.isAvailable && k.monthlyRemaining > 0).length,
      monthlyLimitKeys: keys.filter(k => k.monthlyRemaining <= 0).length,
      currentKeyIndex: keys.findIndex(k => k.isCurrent),
      currentKey: currentKey ? `${currentKey.substring(0, 10)}...` : 'None'
    };
    
    res.json({
      status: 'success',
      keys,
      diagnosticInfo
    });
  } catch (error) {
    console.error('Error fetching API key status:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to fetch API key status',
      error: error.message
    });
  }
}); 