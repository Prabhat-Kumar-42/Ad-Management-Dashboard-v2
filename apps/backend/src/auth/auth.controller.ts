import type { Request, Response } from "express";
import { authService } from "./auth.service.js";
import {
  loginSchema,
  registerSchema,
} from "@repo/validators-and-types/validators/auth.validators";

// /src/auth/auth.controller.js
export const authController = {
  registerHandler: async (req: Request, res: Response) => {
    try {
      const result = registerSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.format() });
      }

      const { name, email, password } = result.data;
      const user = await authService.register(name, email, password);

      res.json({
        user: { id: user.id, email: user.email, name: user.name },
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  loginHandler: async (req: Request, res: Response) => {
    try {
      const result = loginSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.format() });
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
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  refreshHandler: async (req: Request, res: Response) => {
    try {
      const token = req.cookies["refreshToken"];
      if (!token || typeof token !== "string")
        return res.status(401).json({ error: "No refresh token" });
      const { accessToken, refreshToken, user } =
        await authService.refresh(token);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.json({ accessToken, user });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  logoutHandler: async (req: Request, res: Response) => {
    try {
      const token = req.cookies["refreshToken"];

      if (!token || typeof token !== "string") {
        return res
          .status(400)
          .json({ error: "Missing or invalid refresh token" });
      }

      if (token) await authService.logout(token);
      res.clearCookie("refreshToken");
      res.json({ ok: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },
};
