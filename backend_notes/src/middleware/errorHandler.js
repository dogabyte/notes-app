import mongoose from "mongoose";
import { HTTP_STATUS, ERROR_MESSAGES } from "../config/constants.js";

/**
 * Global error handler middleware for Express application
 * Categorizes and formats errors with appropriate HTTP status codes
 * @param {Error} err - Error object
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  // Log error details for debugging
  logError(err, req);

  // Handle different types of errors
  if (err instanceof mongoose.Error.ValidationError) {
    return handleValidationError(err, res);
  }

  if (err instanceof mongoose.Error.CastError) {
    return handleCastError(err, res);
  }

  if (err instanceof mongoose.Error.DocumentNotFoundError) {
    return handleNotFoundError(res);
  }

  if (isDatabaseConnectionError(err)) {
    return handleDatabaseConnectionError(err, res);
  }

  if (err.code === 11000) {
    return handleDuplicateKeyError(err, res);
  }

  if (err.name === "JsonWebTokenError") {
    return handleJWTError(err, res);
  }

  if (err.name === "TokenExpiredError") {
    return handleTokenExpiredError(res);
  }

  // Default to internal server error
  return handleGenericError(err, res);
};

/**
 * Logs error information for debugging purposes
 * @param {Error} err - Error object
 * @param {Request} req - Express request object
 */
function logError(err, req) {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] Error occurred:`);
  console.error(`- Method: ${req.method}`);
  console.error(`- URL: ${req.url}`);
  console.error(`- User-Agent: ${req.get("User-Agent") || "Unknown"}`);
  console.error(`- Error Name: ${err.name}`);
  console.error(`- Error Message: ${err.message}`);

  if (process.env.NODE_ENV === "development") {
    console.error(`- Stack Trace: ${err.stack}`);
  }
}

/**
 * Handles Mongoose validation errors
 * @param {mongoose.Error.ValidationError} err - Validation error
 * @param {Response} res - Express response object
 */
function handleValidationError(err, res) {
  const errors = Object.values(err.errors).map((error) => ({
    field: error.path,
    message: error.message,
    value: error.value,
  }));

  return res.status(HTTP_STATUS.BAD_REQUEST).json({
    success: false,
    message: ERROR_MESSAGES.VALIDATION_ERROR,
    errors,
  });
}

/**
 * Handles Mongoose cast errors (invalid ObjectId format)
 * @param {mongoose.Error.CastError} err - Cast error
 * @param {Response} res - Express response object
 */
function handleCastError(err, res) {
  return res.status(HTTP_STATUS.BAD_REQUEST).json({
    success: false,
    message: ERROR_MESSAGES.INVALID_ID_FORMAT,
    field: err.path,
    value: err.value,
  });
}

/**
 * Handles document not found errors
 * @param {Response} res - Express response object
 */
function handleNotFoundError(res) {
  return res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: ERROR_MESSAGES.NOTE_NOT_FOUND,
  });
}

/**
 * Handles database connection errors
 * @param {Error} err - Database connection error
 * @param {Response} res - Express response object
 */
function handleDatabaseConnectionError(err, res) {
  return res.status(HTTP_STATUS.SERVICE_UNAVAILABLE).json({
    success: false,
    message: ERROR_MESSAGES.DATABASE_NOT_AVAILABLE,
  });
}

/**
 * Handles MongoDB duplicate key errors
 * @param {Error} err - Duplicate key error
 * @param {Response} res - Express response object
 */
function handleDuplicateKeyError(err, res) {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];

  return res.status(HTTP_STATUS.CONFLICT).json({
    success: false,
    message: `Duplicate value for field: ${field}`,
    field,
    value,
  });
}

/**
 * Handles JWT authentication errors
 * @param {Error} err - JWT error
 * @param {Response} res - Express response object
 */
function handleJWTError(err, res) {
  return res.status(HTTP_STATUS.UNAUTHORIZED).json({
    success: false,
    message: "Invalid authentication token",
  });
}

/**
 * Handles expired JWT token errors
 * @param {Response} res - Express response object
 */
function handleTokenExpiredError(res) {
  return res.status(HTTP_STATUS.UNAUTHORIZED).json({
    success: false,
    message: "Authentication token has expired",
  });
}

/**
 * Handles generic/unhandled errors
 * @param {Error} err - Generic error
 * @param {Response} res - Express response object
 */
function handleGenericError(err, res) {
  const isDevelopment = process.env.NODE_ENV === "development";

  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    ...(isDevelopment && {
      error: err.message,
      stack: err.stack,
    }),
  });
}

/**
 * Checks if error is related to database connection
 * @param {Error} err - Error object
 * @returns {boolean} - True if it's a database connection error
 */
function isDatabaseConnectionError(err) {
  return (
    err.name === "MongooseServerSelectionError" ||
    err.name === "MongoNetworkError" ||
    err.message?.includes("ECONNREFUSED") ||
    err.message?.includes("ETIMEDOUT") ||
    err.message?.includes("connection") ||
    err.code === "ENOTFOUND"
  );
}

export default errorHandler;
