import type z from "zod";
import type { loginSchema, registerSchema } from "../validators/auth.validators.js";

// /src/types/auth.types.js
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;