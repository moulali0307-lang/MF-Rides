import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validateBody } from "../../middleware/validate.js";
import * as authController from "./auth.controller.js";
import { loginSchema, registerSchema } from "./auth.schema.js";

export const authRouter = Router();

authRouter.post("/register", validateBody(registerSchema), asyncHandler(authController.register));
authRouter.post("/login", validateBody(loginSchema), asyncHandler(authController.login));
authRouter.get("/me", requireAuth, asyncHandler(authController.me));
