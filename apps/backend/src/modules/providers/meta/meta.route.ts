import { Router } from "express";
import { getMetaAuthUrl, handleMetaCallback } from "./meta.controller.js";
import { authMiddleware } from "@/middlewares/authenticate.middleware.js";

// /src/modules/providers/meta/meta.route.ts
const metaRouter: Router = Router();

metaRouter.get("/auth/url", authMiddleware, getMetaAuthUrl);
metaRouter.get("/callback", authMiddleware, handleMetaCallback);

export { metaRouter };
