import type { User } from "@prisma/client";
import type { sanitizedUser } from "@/types/sanitizedModel.types.js";

// /src/utils/dataModelSanitize.utils.js
export function userDataSanitize(user: User): sanitizedUser {
  const { passwordHash, ...userDto } = user;
  return userDto;
}
