import type { Request } from "express";
import type { tokenalizedUserData } from "./tokenalized-user-data.type.js";

// /src/types/AuthRequest.ts
export interface AuthRequest extends Request {
  user?: { id: string };
}
