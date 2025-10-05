import type { Request, Response, NextFunction } from "express";
import type { AuthRequest } from "../types/AuthRequest.js";
import type { tokenalizedUserData } from "../types/tokenalizedUserData.type.js";
import { verifyToken } from "../utils/jwt.utils.js";

// /src/middlewares/authenticate.middleware.ts
export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);

  try {
    const payload = verifyToken(token);
    req.user = payload as tokenalizedUserData;
    next();
  } catch {
    return res.sendStatus(403);
  }
}
