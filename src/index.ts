import express from "express";
import dotenv from "dotenv";
dotenv.config({ quiet: true });

import { connect, closeDatabase } from "./mongodb/db";
import { userRoute } from "./routes/user";
import { helloRoute } from "./routes/hello";

import { logger } from "./utils/index";
import { requestLogger } from "./middleware/request-logger";
import { errorHandler } from "./middleware/error-handler";

const app = express();
const PORT = Number(process.env.PORT ?? 3000);
const ENV = process.env.NODE_ENV ?? "development";

// Middleware
app.use(express.json());
app.use(requestLogger);

// Routes
app.use("/api/user", userRoute);
app.use("/api/hello", helloRoute);

app.get("/health", (_req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.use(errorHandler);

const startServer = async () => {
  try {
    await connect();

    logger.info("server.start", {
      layer: "app",
      module: "server",
      action: "listen",
      port: PORT,
      env: ENV,
    });

    app.listen(PORT, () => {
      logger.info("server.listening", {
        layer: "app",
        module: "server",
        action: "listening",
        port: PORT,
        env: ENV,
      });
    });
  } catch (error) {
    logger.error("server.start.failed", {
      layer: "app",
      module: "server",
      action: "start",
      env: ENV,
      error,
      message: (error as any)?.message,
      stack: (error as any)?.stack,
    });
    process.exit(1);
  }
};

const shutdown = async (signal: string) => {
  try {
    logger.info("server.shutdown.start", {
      layer: "app",
      module: "server",
      action: "shutdown",
      signal,
    });

    await closeDatabase();

    logger.info("server.shutdown.done", {
      layer: "app",
      module: "server",
      action: "shutdown",
      signal,
    });

    process.exit(0);
  } catch (error) {
    logger.error("server.shutdown.failed", {
      layer: "app",
      module: "server",
      action: "shutdown",
      signal,
      error,
      message: (error as any)?.message,
      stack: (error as any)?.stack,
    });
    process.exit(1);
  }
};

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));

export default app;

if (process.env.NODE_ENV !== "test") {
  void startServer();
}