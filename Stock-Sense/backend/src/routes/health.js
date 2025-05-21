const express = require('express');
const router = express.Router();

router.get('/health', async (req, res) => {
  try {
    // Add any critical service checks here
    // For example, database connection check
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

module.exports = router; 