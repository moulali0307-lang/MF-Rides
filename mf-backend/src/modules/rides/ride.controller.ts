import type { Request, Response } from "express";
import { prisma } from "../../db/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { getRequiredParam } from "../../utils/asyncHandler.js";
import { createRideService } from "./ride.service.js";
import type { CancelRideInput, CreateRideInput } from "./ride.schema.js";

const rideService = createRideService(prisma);

function requireAuthContext(req: Request) {
  if (!req.auth) {
    throw new AppError("Authentication required", 401);
  }

  return req.auth;
}

export async function createRide(req: Request, res: Response) {
  console.log("🔥 CREATE RIDE HIT", req.body);

  const auth = requireAuthContext(req);
  const input = req.body as CreateRideInput;

  const ride = await rideService.createRide(auth.userId, input);

  res.status(201).json({
    success: true,
    data: { ride },
  });
}

export async function listAvailableRides(
  _req: Request,
  res: Response,
) {
  const rides = await rideService.listAvailableRides();

  res.status(200).json({
    success: true,
    data: { rides },
  });
}

export async function acceptRide(
  req: Request,
  res: Response,
) {
  const auth = requireAuthContext(req);

  const ride = await rideService.acceptRide(
    getRequiredParam(req, "id"),
    auth.userId,
  );

  res.status(200).json({
    success: true,
    data: { ride },
  });
}

export async function startRide(
  req: Request,
  res: Response,
) {
  const auth = requireAuthContext(req);

  const { otp } = req.body as {
    otp?: string;
  };

  const ride = await rideService.startRide(
    getRequiredParam(req, "id"),
    auth.userId,
    otp ?? "",
  );

  res.status(200).json({
    success: true,
    data: { ride },
  });
}

export async function completeRide(
  req: Request,
  res: Response,
) {
  const auth = requireAuthContext(req);

  const ride = await rideService.completeRide(
    getRequiredParam(req, "id"),
    auth.userId,
  );

  res.status(200).json({
    success: true,
    data: { ride },
  });
}

export async function cancelRide(
  req: Request,
  res: Response,
) {
  const auth = requireAuthContext(req);

  const { reason } = req.body as CancelRideInput;

  const ride = await rideService.cancelRide(
    getRequiredParam(req, "id"),
    auth.userId,
    reason,
  );

  res.status(200).json({
    success: true,
    data: { ride },
  });
}

export async function getRide(
  req: Request,
  res: Response,
) {
  const auth = requireAuthContext(req);

  const ride = await rideService.getRideForParticipant(
    getRequiredParam(req, "id"),
    auth.userId,
  );

  res.status(200).json({
    success: true,
    data: { ride },
  });
}

export async function listMyRides(
  req: Request,
  res: Response,
) {
  const auth = requireAuthContext(req);

  const rides = await rideService.listMyRides(
    auth.userId,
  );

  res.status(200).json({
    success: true,
    data: { rides },
  });
}