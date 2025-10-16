// middleware/errorHandler.js
function errorHandler(err, req, res, next) {
  console.error(err.stack);

  const statusCode = err.status || 500;
  res.status(statusCode).json({
    error: err.message || "Internal Server Error",
    details: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
}

module.exports = errorHandler;
