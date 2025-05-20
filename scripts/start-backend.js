// Simple wrapper script for starting the backend server with appropriate configuration
process.env.PORT = process.env.PORT || 5005;
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3005';

console.log(`Starting backend server on port ${process.env.PORT}`);
console.log(`CORS origin set to: ${process.env.CORS_ORIGIN}`);

const path = require('path');
require(path.join(__dirname, '..', 'backend', 'server.js'));
