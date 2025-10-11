import { Router } from "express";
import { disconnectMetaAccount, getAccounts, getMetaAuthUrl, handleMetaCallback } from "./meta.controller.js";
import { authMiddleware } from "@/middlewares/authenticate.middleware.js";

// /src/modules/providers/meta/meta.route.ts
export const metaRouter: Router = Router();

metaRouter.get("/auth/url", authMiddleware, getMetaAuthUrl);
metaRouter.get("/callback", authMiddleware, handleMetaCallback);
metaRouter.get("/accounts", authMiddleware, getAccounts);
metaRouter.delete("/deauth", authMiddleware, disconnectMetaAccount);
