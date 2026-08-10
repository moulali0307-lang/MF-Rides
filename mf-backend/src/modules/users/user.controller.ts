import type { Request, Response } from "express";
import { prisma } from "../../db/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { createUserService } from "./user.service.js";
import type { SetOnlineStatusInput } from "./user.schema.js";

const userService = createUserService(prisma);

export async function setOnlineStatus(req: Request, res: Response) {
  if (!req.auth) {
    throw new AppError("Authentication required", 401);
  }
  const { isOnline } = req.body as SetOnlineStatusInput;
  const user = await userService.setOnlineStatus(req.auth.userId, isOnline);
  res.status(200).json({ success: true, data: { user } });
}
