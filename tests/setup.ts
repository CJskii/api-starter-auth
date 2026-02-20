import { connect, closeDatabase, clearDatabase } from '../src/mongodb/mongo-mock';
import { beforeAll, afterEach, afterAll } from '@jest/globals';

// Connect to database before all tests
beforeAll(async () => {
  await connect();
  await clearDatabase();
});

// Clear database after each test
afterEach(async () => {
  await clearDatabase();
});

// Close database connection after all tests
afterAll(async () => {
  await closeDatabase();
});
