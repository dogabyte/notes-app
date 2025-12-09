/**
 * Notes API Server
 * Express.js server with MongoDB for notes management
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";
import notesRouter from "./routes/notes.js";
import { connectDB, disconnectDB } from "./config/db.js";
import {
  getEnvironmentConfig,
  logEnvironmentConfig,
} from "./config/environment.js";
import {
  CORS_CONFIG,
  HTTP_STATUS,
  DEFAULT_VALUES,
} from "./config/constants.js";
import errorHandler from "./middleware/errorHandler.js";
import { requestLogger } from "./middleware/logger.js";

/**
 * Initialize Express application with middleware and security
 */
function createApp() {
  const app = express();
  const config = getEnvironmentConfig();

  // Security middleware - must be first
  app.use(
    helmet({
      contentSecurityPolicy: config.isProduction,
      crossOriginEmbedderPolicy: false,
    }),
  );

  // Request logging middleware
  app.use(requestLogger);

  // CORS configuration
  const corsOptions = {
    origin: config.frontendUrl,
    methods: CORS_CONFIG.ALLOWED_METHODS,
    allowedHeaders: CORS_CONFIG.ALLOWED_HEADERS,
    credentials: CORS_CONFIG.CREDENTIALS,
  };

  app.use(cors(corsOptions));
  app.options("*", cors(corsOptions));

  // Body parsing middleware
  app.use(
    express.json({
      limit: "10mb",
      strict: true,
    }),
  );
  app.use(
    express.urlencoded({
      extended: true,
      limit: "10mb",
    }),
  );

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.status(HTTP_STATUS.OK).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
      uptime: process.uptime(),
    });
  });

  // API routes
  app.use("/api/notes", notesRouter);

  // 404 handler for undefined routes
  app.use("*", (req, res) => {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: `Route ${req.method} ${req.originalUrl} not found`,
    });
  });

  // Global error handler - must be last
  app.use(errorHandler);

  return app;
}

/**
 * Graceful shutdown handler
 * @param {string} signal - The shutdown signal received
 */
async function gracefulShutdown(signal, server) {
  console.log(`\n📡 Received ${signal}. Starting graceful shutdown...`);

  // Stop accepting new connections
  server.close(async (error) => {
    if (error) {
      console.error("❌ Error during server shutdown:", error);
      process.exit(1);
    }

    try {
      // Close database connection
      await disconnectDB();
      console.log("✅ Server shutdown completed successfully");
      process.exit(0);
    } catch (dbError) {
      console.error("❌ Error closing database connection:", dbError);
      process.exit(1);
    }
  });

  // Force shutdown after timeout
  setTimeout(() => {
    console.error("❌ Forced shutdown due to timeout");
    process.exit(1);
  }, 10000);
}

/**
 * Main application startup function
 */
async function startServer() {
  try {
    // Get and validate configuration
    const config = getEnvironmentConfig();
    logEnvironmentConfig(config);

    // Connect to database
    console.log("🔌 Connecting to MongoDB...");
    await connectDB(config.mongoUri);

    // Create and start Express app
    const app = createApp();
    const server = app.listen(config.port, () => {
      console.log(`🚀 Server running on port ${config.port}`);
      console.log(
        `📍 Health check available at: http://localhost:${config.port}/health`,
      );
      console.log(
        `📍 API available at: http://localhost:${config.port}/api/notes`,
      );
      console.log(`🌍 Environment: ${config.nodeEnv}`);
      console.log("✅ Server startup completed successfully\n");
    });

    // Setup graceful shutdown
    const signals = ["SIGTERM", "SIGINT", "SIGUSR2"];
    signals.forEach((signal) => {
      process.on(signal, () => gracefulShutdown(signal, server));
    });

    // Handle uncaught exceptions
    process.on("uncaughtException", (error) => {
      console.error("❌ Uncaught Exception:", error);
      gracefulShutdown("uncaughtException", server);
    });

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (reason, promise) => {
      console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
      gracefulShutdown("unhandledRejection", server);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    console.error("Stack trace:", error.stack);
    process.exit(1);
  }
}

// Start the server
startServer();
