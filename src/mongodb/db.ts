import mongoose from "mongoose";
import { mockDatabase } from "./mock-db";
import { logger } from "../utils/index";

const ENV = process.env.NODE_ENV ?? "development";
const isProduction = ENV === "production";

export const connect = async () => {
  if (isProduction) {
    const uri = process.env.MONGODB_URI || "mongodb://mongo:27017/user-api";

    try {
      await mongoose.connect(uri);

      logger.info("db.connect.success", {
        layer: "db",
        module: "mongodb",
        action: "connect",
        env: ENV,
        driver: "mongoose",
      });
    } catch (error) {
      logger.error("db.connect.failed", {
        layer: "db",
        module: "mongodb",
        action: "connect",
        env: ENV,
        driver: "mongoose",
        error,
        message: (error as any)?.message,
        stack: (error as any)?.stack,
      });
      throw error;
    }
    return;
  }

  // dev/test mock
  logger.info("db.connect.start", {
    layer: "db",
    module: "mockDb",
    action: "connect",
    env: ENV,
  });

  await mockDatabase();

  logger.info("db.connect.success", {
    layer: "db",
    module: "mockDb",
    action: "connect",
    env: ENV,
  });
};;

export const closeDatabase = async () => {
  if (isProduction) {
    try {
      await mongoose.connection.close();

      logger.info("db.close.success", {
        layer: "db",
        module: "mongodb",
        action: "close",
        env: ENV,
        driver: "mongoose",
      });
    } catch (error) {
      logger.error("db.close.failed", {
        layer: "db",
        module: "mongodb",
        action: "close",
        env: ENV,
        driver: "mongoose",
        error,
        message: (error as any)?.message,
        stack: (error as any)?.stack,
      });
      throw error;
    }
    return;
  }

  logger.info("db.close.success", {
    layer: "db",
    module: "mockDb",
    action: "close",
    env: ENV,
  });
};

export const clearDatabase = async () => {
  if (isProduction) {
    try {
      const collections = Object.keys(mongoose.connection.collections);
      for (const name of collections) {
        await mongoose.connection.collections[name].deleteMany({});
      }

      logger.info("db.clear.success", {
        layer: "db",
        module: "mongodb",
        action: "clear",
        env: ENV,
        driver: "mongoose",
      });
    } catch (error) {
      logger.error("db.clear.failed", {
        layer: "db",
        module: "mongodb",
        action: "clear",
        env: ENV,
        driver: "mongoose",
        error,
        message: (error as any)?.message,
        stack: (error as any)?.stack,
      });
      throw error;
    }
    return;
  }

  logger.info("db.clear.success", {
    layer: "db",
    module: "mockDb",
    action: "clear",
    env: ENV,
  });
};