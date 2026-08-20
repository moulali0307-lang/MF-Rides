import type { Request, Response } from "express";

import { prisma } from "../../db/prisma.js";
import { AppError } from "../../utils/AppError.js";

import { createAuthService } from "./auth.service.js";

import type {
  AdminForgotPasswordInput,
  AdminLoginInput,
  AdminRegisterInput,
  AdminResetPasswordInput,
  AdminVerifyOtpInput,
  LoginInput,
  RegisterInput,
} from "./auth.schema.js";

const authService = createAuthService(prisma);

/* =========================================================
   PUBLIC RIDER / PARTNER REGISTER
   ========================================================= */

export async function register(req: Request, res: Response) {
  const input = req.body as RegisterInput;

  const result = await authService.register(input);

  res.status(201).json({
    success: true,
    data: result,
  });
}

/* =========================================================
   PUBLIC RIDER / PARTNER LOGIN
   ========================================================= */

export async function login(req: Request, res: Response) {
  const input = req.body as LoginInput;

  const result = await authService.login(input);

  res.status(200).json({
    success: true,
    data: result,
  });
}

/* =========================================================
   CURRENT USER
   ========================================================= */

export async function me(req: Request, res: Response) {
  if (!req.auth) {
    throw new AppError("Authentication required", 401);
  }

  const user = await authService.me(req.auth.userId);

  res.status(200).json({
    success: true,
    data: {
      user,
    },
  });
}

/* =========================================================
   ADMIN CREATE ACCOUNT
   ========================================================= */

export async function adminRegister(req: Request, res: Response) {
  const input = req.body as AdminRegisterInput;

  const result = await authService.adminRegister(input);

  res.status(201).json({
    success: true,
    data: result,
  });
}

/* =========================================================
   ADMIN REGISTRATION OTP
   ========================================================= */

export async function verifyAdminRegistrationOtp(
  req: Request,
  res: Response,
) {
  const input = req.body as AdminVerifyOtpInput;

  const result =
    await authService.verifyAdminRegistrationOtp(input);

  res.status(200).json({
    success: true,
    data: result,
  });
}

/* =========================================================
   ADMIN LOGIN
   ========================================================= */

export async function adminLogin(req: Request, res: Response) {
  const input = req.body as AdminLoginInput;

  const result = await authService.adminLogin(input);

  res.status(200).json({
    success: true,
    data: result,
  });
}

/* =========================================================
   ADMIN LOGIN OTP
   ========================================================= */

export async function verifyAdminLoginOtp(
  req: Request,
  res: Response,
) {
  const input = req.body as AdminVerifyOtpInput;

  const result = await authService.verifyAdminLoginOtp(input);

  res.status(200).json({
    success: true,
    data: result,
  });
}

/* =========================================================
   ADMIN FORGOT PASSWORD
   ========================================================= */

export async function adminForgotPassword(
  req: Request,
  res: Response,
) {
  const input = req.body as AdminForgotPasswordInput;

  const result =
    await authService.adminForgotPassword(input);

  res.status(200).json({
    success: true,
    data: result,
  });
}

/* =========================================================
   ADMIN RESET PASSWORD
   ========================================================= */

export async function adminResetPassword(
  req: Request,
  res: Response,
) {
  const input = req.body as AdminResetPasswordInput;

  const result =
    await authService.adminResetPassword(input);

  res.status(200).json({
    success: true,
    data: result,
  });
}