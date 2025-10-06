import type { User } from "@prisma/client";

// /src/types/sanitizedModel.types.js
export type sanitizedUser = Omit<User, "passwordHash">;