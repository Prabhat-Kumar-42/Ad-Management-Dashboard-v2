import type { Request, Response } from "express";
import { authService } from "./auth.service.js";
import {
  loginSchema,
  registerSchema,
} from "@repo/validators-and-types/validators/auth.validators";
import z from "zod";
import {
  BadRequestError,
  UnauthorizedError,
} from "@/utils/http-errors.utils.js";

// /src/modules/auth/auth.controller.js
export const authController = {
  registerHandler: async (req: Request, res: Response) => {
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
      throw new BadRequestError(
        "Validation error",
        z.treeifyError(result.error)
      );
    }

    const { name, email, password } = result.data;
    const user = await authService.register(name, email, password);

    res.json({
      user: { id: user.id, email: user.email, name: user.name },
    });
  },

  loginHandler: async (req: Request, res: Response) => {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      throw new BadRequestError(
        "Validation error",
        z.treeifyError(result.error)
      );
    }

    const { email, password } = result.data;
    const { accessToken, refreshToken, user } = await authService.login(
      email,
      password
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({
      accessToken,
      user: { id: user.id, email: user.email, name: user.name },
    });
  },

  refreshHandler: async (req: Request, res: Response) => {
    const token = req.cookies["refreshToken"];
    if (!token || typeof token !== "string")
      throw new UnauthorizedError("Invalid or expired refresh token");
    const { accessToken, refreshToken, user } =
      await authService.refresh(token);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken, user });
  },

  logoutHandler: async (req: Request, res: Response) => {
    const token = req.cookies["refreshToken"];

    if (!token || typeof token !== "string") {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    await authService.logout(token);
    res.clearCookie("refreshToken");
    res.json({ ok: true });
  },
};
