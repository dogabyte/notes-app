/**
 * Application constants and configuration values
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

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
} as const;

// UI Constants
export const UI_CONSTANTS = {
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 200,
  TOAST_DURATION: 5000,
  LOADING_DELAY: 200,
  MAX_TITLE_LENGTH: 200,
  MAX_CONTENT_LENGTH: 10000,
  MIN_SEARCH_LENGTH: 2,
  ITEMS_PER_PAGE: 20,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  NOT_FOUND: 'The requested item was not found.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FETCH_NOTES_ERROR: 'Failed to load notes. Please refresh the page.',
  CREATE_NOTE_ERROR: 'Failed to create note. Please try again.',
  UPDATE_NOTE_ERROR: 'Failed to update note. Please try again.',
  DELETE_NOTE_ERROR: 'Failed to delete note. Please try again.',
  TITLE_REQUIRED: 'Title is required',
  CONTENT_REQUIRED: 'Content is required',
  TITLE_TOO_LONG: `Title must be less than ${UI_CONSTANTS.MAX_TITLE_LENGTH} characters`,
  CONTENT_TOO_LONG: `Content must be less than ${UI_CONSTANTS.MAX_CONTENT_LENGTH} characters`,
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  NOTE_CREATED: 'Note created successfully!',
  NOTE_UPDATED: 'Note updated successfully!',
  NOTE_DELETED: 'Note deleted successfully!',
  CHANGES_SAVED: 'Changes saved successfully!',
} as const;

// Form Validation Rules
export const VALIDATION_RULES = {
  TITLE: {
    required: true,
    minLength: 1,
    maxLength: UI_CONSTANTS.MAX_TITLE_LENGTH,
    pattern: /^.*$/,
  },
  CONTENT: {
    required: true,
    minLength: 1,
    maxLength: UI_CONSTANTS.MAX_CONTENT_LENGTH,
  },
} as const;

// Theme Configuration
export const THEME = {
  COLORS: {
    PRIMARY: '#3b82f6',
    SECONDARY: '#6b7280',
    SUCCESS: '#10b981',
    WARNING: '#f59e0b',
    ERROR: '#ef4444',
    INFO: '#06b6d4',
  },
  BREAKPOINTS: {
    SM: '640px',
    MD: '768px',
    LG: '1024px',
    XL: '1280px',
    '2XL': '1536px',
  },
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  THEME_PREFERENCE: 'notes-app-theme',
  USER_PREFERENCES: 'notes-app-preferences',
  DRAFT_NOTE: 'notes-app-draft',
  LAST_SYNC: 'notes-app-last-sync',
} as const;

// Feature Flags
export const FEATURES = {
  ENABLE_SEARCH: true,
  ENABLE_DARK_MODE: true,
  ENABLE_OFFLINE_MODE: false,
  ENABLE_EXPORT: true,
  ENABLE_TAGS: false,
} as const;

// Animation Variants for Framer Motion (if added later)
export const ANIMATIONS = {
  FADE_IN: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  },
  SLIDE_UP: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
    transition: { duration: 0.2 },
  },
  SCALE: {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.95, opacity: 0 },
    transition: { duration: 0.15 },
  },
} as const;

// Environment-specific constants
export const ENV = {
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
  MODE: import.meta.env.MODE,
} as const;
