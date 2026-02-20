import mongoose from "mongoose";

const connect = async () => {
  console.log("Connecting to MongoDB...");
  try {
    // Use the MongoDB URI from docker-compose
    const uri = process.env.MONGODB_URI || "mongodb://mongo:27017/user-api";
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
};

const closeDatabase = async () => {
  console.log("Closing MongoDB connection...");
  try {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  } catch (error) {
    console.error("Failed to close MongoDB connection:", error);
    throw error;
  }
};

const clearDatabase = async () => {
  console.log("Clearing MongoDB database...");
  try {
    // Get all collections and drop them
    const collections = Object.keys(mongoose.connection.collections);
    for (const collectionName of collections) {
      await mongoose.connection.collections[collectionName].deleteMany({});
    }
    console.log("Database cleared");
  } catch (error) {
    console.error("Failed to clear database:", error);
    throw error;
  }
};

export { connect, closeDatabase, clearDatabase };
