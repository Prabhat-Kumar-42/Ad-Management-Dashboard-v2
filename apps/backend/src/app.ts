import express, { type Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { appRouter } from './app.route.js';
import { nonExistingRoutesErrorHandler } from './error-handlers/non-existing-routes.error-handler.js';
import { jwtErrorHandler } from './error-handlers/jwt.error-handler.js';
import { globalErrorHandler } from './error-handlers/global.error-handler.js';

// /src/app.ts
dotenv.config();

export const app: Express = express();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api', appRouter);

/* debug, ednpoint, will delete this in future

// Handle requests to /.well-known (harmless but causing 404)
app.use('/.well-known', (req, res) => {
  console.log("Ignored .well-known request:", req.originalUrl);
  res.status(404).send("Not found");
});

*/

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

//error-handlers
app.use(nonExistingRoutesErrorHandler);
app.use(jwtErrorHandler);
app.use(globalErrorHandler);
