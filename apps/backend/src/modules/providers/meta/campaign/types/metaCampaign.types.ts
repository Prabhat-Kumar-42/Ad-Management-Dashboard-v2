import { z } from "zod";
import type {
  createCampaignSchema,
  updateCampaignSchema,
} from "../validators/metaCampaign.validators.js";

// /src/modules/providers/meta/campaign/types/metaCampaign.types.ts
export type updateCampaingPayload = z.infer<typeof updateCampaignSchema>;
export type createCampaignPayload = z.infer<typeof createCampaignSchema>;
