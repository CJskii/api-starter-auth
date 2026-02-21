import mongoose from "mongoose";
import { mockDatabase } from "./mock-db";
import { logger } from "../utils/index";

const connect = async () => {
  const isProduction = process.env.NODE_ENV === "production";
  
  if (isProduction) {
    // Use real MongoDB in production - minimal logging
    try {
      const uri = process.env.MONGODB_URI || "mongodb://mongo:27017/user-api";
      await mongoose.connect(uri);
      logger.info("Connected to MongoDB (production)");
    } catch (error) {
      logger.error("Failed to connect to MongoDB", { error });
      throw error;
    }
  } else {
    // Use mock database in development/test environments - detailed logging
    logger.info("Connecting to mock database (development/test)");
    await mockDatabase();
    logger.info("Connected to mock database (development/test)");
  }
};

const closeDatabase = async () => {
  const isProduction = process.env.NODE_ENV === "production";
  
  if (isProduction) {
    try {
      await mongoose.connection.close();
      logger.info("MongoDB connection closed (production)");
    } catch (error) {
      logger.error("Failed to close MongoDB connection", { error });
      throw error;
    }
  } else {
    logger.info("Mock database connection closed (development/test)");
  }
};

const clearDatabase = async () => {
  const isProduction = process.env.NODE_ENV === "production";
  
  if (isProduction) {
    try {
      const collections = Object.keys(mongoose.connection.collections);
      for (const collectionName of collections) {
        await mongoose.connection.collections[collectionName].deleteMany({});
      }
      logger.info("Database cleared (production)");
    } catch (error) {
      logger.error("Failed to clear database", { error });
      throw error;
    }
  } else {
    // Mock database is already cleared on initialization
    logger.info("Mock database cleared (development/test)");
  }
};

export { connect, closeDatabase, clearDatabase };
