import { Router } from "express";
import { authRouter } from "./auth/auth.route.js";

// /src/app.route.js
export const appRouter: Router = Router();

appRouter.use("/auth", authRouter);