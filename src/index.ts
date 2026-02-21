import express from "express";
import { connect, closeDatabase } from "./mongodb/db";
import { userRoute } from "./routes/user";
import { logger } from "./utils/index";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// Routes
app.use("/api/user", userRoute);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Start server
const startServer = async () => {
  try {
    await connect();
    logger.info("Connected to database");
    
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to start server", { error });
    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGINT", async () => {
  logger.info("Shutting down gracefully...");
  await closeDatabase();
  process.exit(0);
});

// Export for testing
export default app;

// Start server if not in test environment
if (process.env.NODE_ENV !== "test") {
  startServer();
}
