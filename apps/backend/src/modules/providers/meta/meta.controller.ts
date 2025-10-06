import type { Request, Response } from "express";
import { generateMetaAuthUrl, processMetaCallback } from "./meta.service.js";
import type { AuthRequest } from "@/types/auth-request.js";

// /src/modules/providers/meta/meta.controller.js
export const getMetaAuthUrl = (req: AuthRequest, res: Response) => {
  const url = generateMetaAuthUrl();
  return res.json({ url });
};

export const handleMetaCallback = async (req: AuthRequest, res: Response) => {
  const code = req.query.code as string;
  if (!code) return res.status(400).json({ message: "Code missing" });

  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ message: "Unauthorized: No user ID" });

  try {
    const { account } = await processMetaCallback(code, userId);
    return res.json({ message: "Meta account connected", account });
  } catch (error: any) {
    console.error(error.response?.data || error.message);
    return res.status(500).json({ message: "OAuth failed" });
  }
};
