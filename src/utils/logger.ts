import winston from "winston";

type LogProfile = "prod" | "info" | "verbose" | "test";

function normalizeProfile(p?: string): LogProfile {
  const v = (p ?? "info").toLowerCase().trim();

  if (v === "production") return "prod";
  if (v === "dev" || v === "debug") return "verbose";
  if (v === "quiet") return "test";

  if (v === "prod" || v === "info" || v === "verbose" || v === "test") return v;
  return "info";
}

const profile = normalizeProfile(process.env.LOG_PROFILE);

// Map profile -> winston level
// - prod/info: info
// - verbose: debug
// - test: warn (quiet by default)
const level: winston.LoggerOptions["level"] = profile === "verbose" ? "debug" : profile === "test" ? "warn" : "info";

const isHumanReadable = profile === "verbose";

const baseFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

const consoleFormat = isHumanReadable
  ? winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp(),
      winston.format.printf((info) => {
        const msg = info.message ?? "";
        const meta = { ...info };
        delete (meta as any).message;
        delete (meta as any).level;
        delete (meta as any).timestamp;

        const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
        return `${info.timestamp} ${info.level}: ${msg}${metaStr}`;
      }),
    )
  : baseFormat;

export const logger = winston.createLogger({
  level,
  format: baseFormat,
  defaultMeta: { service: "user-api", logProfile: profile },
  transports: [
    new winston.transports.Console({
      format: consoleFormat,
      // In test profile, you can also silence warnings if you want:
      // silent: profile === "test",
    }),
  ],
});