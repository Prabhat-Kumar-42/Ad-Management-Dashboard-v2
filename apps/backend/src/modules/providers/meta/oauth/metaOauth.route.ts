import { Router } from "express";
import { disconnectMetaAccount, getAccounts, getMetaAuthUrl, handleMetaCallback } from "./metaOAuth.controller.js";
import { authMiddleware } from "@/middlewares/authenticate.middleware.js";

// /src/modules/providers/meta/oauth/metaOauth.route.js
export const metaOauthConnectRouter: Router = Router();

metaOauthConnectRouter.get("/auth/url", authMiddleware, getMetaAuthUrl);
metaOauthConnectRouter.get("/callback", authMiddleware, handleMetaCallback);
metaOauthConnectRouter.get("/accounts", authMiddleware, getAccounts);
metaOauthConnectRouter.delete("/deauth", authMiddleware, disconnectMetaAccount);