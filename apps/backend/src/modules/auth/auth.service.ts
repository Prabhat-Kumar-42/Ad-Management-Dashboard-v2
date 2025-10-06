import bcrypt from "bcrypt";
import { prisma } from "@/db/db.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "@/utils/jwt.utils.js";
import { userDataSanitize } from "@/utils/data-model-sanitize.utils.js";
import { BadRequestError, UnauthorizedError } from "@/utils/http-errors.utils.js";

// /src/modules/auth/auth.service.js
export const authService = {
  register: async function (name: string, email: string, password: string) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new BadRequestError("Email already exists");

    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { name, email, passwordHash: hash } });

    return userDataSanitize(user); 
  },

  login: async function (email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedError("Invalid credentials");

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedError("Invalid credentials");

    const accessToken = generateAccessToken(user.id, user.email);
    const { refreshToken, expiresAt } = generateRefreshToken();
    
    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt },
    });

    return { accessToken, refreshToken, user: userDataSanitize(user) }; 
  },

  refresh: async function (token: string) {
    const existing = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!existing || existing.expiresAt < new Date()) {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    const user = existing.user;
    await prisma.refreshToken.delete({ where: { token } });

    const { refreshToken, expiresAt } = generateRefreshToken();
    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt },
    });

    const accessToken = generateAccessToken(user.id, user.email);

    return { accessToken, refreshToken, user: userDataSanitize(user) }; 
  },

  logout: async function (token: string) {
    const result = await prisma.refreshToken.deleteMany({ where: { token } });
    return result.count > 0;
  },
};
