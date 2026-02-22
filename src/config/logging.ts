import dotenv from "dotenv";
dotenv.config({ quiet: true });
import { logger } from "../utils/index";

type LogProfile = "prod" | "info" | "verbose" | "test";

export function normalizeProfile(p?: string): LogProfile {
  const allowed: LogProfile[] = ["prod", "info", "verbose", "test"];

  if (!p) return "info";

  const v = p.toLowerCase().trim() as LogProfile;

  return allowed.includes(v) ? v : "info";
}

export const loggingConfig = (() => {
  const profile = normalizeProfile(process.env.LOG_PROFILE);

  logger.info("logging.profile", {
    layer: "app",
    module: "logging",
    action: "init",
    profile,
  });

  const profiles: Record<
    LogProfile,
    {
      httpStart: boolean;
      httpEnd: boolean;
      logHttp4xx: boolean;
      logHttp5xx: boolean;
      validation: boolean;
      stackFor4xx: boolean;
      stackFor5xx: boolean;
    }
  > = {
    prod: {
      httpStart: false,
      httpEnd: true,
      logHttp4xx: false,
      logHttp5xx: true,
      validation: false,
      stackFor4xx: false,
      stackFor5xx: true,
    },
    info: {
      httpStart: false,
      httpEnd: true,
      logHttp4xx: false,
      logHttp5xx: true,
      validation: false,
      stackFor4xx: false,
      stackFor5xx: true,
    },
    verbose: {
      httpStart: true,
      httpEnd: true,
      logHttp4xx: true,
      logHttp5xx: true,
      validation: true,
      stackFor4xx: false,
      stackFor5xx: true,
    },
    test: {
      httpStart: false,
      httpEnd: false,
      logHttp4xx: false,
      logHttp5xx: true,
      validation: false,
      stackFor4xx: false,
      stackFor5xx: true,
    },
  };

  return {
    profile,
    ...profiles[profile],
  };
})();
