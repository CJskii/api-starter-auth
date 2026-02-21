// Mock database implementation for development
// This simulates MongoDB behavior without requiring a real database connection

interface User {
  _id: string;
  name: string;
  email: string;
  age?: number;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory storage
let users: User[] = [];
let initialized = false;

const mockDatabase = async () => {
  if (!initialized) {
    users = [];
    initialized = true;
  }
};

const closeMockDatabase = async () => {
  users = [];
  initialized = false;
};

const clearMockDatabase = async () => {
  users = [];
};

// Helper functions to simulate MongoDB operations
const mockUserModel = {
  find: async (filter: any = {}, projection: any = {}) => {
    let result = [...users];

    // Simple projection handling (exclude password if requested)
    if (projection.password === 0) {
      result = result.map((user) => {
        const { password, ...rest } = user;
        return rest;
      }) as any;
    }

    return result as any;
  },

  findById: async (id: string, projection: any = {}) => {
    const user = users.find((u) => u._id === id);

    if (!user) return null;

    // Simple projection handling
    if (projection.password === 0) {
      const { password, ...rest } = user;
      return rest;
    }

    return user;
  },

  findOne: async (filter: any, projection: any = {}) => {
    const user = users.find((u) => {
      if (filter.email && u.email === filter.email) {
        return true;
      }
      return false;
    });

    if (!user) return null;

    // Simple projection handling
    if (projection.password === 0) {
      const { password, ...rest } = user;
      return rest;
    }

    return user;
  },

  findByIdAndDelete: async (id: string) => {
    const index = users.findIndex((u) => u._id === id);
    if (index === -1) return null;

    const deletedUser = users[index];
    users.splice(index, 1);
    return deletedUser;
  },

  create: async (user: User | any) => {
    // Generate _id if not present (for new users)
    if (!user._id) {
      user._id = require("crypto").randomUUID();
    }

    // Add new user
    users.push(user);
    return user;
  },

  save: async (user: User | any) => {
    const existingIndex = users.findIndex((u) => u._id === user._id);

    if (existingIndex !== -1) {
      // Update existing user
      users[existingIndex] = user;
    } else {
      // Add new user
      users.push(user);
    }

    return user;
  },
};

export { mockDatabase, closeMockDatabase, clearMockDatabase, mockUserModel, users };
