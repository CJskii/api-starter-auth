// Main entry point for the application
import express, { Application } from "express";
import { connect, closeDatabase, clearDatabase } from "./mongodb/db";
import dotenv from "dotenv";
import { logger } from './utils/index'

dotenv.config();
const app: Application = express();
const PORT = process.env.PORT || 3000;

// Validate environment
const validateEnvironment = () => {
  const validEnvironments = ['development', 'production', 'test'];
  const env = process.env.NODE_ENV;
  
  if (!env) {
    logger.warn("NODE_ENV is not set, defaulting to 'development'");
    process.env.NODE_ENV = 'development';
  } else if (!validEnvironments.includes(env)) {
    logger.warn(`Invalid NODE_ENV value: ${env}. Valid values are: ${validEnvironments.join(', ')}`);
    logger.warn("Defaulting to 'development'");
    process.env.NODE_ENV = 'development';
  }
};

validateEnvironment();

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Middleware
app.use(express.json());

// Connect to database
connect()
  .then(() => {
    logger.info("Connected to database");
    logger.info("Using environment:", process.env.NODE_ENV);
    logger.info("Using port:", PORT);

    // Only clear database in development environment
    if (isDevelopment) {
      logger.info("Clearing database in development environment...");
      return clearDatabase();
    }
    return Promise.resolve();
  })
  .then(() => {
    return import("./routes/index");
  })
  .then((routes) => {
    app.use("/api", routes.default);

    // Start server only if not running in test environment
    if (process.env.NODE_ENV !== "test") {
      app.listen(PORT, () => {
        logger.info(`Server is running on port ${PORT}`);
      });
    }
  })
  .catch((error) => {
    logger.error("Failed to start server:", error);
    process.exit(1);
  });

// Handle graceful shutdown
process.on("SIGINT", async () => {
  logger.info("Shutting down gracefully...");
  await closeDatabase();
  process.exit(0);
});

// Export app for testing
export default app;
