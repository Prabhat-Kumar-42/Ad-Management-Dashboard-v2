import { Router, type Request, type Response } from "express";
import { authMiddleware } from "@/middlewares/authenticate.middleware.js";
import {
  createMetaCampaign,
  getCampaignById,
  getMetaCampaigns,
  updateMetaCampaign,
} from "./metaCampaign.controller.js";

// /src/modules/providers/meta/campaign/metaCampaign.route.js

export const metaCampaignRouter: Router = Router();

/**
 * GET /api/meta/campaigns
 * Query: adAccountId (our AdAccount.id) - optional; if not provided, find first ad account for user
 */
metaCampaignRouter.get("/", authMiddleware, getMetaCampaigns);

/**
 * POST /api/meta/campaigns
 * Body: { adAccountId (our AdAccount.id), name, objective, status, budget }
 */
metaCampaignRouter.post("/", authMiddleware, createMetaCampaign);

/**
 * PATCH /api/meta/campaigns/:providerCampaignId
 * Body: partial updates { name?, objective?, status?, budget? }
 */
metaCampaignRouter.patch(
  "/:providerCampaignId",
  authMiddleware,
  updateMetaCampaign
);

/**
 * GET /api/meta/campaigns/:providerCampaignId
 * Query param: refresh=true to fetch fresh from Meta and upsert
 */
metaCampaignRouter.get(
  "/:providerCampaignId",
  authMiddleware,
  getCampaignById
);
