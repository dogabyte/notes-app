/**
 * Input validation middleware using express-validator
 */

import { body, param, validationResult } from 'express-validator';
import { HTTP_STATUS, ERROR_MESSAGES, VALIDATION } from '../config/constants.js';

/**
 * Handles validation errors and sends appropriate response
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value,
    }));

    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: ERROR_MESSAGES.VALIDATION_ERROR,
      errors: errorMessages,
    });
  }

  next();
};

/**
 * Validation rules for creating a new note
 */
export const validateCreateNote = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({
      min: VALIDATION.NOTE.TITLE_MIN_LENGTH,
      max: VALIDATION.NOTE.TITLE_MAX_LENGTH
    })
    .withMessage(
      `Title must be between ${VALIDATION.NOTE.TITLE_MIN_LENGTH} and ${VALIDATION.NOTE.TITLE_MAX_LENGTH} characters`
    )
    .escape(),

  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required')
    .isLength({
      min: VALIDATION.NOTE.CONTENT_MIN_LENGTH,
      max: VALIDATION.NOTE.CONTENT_MAX_LENGTH
    })
    .withMessage(
      `Content must be between ${VALIDATION.NOTE.CONTENT_MIN_LENGTH} and ${VALIDATION.NOTE.CONTENT_MAX_LENGTH} characters`
    )
    .escape(),

  handleValidationErrors,
];

/**
 * Validation rules for updating an existing note
 */
export const validateUpdateNote = [
  param('id')
    .isMongoId()
    .withMessage('Invalid note ID format'),

  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty if provided')
    .isLength({
      min: VALIDATION.NOTE.TITLE_MIN_LENGTH,
      max: VALIDATION.NOTE.TITLE_MAX_LENGTH
    })
    .withMessage(
      `Title must be between ${VALIDATION.NOTE.TITLE_MIN_LENGTH} and ${VALIDATION.NOTE.TITLE_MAX_LENGTH} characters`
    )
    .escape(),

  body('content')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Content cannot be empty if provided')
    .isLength({
      min: VALIDATION.NOTE.CONTENT_MIN_LENGTH,
      max: VALIDATION.NOTE.CONTENT_MAX_LENGTH
    })
    .withMessage(
      `Content must be between ${VALIDATION.NOTE.CONTENT_MIN_LENGTH} and ${VALIDATION.NOTE.CONTENT_MAX_LENGTH} characters`
    )
    .escape(),

  // Ensure at least one field is provided for update
  body()
    .custom((value, { req }) => {
      if (!req.body.title && !req.body.content) {
        throw new Error('At least one field (title or content) must be provided for update');
      }
      return true;
    }),

  handleValidationErrors,
];

/**
 * Validation rules for note ID parameter
 */
export const validateNoteId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid note ID format'),

  handleValidationErrors,
];

/**
 * Generic validation for MongoDB ObjectId
 */
export const validateObjectId = (paramName = 'id') => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName} format`),

  handleValidationErrors,
];

/**
 * Sanitizes request body by trimming whitespace from string fields
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
export const sanitizeRequestBody = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }
  next();
};
