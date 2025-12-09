/**
 * Application constants and configuration values
 */

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// Default values
export const DEFAULT_VALUES = {
  PORT: 5000,
  FRONTEND_URL: 'http://localhost:3000',
  DB_CONNECTION_TIMEOUT: 30000,
  REQUEST_TIMEOUT: 5000,
};

// Error messages
export const ERROR_MESSAGES = {
  DATABASE_CONNECTION_FAILED: 'Failed to connect to database',
  DATABASE_NOT_AVAILABLE: 'Database service is not available',
  NOTE_NOT_FOUND: 'Note not found',
  NOTE_CREATION_FAILED: 'Failed to create note',
  NOTE_UPDATE_FAILED: 'Failed to update note',
  NOTE_DELETION_FAILED: 'Failed to delete note',
  INVALID_ID_FORMAT: 'Invalid ID format provided',
  VALIDATION_ERROR: 'Validation error occurred',
  INTERNAL_SERVER_ERROR: 'Internal server error occurred',
  MISSING_REQUIRED_FIELDS: 'Missing required fields',
  MONGO_URI_NOT_DEFINED: 'MONGO_URI environment variable is not defined',
};

// Success messages
export const SUCCESS_MESSAGES = {
  NOTE_CREATED: 'Note created successfully',
  NOTE_UPDATED: 'Note updated successfully',
  NOTE_DELETED: 'Note deleted successfully',
  DATABASE_CONNECTED: 'Successfully connected to MongoDB',
  SERVER_STARTED: 'Server is running on port',
};

// Validation constraints
export const VALIDATION = {
  NOTE: {
    TITLE_MIN_LENGTH: 1,
    TITLE_MAX_LENGTH: 200,
    CONTENT_MIN_LENGTH: 1,
    CONTENT_MAX_LENGTH: 10000,
  },
};

// CORS configuration
export const CORS_CONFIG = {
  ALLOWED_METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  ALLOWED_HEADERS: ['Content-Type', 'ngrok-skip-browser-warning', 'Authorization'],
  CREDENTIALS: true,
};

// MongoDB configuration
export const MONGODB_CONFIG = {
  OPTIONS: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  },
};

// Environment variables
export const ENV_VARS = {
  PORT: 'PORT',
  MONGO_URI: 'MONGO_URI',
  FRONTEND_URL: 'URL_Front',
  NODE_ENV: 'NODE_ENV',
};
