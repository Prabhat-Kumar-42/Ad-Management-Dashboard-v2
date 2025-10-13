import { Router } from "express";
import { metaOauthConnectRouter } from "./oauth/metaOauth.route.js";
import { metaCampaignRouter } from "./campaign/metaCampaign.route.js";

// /src/modules/providers/meta/meta.route.js
export const metaRouter: Router = Router();

metaRouter.use('/', metaOauthConnectRouter);
metaRouter.use('/campaigns', metaCampaignRouter);