import axios from "axios";
import { prisma } from "@/db/db.js";

// /src/modules/providers/meta/meta.service.js
export const generateMetaAuthUrl = () => {
  return `https://www.facebook.com/v18.0/dialog/oauth?client_id=${process.env.META_APP_ID}&redirect_uri=${process.env.META_REDIRECT_URI}&scope=ads_read,ads_management`;
};

export const processMetaCallback = async (code: string, userId: string) => {
  // Step 1: Exchange code for access token
  const tokenRes = await axios.get(`https://graph.facebook.com/v18.0/oauth/access_token`, {
    params: {
      client_id: process.env.META_APP_ID,
      client_secret: process.env.META_APP_SECRET,
      redirect_uri: process.env.META_REDIRECT_URI,
      code,
    },
  });

  const { access_token } = tokenRes.data;

  // Step 2: Fetch ad accounts
  const accountsRes = await axios.get(`https://graph.facebook.com/v18.0/me/adaccounts`, {
    params: { access_token },
  });

  const accounts = accountsRes.data.data;
  const account = accounts[0]; // For MVP, only first account

  // Step 3: Save to DB
  await prisma.adAccount.create({
    data: {
      provider: "META",
      providerAccountId: account.id,
      accessToken: access_token,
      userId,
    },
  });

  return { account };
};

export const fetchUserAccounts = async (userId: string) => {
  return prisma.adAccount.findMany({
    where: { userId },
  });
};


export const deauthMetaAccount = async (userId: string) => {
  const account = await prisma.adAccount.findFirst({
    where: { userId, provider: "META" },
  });

  if (!account) return null;

  try {
    // Revoke on Meta (requires a valid access token)
    await axios.delete(`https://graph.facebook.com/v18.0/me/permissions`, {
      params: { access_token: account.accessToken },
    });
  } catch (err: any) {
    console.warn("Meta token revoke failed (non-fatal):", err.message);
  }

  // Delete from DB
  await prisma.adAccount.deleteMany({
    where: { userId, provider: "META" },
  });

  return true;
};
