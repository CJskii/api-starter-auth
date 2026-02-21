import { connect, clearDatabase } from "../src/mongodb/db";

// Clear database before all tests
beforeAll(async () => {
  await connect();
  await clearDatabase();
});

// Clear database after all tests
afterAll(async () => {
  await clearDatabase();
});
