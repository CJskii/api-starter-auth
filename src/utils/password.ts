import bcrypt from "bcrypt";

// Helper function to hash passwords
const hashPassword = (password: string): string => {
  const saltRounds = 10;
  return bcrypt.hashSync(password, saltRounds);
};

// Helper function to compare passwords
const comparePassword = (password: string, hash: string): boolean => {
  return bcrypt.compareSync(password, hash);
};

export { hashPassword, comparePassword };
