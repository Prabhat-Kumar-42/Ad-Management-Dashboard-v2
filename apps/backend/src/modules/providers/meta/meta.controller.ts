import type { Request, Response } from "express";
import {
  deauthMetaAccount,
  fetchUserAccounts,
  generateMetaAuthUrl,
  processMetaCallback,
} from "./meta.service.js";
import type { AuthRequest } from "@/types/auth-request.js";
import {
  BadRequestError,
  UnauthorizedError,
} from "@/utils/http-errors.utils.js";

// /src/modules/providers/meta/meta.controller.js
export const getMetaAuthUrl = (req: AuthRequest, res: Response) => {
  const url = generateMetaAuthUrl();
  return res.json({ url });
};

export const handleMetaCallback = async (req: AuthRequest, res: Response) => {
  const code = req.query.code as string;
  if (!code) throw new BadRequestError("Code missing");

  const userId = req.user?.userId;
  if (!userId) throw new UnauthorizedError();

  const { account } = await processMetaCallback(code, userId);
  return res.json({ message: "Meta account connected", account });
};

// New controller function for /accounts
export const getAccounts = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) throw new UnauthorizedError();

  const accounts = await fetchUserAccounts(userId);
  return res.json(accounts);
};


// 🆕 New: Disconnect Meta Account
export const disconnectMetaAccount = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) throw new UnauthorizedError();

  const success = await deauthMetaAccount(userId);
  if (!success) return res.status(404).json({ message: "No Meta account found" });

  return res.json({ message: "Meta account disconnected successfully" });
};

