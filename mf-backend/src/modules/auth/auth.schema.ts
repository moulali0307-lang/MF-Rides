import { z } from "zod";

/* =========================================================
   PUBLIC USER REGISTRATION
   ========================================================= */

// Public self-registration is intentionally restricted
// to RIDER or PARTNER.
//
// ADMIN accounts must use the dedicated admin registration
// flow and must never be created by sending role=ADMIN
// from a normal public request.
export const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100),

  phoneNumber: z
    .string()
    .trim()
    .regex(
      /^\+?[1-9]\d{7,14}$/,
      "Enter a valid phone number in international format",
    ),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email")
    .optional(),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72),

  role: z.enum(["RIDER", "PARTNER"]).optional().default("RIDER"),
});


/* =========================================================
   PUBLIC USER LOGIN
   ========================================================= */

export const loginSchema = z.object({
  phoneNumber: z
    .string()
    .trim()
    .min(1, "Phone number is required"),

  password: z
    .string()
    .min(1, "Password is required"),
});


/* =========================================================
   ADMIN REGISTRATION
   =========================================================
   
   Admin account creation is separate from public registration.

   We require:
   - name
   - email
   - phone number
   - password
   - confirm password

   The phone number is required because the User model currently
   requires phoneNumber for every user and it also gives us a
   second security factor later.
*/

export const adminRegisterSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Admin name must be at least 2 characters")
      .max(100),

    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Enter a valid admin email"),

    phoneNumber: z
      .string()
      .trim()
      .regex(
        /^\+?[1-9]\d{7,14}$/,
        "Enter a valid phone number in international format",
      ),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72),

    confirmPassword: z
      .string()
      .min(1, "Please confirm your password"),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    },
  );


/* =========================================================
   ADMIN LOGIN
   ========================================================= */

export const adminLoginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid admin email"),

  password: z
    .string()
    .min(1, "Password is required"),
});


/* =========================================================
   ADMIN OTP VERIFICATION
   ========================================================= */

export const adminVerifyOtpSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email"),

  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "OTP must be exactly 6 digits"),
});


/* =========================================================
   ADMIN FORGOT PASSWORD
   ========================================================= */

export const adminForgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid admin email"),
});


/* =========================================================
   ADMIN RESET PASSWORD
   ========================================================= */

export const adminResetPasswordSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Enter a valid admin email"),

    code: z
      .string()
      .trim()
      .regex(/^\d{6}$/, "OTP must be exactly 6 digits"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72),

    confirmPassword: z
      .string()
      .min(1, "Please confirm your password"),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    },
  );


/* =========================================================
   TYPES
   ========================================================= */

export type RegisterInput = z.infer<typeof registerSchema>;

export type LoginInput = z.infer<typeof loginSchema>;

export type AdminRegisterInput = z.infer<typeof adminRegisterSchema>;

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;

export type AdminVerifyOtpInput =
  z.infer<typeof adminVerifyOtpSchema>;

export type AdminForgotPasswordInput =
  z.infer<typeof adminForgotPasswordSchema>;

export type AdminResetPasswordInput =
  z.infer<typeof adminResetPasswordSchema>;