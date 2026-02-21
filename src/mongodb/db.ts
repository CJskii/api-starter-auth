import mongoose from "mongoose";
import { mockDatabase, closeMockDatabase, clearMockDatabase } from "./mock-db";

const connect = async () => {
  console.log("Connecting to database...");
  
  if (process.env.NODE_ENV === 'production') {
    // Use real MongoDB in production
    try {
      const uri = process.env.MONGODB_URI || "mongodb://mongo:27017/user-api";
      await mongoose.connect(uri);
      console.log("Connected to MongoDB");
    } catch (error) {
      console.error("Failed to connect to MongoDB:", error);
      throw error;
    }
  } else {
    // Use mock database in development
    await mockDatabase();
    console.log("Connected to mock database");
  }
};

const closeDatabase = async () => {
  console.log("Closing database connection...");
  
  if (process.env.NODE_ENV === 'production') {
    try {
      await mongoose.connection.close();
      console.log("MongoDB connection closed");
    } catch (error) {
      console.error("Failed to close MongoDB connection:", error);
      throw error;
    }
  } else {
    await closeMockDatabase();
    console.log("Mock database connection closed");
  }
};

const clearDatabase = async () => {
  console.log("Clearing database...");
  
  if (process.env.NODE_ENV === 'production') {
    try {
      const collections = Object.keys(mongoose.connection.collections);
      for (const collectionName of collections) {
        await mongoose.connection.collections[collectionName].deleteMany({});
      }
      console.log("Database cleared");
    } catch (error) {
      console.error("Failed to clear database:", error);
      throw error;
    }
  } else {
    // Mock database is already cleared on initialization
    await clearMockDatabase();
    console.log("Mock database cleared");
  }
};

export { connect, closeDatabase, clearDatabase };
