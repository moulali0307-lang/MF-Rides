import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { requireRole } from "../../middleware/requireRole.js";
import { validateBody } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as userController from "./user.controller.js";
import { setOnlineStatusSchema } from "./user.schema.js";

export const userRouter = Router();

userRouter.patch(
  "/me/online-status",
  requireAuth,
  requireRole("PARTNER"),
  validateBody(setOnlineStatusSchema),
  asyncHandler(userController.setOnlineStatus),
);
