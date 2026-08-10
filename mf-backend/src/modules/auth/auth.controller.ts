import type { Request, Response } from "express";
import { prisma } from "../../db/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { createAuthService } from "./auth.service.js";
import type { LoginInput, RegisterInput } from "./auth.schema.js";

const authService = createAuthService(prisma);

export async function register(req: Request, res: Response) {
  const input = req.body as RegisterInput;
  const result = await authService.register(input);
  res.status(201).json({ success: true, data: result });
}

export async function login(req: Request, res: Response) {
  const input = req.body as LoginInput;
  const result = await authService.login(input);
  res.status(200).json({ success: true, data: result });
}

export async function me(req: Request, res: Response) {
  if (!req.auth) {
    throw new AppError("Authentication required", 401);
  }
  const user = await authService.me(req.auth.userId);
  res.status(200).json({ success: true, data: { user } });
}
