import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError.js";
import type { UserRole } from "../utils/jwt.js";

/**
 * Restricts a route to one or more roles. Must run after requireAuth,
 * since it relies on req.auth being populated.
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) {
      next(new AppError("Authentication required", 401));
      return;
    }

    if (!allowedRoles.includes(req.auth.role)) {
      next(new AppError("You do not have permission to perform this action", 403));
      return;
    }

    next();
  };
}
