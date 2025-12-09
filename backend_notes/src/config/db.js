import mongoose from "mongoose";
import {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  MONGODB_CONFIG,
} from "./constants.js";

/**
 * Establishes connection to MongoDB database
 * @param {string} mongoURI - MongoDB connection string
 * @returns {Promise<void>} - Promise that resolves when connected
 * @throws {Error} - If connection fails or URI is not provided
 */
export async function connectDB(mongoURI) {
  if (!mongoURI) {
    throw new Error(ERROR_MESSAGES.MONGO_URI_NOT_DEFINED);
  }

  try {
    console.log("Attempting to connect to MongoDB...");

    await mongoose.connect(mongoURI, MONGODB_CONFIG.OPTIONS);

    console.log(SUCCESS_MESSAGES.DATABASE_CONNECTED);

    // Handle connection events
    mongoose.connection.on("error", (error) => {
      console.error("MongoDB connection error:", error);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB connection lost");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("MongoDB reconnected successfully");
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error.message);
    throw new Error(
      `${ERROR_MESSAGES.DATABASE_CONNECTION_FAILED}: ${error.message}`,
    );
  }
}

/**
 * Gracefully closes the MongoDB connection
 * @returns {Promise<void>} - Promise that resolves when connection is closed
 */
export async function disconnectDB() {
  try {
    await mongoose.connection.close();
    console.log("MongoDB connection closed successfully");
  } catch (error) {
    console.error("Error closing MongoDB connection:", error.message);
    throw error;
  }
}

/**
 * Checks if the database connection is ready
 * @returns {boolean} - True if connected, false otherwise
 */
export function isConnected() {
  return mongoose.connection.readyState === 1;
}
