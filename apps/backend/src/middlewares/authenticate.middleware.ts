import type { Response, NextFunction } from "express";
import type { AuthRequest } from "@/types/auth-request.js";
import type { tokenalizedUserData } from "@/types/tokenalized-user-data.type.js";
import { verifyToken } from "@/utils/jwt.utils.js";

// /src/middlewares/authenticate.middleware.ts
export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = typeof authHeader === 'string' ? authHeader.split(" ")[1] : undefined;
  if (!token) return res.sendStatus(401);

  try {
    const payload = verifyToken(token);
    req.user = payload as tokenalizedUserData;
    next();
  } catch {
    return res.sendStatus(403);
  }
};
