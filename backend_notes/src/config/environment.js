/**
 * Environment configuration and validation utilities
 */

import dotenv from 'dotenv';
import { ENV_VARS, DEFAULT_VALUES, ERROR_MESSAGES } from './constants.js';

// Load environment variables
dotenv.config();

/**
 * Validates that all required environment variables are present
 * @throws {Error} If required environment variables are missing
 */
export function validateEnvironment() {
  const requiredVars = [ENV_VARS.MONGO_URI];
  const missingVars = [];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  }

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }
}

/**
 * Gets environment configuration with defaults
 * @returns {Object} Environment configuration object
 */
export function getEnvironmentConfig() {
  validateEnvironment();

  return {
    port: parseInt(process.env[ENV_VARS.PORT], 10) || DEFAULT_VALUES.PORT,
    mongoUri: process.env[ENV_VARS.MONGO_URI],
    frontendUrl: process.env[ENV_VARS.FRONTEND_URL] || DEFAULT_VALUES.FRONTEND_URL,
    nodeEnv: process.env[ENV_VARS.NODE_ENV] || 'development',
    isDevelopment: process.env[ENV_VARS.NODE_ENV] !== 'production',
    isProduction: process.env[ENV_VARS.NODE_ENV] === 'production',
  };
}

/**
 * Logs environment configuration (without sensitive data)
 * @param {Object} config - Environment configuration
 */
export function logEnvironmentConfig(config) {
  console.log('Environment Configuration:');
  console.log(`- Node Environment: ${config.nodeEnv}`);
  console.log(`- Port: ${config.port}`);
  console.log(`- Frontend URL: ${config.frontendUrl}`);
  console.log(`- MongoDB URI: ${config.mongoUri ? '[CONFIGURED]' : '[MISSING]'}`);
}
