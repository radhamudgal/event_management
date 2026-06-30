/**
 * errorMiddleware.js — Global error handling
 * notFound     → 404 for unmatched routes
 * errorHandler → catches all errors thrown in controllers
 */

// 404 — no route matched
export function notFound(req, res) {
  res.status(404).json({ message: `Not found: ${req.originalUrl}` });
}

// Global error handler (4 params required by Express)
export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error(err.message);
  const status = err.name === 'ValidationError' ? 400 : (err.statusCode || 500);
  res.status(status).json({ message: err.message || 'Server error' });
}
