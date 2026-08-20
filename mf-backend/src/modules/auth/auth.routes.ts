import { Router } from "express";

import { requireAuth } from "../../middleware/auth.middleware.js";
import { validateBody } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

import * as authController from "./auth.controller.js";

import {
  adminForgotPasswordSchema,
  adminLoginSchema,
  adminRegisterSchema,
  adminResetPasswordSchema,
  adminVerifyOtpSchema,
  loginSchema,
  registerSchema,
} from "./auth.schema.js";

export const authRouter = Router();

/* =========================================================
   PUBLIC RIDER / PARTNER AUTH
   ========================================================= */

authRouter.post(
  "/register",
  validateBody(registerSchema),
  asyncHandler(authController.register),
);

authRouter.post(
  "/login",
  validateBody(loginSchema),
  asyncHandler(authController.login),
);

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(authController.me),
);


/* =========================================================
   ADMIN CREATE ACCOUNT
   ========================================================= */

// Create admin account
// Sends registration OTP to admin email.
authRouter.post(
  "/admin/register",
  validateBody(adminRegisterSchema),
  asyncHandler(authController.adminRegister),
);


// Verify registration OTP
authRouter.post(
  "/admin/register/verify-otp",
  validateBody(adminVerifyOtpSchema),
  asyncHandler(authController.verifyAdminRegistrationOtp),
);


/* =========================================================
   ADMIN LOGIN
   ========================================================= */

// Password verification.
// If correct, sends OTP to admin email.
authRouter.post(
  "/admin/login",
  validateBody(adminLoginSchema),
  asyncHandler(authController.adminLogin),
);


// Verify login OTP.
// Successful verification returns JWT.
authRouter.post(
  "/admin/login/verify-otp",
  validateBody(adminVerifyOtpSchema),
  asyncHandler(authController.verifyAdminLoginOtp),
);


/* =========================================================
   ADMIN FORGOT PASSWORD
   ========================================================= */

// Send password-reset OTP.
authRouter.post(
  "/admin/forgot-password",
  validateBody(adminForgotPasswordSchema),
  asyncHandler(authController.adminForgotPassword),
);


// Verify OTP + set new password.
authRouter.post(
  "/admin/reset-password",
  validateBody(adminResetPasswordSchema),
  asyncHandler(authController.adminResetPassword),
);