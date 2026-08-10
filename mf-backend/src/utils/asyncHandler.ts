import type { NextFunction, Request, RequestHandler, Response } from "express";
import { AppError } from "./AppError.js";

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Express types route params as `string | string[]` (to allow for
 * repeated/wildcard segments). Every route in this app uses single,
 * required string params (e.g. `:id`), so this narrows that down safely
 * instead of casting.
 */
export function getRequiredParam(req: Request, name: string): string {
  const value = req.params[name];
  if (typeof value !== "string" || value.length === 0) {
    throw new AppError(`Missing or invalid route parameter: ${name}`, 400);
  }
  return value;
}
