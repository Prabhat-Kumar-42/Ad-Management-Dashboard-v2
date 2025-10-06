import { Router } from "express";
import { authRouter } from "./modules/auth/auth.route.js";

// /src/app.route.js
export const appRouter: Router = Router();

appRouter.use("/auth", authRouter);