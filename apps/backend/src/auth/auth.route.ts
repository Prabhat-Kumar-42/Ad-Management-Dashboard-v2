import { Router } from 'express';
import { authController } from './auth.controller.js';

// /src/auth/auth.route.js
export const authRouter: Router = Router();

authRouter.post('/register', authController.registerHandler);
authRouter.post('/login', authController.loginHandler);
authRouter.post('/refresh', authController.refreshHandler);
authRouter.post('/logout', authController.logoutHandler);
