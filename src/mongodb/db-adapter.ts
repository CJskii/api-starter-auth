export const dbAdapter = {
  async updateUser(user: any, updateData: any) {
    if (typeof user.save === "function") {
      Object.assign(user, updateData);
      return await user.save();
    } else {
      return { ...user, ...updateData };
    }
  },
  
  async deleteUser(id: string) {
    // In production, this would delete from MongoDB
    // In development/test, this is a mock implementation
    if (typeof id === "string") {
      // Mock implementation - in real scenario, this would be a database operation
      return Promise.resolve();
    }
  }
};
