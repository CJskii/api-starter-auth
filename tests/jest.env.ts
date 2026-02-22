// Ensure logging is quiet in tests by default
process.env.LOG_PROFILE = process.env.LOG_PROFILE ?? "test";

// Silence dotenv console tips (dotenv respects this env var)
process.env.DOTENV_CONFIG_QUIET = process.env.DOTENV_CONFIG_QUIET ?? "true";
