import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError.js";
import { verifyToken } from "../utils/jwt.js";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    next(new AppError("Authentication required", 401));
    return;
  }

  const token = header.slice("Bearer ".length).trim();

  try {
    const payload = verifyToken(token);
    req.auth = { userId: payload.sub, role: payload.role };
    next();
  } catch {
    next(new AppError("Invalid or expired token", 401));
  }
}
