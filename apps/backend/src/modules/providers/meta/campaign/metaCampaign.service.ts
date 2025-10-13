import { prisma } from "@/db/db.js";
import type { AdAccount, Campaign as PrismaCampaign } from "@prisma/client";
import axios from "axios";
import type {
  createCampaignPayload,
  updateCampaingPayload,
} from "./types/metaCampaign.types.js";

// /src/modules/providers/meta/campaign/metaCampaign.service.ts

const META_API_VERSION = process.env.META_API_VERSION || "v18.0";
const META_GRAPH_BASE = `https://graph.facebook.com/${META_API_VERSION}`;

/**
 * Helper - call Meta Graph with account token
 */
async function metaRequest<T = any>(
  url: string,
  params: any = {},
  accessToken: string,
  method: "get" | "post" = "get"
) {
  const config = {
    method,
    url,
    params: { ...params, access_token: accessToken },
  };

  const resp = await axios.request<T>(config);
  return resp.data;
}

/**
 * Fetch campaigns from Meta for the given AdAccount, sync into DB (upsert).
 */
export async function fetchAndSyncCampaignsForAdAccount(adAccount: AdAccount) {
  const { providerAccountId, accessToken, id: adAccountId } = adAccount;

  const accountIdForApi = providerAccountId.startsWith("act_")
    ? providerAccountId
    : `act_${providerAccountId}`;

  const fields = [
    "id",
    "name",
    "status",
    "objective",
    "daily_budget",
    "lifetime_budget",
  ].join(",");

  const url = `${META_GRAPH_BASE}/${accountIdForApi}/campaigns`;

  const data = await metaRequest(
    url,
    { fields, limit: 500 },
    accessToken,
    "get"
  );

  const campaigns = data.data || [];

  const upserted: PrismaCampaign[] = [];

  for (const c of campaigns) {
    const budgetCents = c.daily_budget ?? c.lifetime_budget ?? null;
    const budget = budgetCents ? Number(budgetCents) / 100.0 : null;

    const upsertedCampaign = await prisma.campaign.upsert({
      where: { providerCampaignId: String(c.id) },
      update: {
        name: c.name,
        status: c.status,
        objective: c.objective,
        budget: budget ?? 0,
        updatedAt: new Date(),
        adAccountId: adAccountId,
      },
      create: {
        providerCampaignId: String(c.id),
        adAccountId: adAccountId,
        name: c.name,
        objective: c.objective,
        status: c.status as any,
        budget: budget ?? 0,
      },
    });

    upserted.push(upsertedCampaign);
  }

  return upserted;
}

/**
 * Create a campaign on Meta, then save the campaign in DB.
 */
export async function createCampaignOnMetaAndSave(
  payload: createCampaignPayload,
  adAccount: AdAccount
) {
  const { name, objective, status = "PAUSED", budget } = payload;
  const budgetCents = budget ? Math.round(budget * 100) : undefined;

  const accountIdForApi = adAccount.providerAccountId.startsWith("act_")
    ? adAccount.providerAccountId
    : `act_${adAccount.providerAccountId}`;
  const url = `${META_GRAPH_BASE}/${accountIdForApi}/campaigns`;

  const params: any = { name, objective, status };
  if (budgetCents !== undefined) {
    params.daily_budget = budgetCents;
  }

  const data = await metaRequest(url, params, adAccount.accessToken, "post");

  if (!data || !data.id) {
    throw new Error("Meta campaign creation returned no id");
  }

  const saved = await prisma.campaign.create({
    data: {
      providerCampaignId: String(data.id),
      adAccountId: adAccount.id,
      name,
      objective,
      status: status as any,
      budget: budget ?? 0,
    },
  });

  return saved;
}

/**
 * Update a campaign on Meta, then update local DB.
 */
export async function updateCampaignOnMetaAndSave(
  providerCampaignId: string,
  adAccount: AdAccount,
  updates: updateCampaingPayload
) {
  const params: any = {};
  if (updates.name !== undefined) params.name = updates.name;
  if (updates.objective !== undefined) params.objective = updates.objective;
  if (updates.status !== undefined) params.status = updates.status;
  if (updates.budget !== undefined)
    params.daily_budget = Math.round(updates.budget * 100);

  const url = `${META_GRAPH_BASE}/${providerCampaignId}`;

  const data = await metaRequest(url, params, adAccount.accessToken, "post");

  const dbUpdates: any = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.objective !== undefined) dbUpdates.objective = updates.objective;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.budget !== undefined) dbUpdates.budget = updates.budget;

  const updated = await prisma.campaign.update({
    where: { providerCampaignId },
    data: dbUpdates,
  });

  return updated;
}

/**
 * Fetch single campaign from DB (optionally refresh from Meta)
 */
export async function getCampaign(
  providerCampaignId: string,
  adAccount?: AdAccount,
  refreshFromMeta = false
) {
  if (refreshFromMeta && adAccount) {
    const url = `${META_GRAPH_BASE}/${providerCampaignId}`;
    const fields = [
      "id",
      "name",
      "status",
      "objective",
      "daily_budget",
      "lifetime_budget",
    ].join(",");
    const data = await metaRequest(
      url,
      { fields },
      adAccount.accessToken,
      "get"
    );

    const budgetCents = data.daily_budget ?? data.lifetime_budget ?? null;
    const budget = budgetCents ? Number(budgetCents) / 100.0 : null;
    const upserted = await prisma.campaign.upsert({
      where: { providerCampaignId: String(data.id) },
      update: {
        name: data.name,
        status: data.status,
        objective: data.objective,
        budget: budget ?? 0,
        updatedAt: new Date(),
      },
      create: {
        providerCampaignId: String(data.id),
        adAccountId: adAccount.id,
        name: data.name,
        objective: data.objective,
        status: data.status as any,
        budget: budget ?? 0,
      },
    });

    return upserted;
  }

  const campaign = await prisma.campaign.findUnique({
    where: { providerCampaignId },
  });

  return campaign;
}
