import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

// /src/utils/jwt.utils.js
const JWT_SECRET = process.env.JWT_SECRET || "secret";

export const generateAccessToken = (userId: string, email: string) => {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: "15m" });
};

export const generateRefreshToken = () : { refreshToken: string, expiresAt: Date } => {
  const refreshToken = uuidv4();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);
  return { refreshToken, expiresAt };
};

export const verifyToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded; 
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};
