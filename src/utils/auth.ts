import jwt from "jsonwebtoken";

export function generateToken(user: any) {
  // In a real app, use a secure secret and consider token expiration
  const secret = process.env.JWT_SECRET ? process.env.JWT_SECRET : "default_secret_key";
  return jwt.sign({ id: user._id, email: user.email }, secret, {
    expiresIn: "24h",
  });
}
