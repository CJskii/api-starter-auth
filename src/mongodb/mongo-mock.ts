import mongoose from 'mongoose';

const connect = async () => {
  console.log("Connecting to mock database...");
  // In a real app, this would connect to MongoDB
  // For testing purposes, we'll just mock the connection
  return Promise.resolve();
};

const closeDatabase = async () => {
  console.log("Database connection closed");
  // In a real app, this would close the MongoDB connection
  // For testing purposes, we'll just mock the closing
  return Promise.resolve();
};

const clearDatabase = async () => {
  console.log("Database cleared");
  // In a real app, this would clear the database
  // For testing purposes, we'll just mock the clearing
  return Promise.resolve();
};

export { connect, closeDatabase, clearDatabase };
