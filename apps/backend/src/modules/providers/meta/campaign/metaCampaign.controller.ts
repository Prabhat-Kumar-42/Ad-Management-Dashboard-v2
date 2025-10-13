import { z } from "zod";
import type { AuthRequest } from "@/types/auth-request.js";
import {
  fetchAndSyncCampaignsForAdAccount,
  createCampaignOnMetaAndSave,
  updateCampaignOnMetaAndSave,
  getCampaign,
} from "./metaCampaign.service.js";
import { prisma } from "@/db/db.js";
import type { Response } from "express";
import {
  createCampaignSchema,
  getCampaignsSchema,
  updateCampaignSchema,
  providerCampaignIdParamSchema,
} from "./validators/metaCampaign.validators.js";
import type { updateCampaingPayload } from "./types/metaCampaign.types.js";

// /src/modules/providers/meta/campaign/metaCampaign.controller.js
export const getMetaCampaigns = async (req: AuthRequest, res: Response) => {
  try {
    const query = getCampaignsSchema.parse(req.query);

    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    let adAccount;
    if (query.adAccountId) {
      adAccount = await prisma.adAccount.findFirst({
        where: { id: query.adAccountId, userId },
      });
    } else {
      adAccount = await prisma.adAccount.findFirst({ where: { userId } });
    }

    if (!adAccount)
      return res
        .status(404)
        .json({ message: "No connected ad account found for user" });

    const synced = await fetchAndSyncCampaignsForAdAccount(adAccount);
    return res.json(synced);
  } catch (err: any) {
    console.error(
      "GET /meta/campaigns error:",
      err.response?.data || err.message || err
    );
    const status = err.response?.status || 500;
    return res
      .status(status)
      .json({ message: err.response?.data || err.message });
  }
};

export const createMetaCampaign = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const body = createCampaignSchema.parse(req.body);

    const { adAccountId, name, objective, status, budget } = body;

    const adAccount = await prisma.adAccount.findUnique({
      where: { id: adAccountId },
    });
    if (!adAccount || adAccount.userId !== userId)
      return res
        .status(404)
        .json({ message: "AdAccount not found or not owned by user" });

    const created = await createCampaignOnMetaAndSave(
      {
        adAccountId: adAccount.providerAccountId,
        name,
        objective,
        status,
        budget,
      },
      adAccount
    );
    return res.status(201).json(created);
  } catch (err: any) {
    console.error(
      "POST /meta/campaigns error:",
      err.response?.data || err.message || err
    );
    const status = err.response?.status || 500;
    return res
      .status(status)
      .json({ message: err.response?.data || err.message });
  }
};

export const updateMetaCampaign = async (req: AuthRequest, res: Response) => {
  try {
    const params = providerCampaignIdParamSchema.parse(req.params);
    const updates: updateCampaingPayload = updateCampaignSchema.parse(req.body);

    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const providerCampaignId = params.providerCampaignId;

    const local = await prisma.campaign.findUnique({
      where: { providerCampaignId },
    });
    if (!local) return res.status(404).json({ message: "Campaign not found" });

    const adAccount = await prisma.adAccount.findUnique({
      where: { id: local.adAccountId },
    });
    if (!adAccount || adAccount.userId !== userId)
      return res
        .status(404)
        .json({ message: "AdAccount not found or not owned by user" });

    const updated = await updateCampaignOnMetaAndSave(
      providerCampaignId,
      adAccount,
      updates
    );
    return res.json(updated);
  } catch (err: any) {
    console.error(
      "PATCH /meta/campaigns error:",
      err.response?.data || err.message || err
    );
    const status = err.response?.status || 500;
    return res
      .status(status)
      .json({ message: err.response?.data || err.message });
  }
};

export const getCampaignById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const params = providerCampaignIdParamSchema.parse(req.params);

    const providerCampaignId = params.providerCampaignId;
    const refresh = req.query.refresh === "true";

    const local = await prisma.campaign.findUnique({
      where: { providerCampaignId },
    });
    if (!local) return res.status(404).json({ message: "Campaign not found" });

    const adAccount = await prisma.adAccount.findUnique({
      where: { id: local.adAccountId },
    });
    if (!adAccount || adAccount.userId !== userId)
      return res
        .status(404)
        .json({ message: "AdAccount not found or not owned by user" });

    const campaign = await getCampaign(providerCampaignId, adAccount, refresh);
    return res.json(campaign);
  } catch (err: any) {
    console.error(
      "GET /meta/campaigns/:id error:",
      err.response?.data || err.message || err
    );
    const status = err.response?.status || 500;
    return res
      .status(status)
      .json({ message: err.response?.data || err.message });
  }
};
