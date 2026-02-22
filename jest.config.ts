export default {
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  testEnvironment: "node",
  testRegex: "/tests/.*\\.test\\.ts$",
  moduleFileExtensions: ["ts", "js", "json", "node"],
  collectCoverageFrom: ["src/**/*.{js,ts}", "!src/**/*.d.ts"],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"],

  setupFiles: ["<rootDir>/tests/jest.env.ts"],

  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
};