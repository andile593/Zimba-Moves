const ApiError = require("../utils/ApiError");

function errorHandler(err, req, res, next) {
  console.error("=== ERROR HANDLER ===");
  console.error("Error name:", err.name);
  console.error("Error message:", err.message);
  console.error("Error code:", err.code);
  console.error("Stack:", err.stack);

  // Handle ApiError instances
  if (err instanceof ApiError) {
    const errorResponse = {
      error: err.message,
      details: err.details || null,
      code: err.code || null,
    };

    console.log("Sending error response:", JSON.stringify(errorResponse));

    return res.status(err.statusCode).json(errorResponse);
  }

  // Handle Prisma errors
  if (err.code && err.code.startsWith("P")) {
    let statusCode = 500;
    let message = "Database error";
    let details = err.message;

    switch (err.code) {
      case "P2002": // Unique constraint violation
        statusCode = 409;
        message = "Duplicate entry";
        details = `${err.meta?.target?.join(", ") || "Field"} already exists`;
        break;
      case "P2003": // Foreign key constraint failed
        statusCode = 400;
        message = "Invalid reference";
        details = "Referenced record does not exist";
        break;
      case "P2025": // Record not found
        statusCode = 404;
        message = "Record not found";
        details = "The requested record does not exist";
        break;
      default:
        details = err.meta?.target?.join(", ") || err.message;
    }

    return res.status(statusCode).json({
      error: message,
      details: details,
      code: err.code,
    });
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      error: "Invalid token",
      details: "The provided token is invalid",
      code: "INVALID_TOKEN",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      error: "Token expired",
      details: "Your session has expired. Please login again",
      code: "TOKEN_EXPIRED",
    });
  }

  // Handle validation errors (from express-validator or similar)
  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "Validation failed",
      details: err.message,
      code: "VALIDATION_ERROR",
    });
  }

  // Handle multer file upload errors
  if (err.name === "MulterError") {
    return res.status(400).json({
      error: "File upload error",
      details: err.message,
      code: err.code,
    });
  }

  // Fallback for unknown errors
  console.error("=== UNHANDLED ERROR ===");
  console.error(err);

  res.status(500).json({
    error: "Internal Server Error",
    details:
      process.env.NODE_ENV === "development"
        ? err.message
        : "An unexpected error occurred",
    code: "INTERNAL_ERROR",
  });
}

module.exports = errorHandler;
