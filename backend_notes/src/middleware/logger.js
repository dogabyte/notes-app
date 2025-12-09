/**
 * Request logger middleware for HTTP request monitoring
 * Logs incoming requests with method, URL, IP, and response details
 */

import { getEnvironmentConfig } from '../config/environment.js';

/**
 * Creates a request logger middleware
 * @param {Object} options - Logger configuration options
 * @returns {Function} Express middleware function
 */
export function createRequestLogger(options = {}) {
  const config = getEnvironmentConfig();
  const {
    logLevel = config.isDevelopment ? 'detailed' : 'minimal',
    includeBody = config.isDevelopment,
    maxBodyLength = 1000,
  } = options;

  return (req, res, next) => {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();

    // Store original end method to intercept response
    const originalEnd = res.end;
    let responseBody = '';

    // Intercept response body if in development
    if (config.isDevelopment) {
      res.end = function (chunk, encoding) {
        if (chunk) {
          responseBody = chunk.toString('utf8');
        }
        originalEnd.call(this, chunk, encoding);
      };
    }

    // Log request details
    logRequest(req, timestamp, { includeBody, maxBodyLength, logLevel });

    // Handle response completion
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      logResponse(req, res, duration, responseBody, { logLevel });
    });

    next();
  };
}

/**
 * Logs incoming request details
 * @param {Request} req - Express request object
 * @param {string} timestamp - Request timestamp
 * @param {Object} options - Logging options
 */
function logRequest(req, timestamp, options) {
  const { includeBody, maxBodyLength, logLevel } = options;

  const baseInfo = {
    timestamp,
    method: req.method,
    url: req.url,
    ip: getClientIP(req),
    userAgent: req.get('User-Agent') || 'Unknown',
  };

  if (logLevel === 'minimal') {
    console.log(`→ ${baseInfo.method} ${baseInfo.url} from ${baseInfo.ip}`);
    return;
  }

  // Detailed logging
  console.log('\n📥 Incoming Request:');
  console.log(`- Timestamp: ${baseInfo.timestamp}`);
  console.log(`- Method: ${baseInfo.method}`);
  console.log(`- URL: ${baseInfo.url}`);
  console.log(`- IP: ${baseInfo.ip}`);
  console.log(`- User-Agent: ${baseInfo.userAgent}`);

  // Log headers (excluding sensitive ones)
  const filteredHeaders = filterSensitiveHeaders(req.headers);
  if (Object.keys(filteredHeaders).length > 0) {
    console.log('- Headers:');
    Object.entries(filteredHeaders).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });
  }

  // Log request body if applicable
  if (includeBody && req.body && Object.keys(req.body).length > 0) {
    const bodyStr = JSON.stringify(req.body, null, 2);
    const truncatedBody = bodyStr.length > maxBodyLength
      ? bodyStr.substring(0, maxBodyLength) + '... (truncated)'
      : bodyStr;

    console.log('- Body:');
    console.log(truncatedBody);
  }

  // Log query parameters
  if (req.query && Object.keys(req.query).length > 0) {
    console.log('- Query Parameters:');
    Object.entries(req.query).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });
  }
}

/**
 * Logs response details
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {number} duration - Request duration in milliseconds
 * @param {string} responseBody - Response body content
 * @param {Object} options - Logging options
 */
function logResponse(req, res, duration, responseBody, options) {
  const { logLevel } = options;

  const statusColor = getStatusColor(res.statusCode);
  const durationColor = getDurationColor(duration);

  if (logLevel === 'minimal') {
    console.log(
      `← ${req.method} ${req.url} ${statusColor}${res.statusCode}\x1b[0m ${durationColor}${duration}ms\x1b[0m`
    );
    return;
  }

  // Detailed logging
  console.log('\n📤 Response:');
  console.log(`- Status: ${statusColor}${res.statusCode} ${getStatusText(res.statusCode)}\x1b[0m`);
  console.log(`- Duration: ${durationColor}${duration}ms\x1b[0m`);

  // Log response headers (excluding sensitive ones)
  const responseHeaders = res.getHeaders();
  const filteredResponseHeaders = filterSensitiveHeaders(responseHeaders);
  if (Object.keys(filteredResponseHeaders).length > 0) {
    console.log('- Response Headers:');
    Object.entries(filteredResponseHeaders).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });
  }

  // Log response body in development (truncated)
  if (responseBody && process.env.NODE_ENV === 'development') {
    try {
      const parsedBody = JSON.parse(responseBody);
      const bodyStr = JSON.stringify(parsedBody, null, 2);
      const truncatedBody = bodyStr.length > 500
        ? bodyStr.substring(0, 500) + '... (truncated)'
        : bodyStr;

      console.log('- Response Body:');
      console.log(truncatedBody);
    } catch (error) {
      // Not JSON, log as string
      const truncatedBody = responseBody.length > 500
        ? responseBody.substring(0, 500) + '... (truncated)'
        : responseBody;
      console.log('- Response Body:');
      console.log(truncatedBody);
    }
  }

  console.log('─'.repeat(80));
}

/**
 * Extracts client IP address from request
 * @param {Request} req - Express request object
 * @returns {string} Client IP address
 */
function getClientIP(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip ||
    'unknown'
  );
}

/**
 * Filters out sensitive headers from logging
 * @param {Object} headers - Request/response headers
 * @returns {Object} Filtered headers
 */
function filterSensitiveHeaders(headers) {
  const sensitiveHeaders = [
    'authorization',
    'cookie',
    'set-cookie',
    'x-api-key',
    'x-auth-token',
    'authentication',
  ];

  const filtered = {};

  Object.entries(headers).forEach(([key, value]) => {
    if (!sensitiveHeaders.includes(key.toLowerCase())) {
      filtered[key] = value;
    } else {
      filtered[key] = '[REDACTED]';
    }
  });

  return filtered;
}

/**
 * Gets color code for HTTP status
 * @param {number} status - HTTP status code
 * @returns {string} ANSI color code
 */
function getStatusColor(status) {
  if (status >= 200 && status < 300) return '\x1b[32m'; // Green
  if (status >= 300 && status < 400) return '\x1b[33m'; // Yellow
  if (status >= 400 && status < 500) return '\x1b[31m'; // Red
  if (status >= 500) return '\x1b[35m'; // Magenta
  return '\x1b[37m'; // White
}

/**
 * Gets color code for request duration
 * @param {number} duration - Duration in milliseconds
 * @returns {string} ANSI color code
 */
function getDurationColor(duration) {
  if (duration < 100) return '\x1b[32m'; // Green (fast)
  if (duration < 500) return '\x1b[33m'; // Yellow (medium)
  return '\x1b[31m'; // Red (slow)
}

/**
 * Gets human-readable status text
 * @param {number} statusCode - HTTP status code
 * @returns {string} Status text
 */
function getStatusText(statusCode) {
  const statusTexts = {
    200: 'OK',
    201: 'Created',
    204: 'No Content',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    409: 'Conflict',
    422: 'Unprocessable Entity',
    500: 'Internal Server Error',
    503: 'Service Unavailable',
  };

  return statusTexts[statusCode] || 'Unknown';
}

/**
 * Default request logger with standard configuration
 */
export const requestLogger = createRequestLogger();

/**
 * Development request logger with detailed logging
 */
export const devRequestLogger = createRequestLogger({
  logLevel: 'detailed',
  includeBody: true,
  maxBodyLength: 2000,
});

/**
 * Production request logger with minimal logging
 */
export const prodRequestLogger = createRequestLogger({
  logLevel: 'minimal',
  includeBody: false,
});
