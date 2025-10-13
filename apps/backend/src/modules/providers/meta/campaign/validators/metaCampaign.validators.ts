import { CampaignStatus } from "@prisma/client";
import { z } from "zod";

// /src/modules/providers/meta/campaign/validators/metaCampaign.validators.ts
export const getCampaignsSchema = z.object({
  adAccountId: z.string().optional(),
});

export const providerCampaignIdParamSchema = z.object({
  providerCampaignId: z.string().min(1, "Provider campaign ID is required"),
});

export const createCampaignSchema = z.object({
  adAccountId: z.string().min(1, "adAccountId is required"),
  name: z.string().min(1, "name is required"),
  objective: z.string().min(1, "objective is required"),
  status: z.enum(CampaignStatus).optional(),
  budget: z.number(), // in dollars (frontend uses dollars, backend uses cents)
});

export const updateCampaignSchema = z.object({
  name: z.string().optional(),
  objective: z.string().optional(),
  status: z.enum(CampaignStatus).optional(),
  budget: z.number().optional(),
});

