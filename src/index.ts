// Main entry point for the application
import express, { Application } from "express";
import { connect, closeDatabase, clearDatabase } from "./mongodb/db";
import dotenv from "dotenv";

dotenv.config();
const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Connect to mock database
connect()
  .then(() => {
    console.log("Connected to mock MongoDB");
    console.log("Using port:", PORT);

    return clearDatabase();
  })
  .then(() => {
    console.log("Database cleared");

    return import("./routes/index");
  })
  .then((routes) => {
    app.use("/api", routes.default);

    // Start server only if not running in test environment
    if (process.env.NODE_ENV !== "test") {
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    }
  })
  .catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  await closeDatabase();
  process.exit(0);
});

// Export app for testing
export default app;
