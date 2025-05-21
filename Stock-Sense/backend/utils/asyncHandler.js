/**
 * Utility function to handle async route handlers in Express
 * Eliminates the need for try/catch blocks in route handlers
 * @param {Function} fn - Async route handler function
 * @returns {Function} - Express middleware function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { asyncHandler }; 