import type { Request } from "express";
import type { tokenalizedUserData } from "./tokenalizedUserData.type.js";

// /src/types/AuthRequest.ts
export class AuthRequest extends Request {
  user?: tokenalizedUserData;
}
