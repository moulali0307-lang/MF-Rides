import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { requireRole } from "../../middleware/requireRole.js";
import { validateBody } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as rideController from "./ride.controller.js";
import { cancelRideSchema, createRideSchema } from "./ride.schema.js";

export const rideRouter = Router();

rideRouter.post(
  "/",
  requireAuth,
  requireRole("RIDER"),
  validateBody(createRideSchema),
  asyncHandler(rideController.createRide),
);

// Specific routes before the /:id catch-all.
rideRouter.get(
  "/available",
  requireAuth,
  requireRole("PARTNER"),
  asyncHandler(rideController.listAvailableRides),
);

rideRouter.get("/mine", requireAuth, asyncHandler(rideController.listMyRides));

rideRouter.post(
  "/:id/accept",
  requireAuth,
  requireRole("PARTNER"),
  asyncHandler(rideController.acceptRide),
);

rideRouter.post(
  "/:id/start",
  requireAuth,
  requireRole("PARTNER"),
  asyncHandler(rideController.startRide),
);

rideRouter.post(
  "/:id/complete",
  requireAuth,
  requireRole("PARTNER"),
  asyncHandler(rideController.completeRide),
);

rideRouter.post(
  "/:id/cancel",
  requireAuth,
  validateBody(cancelRideSchema),
  asyncHandler(rideController.cancelRide),
);

rideRouter.get("/:id", requireAuth, asyncHandler(rideController.getRide));
