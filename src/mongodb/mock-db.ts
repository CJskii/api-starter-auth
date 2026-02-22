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

function wrapDoc(user: User) {
  // create a mutable doc copy
  const doc: any = { ...user };

  doc.save = async () => {
    const idx = users.findIndex((u) => u._id === doc._id);

    const persisted: User = {
      _id: doc._id,
      name: doc.name,
      email: doc.email,
      age: doc.age,
      password: doc.password,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };

    if (idx === -1) {
      users.push(persisted);
    } else {
      users[idx] = persisted;
    }

    return doc; // emulate mongoose returning the doc
  };

  doc.toObject = () => {
    const { save, toObject, ...plain } = doc;
    return { ...plain };
  };

  return doc;
}

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

    if (projection?.password === 0) {
      const { password, ...rest } = user;
      return { ...rest } as any;
    }

    return wrapDoc(user);
  },

  findOne: async (filter: any, projection: any = {}) => {
    const user = users.find((u) => {
      if (filter.email && u.email === filter.email) return true;
      if (filter._id && u._id === filter._id) return true;
      return false;
    });

    if (!user) return null;

    if (projection?.password === 0) {
      const { password, ...rest } = user;
      return { ...rest } as any;
    }

    return wrapDoc(user);
  },

  findByIdAndDelete: async (id: string) => {
    const index = users.findIndex((u) => u._id === id);
    if (index === -1) return null;

    const deletedUser = users[index];
    users.splice(index, 1);
    return deletedUser;
  },

  create: async (user: User | any) => {
    if (!user._id) user._id = require("crypto").randomUUID();

    const newUser: User = {
      _id: user._id,
      name: user.name,
      email: user.email,
      age: user.age,
      password: user.password,
      createdAt: user.createdAt ?? new Date(),
      updatedAt: user.updatedAt ?? new Date(),
    };

    users.push(newUser);
    return wrapDoc(newUser);
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

  async deleteOne(filter: any) {
    const id = filter?._id?.toString?.() ?? filter?._id ?? null;
    if (!id) return { deletedCount: 0 };

    const idx = users.findIndex((u) => String(u._id) === String(id));
    if (idx === -1) return { deletedCount: 0 };

    users.splice(idx, 1);
    return { deletedCount: 1 };
  },
};

export { mockDatabase, closeMockDatabase, clearMockDatabase, mockUserModel, users, wrapDoc };
