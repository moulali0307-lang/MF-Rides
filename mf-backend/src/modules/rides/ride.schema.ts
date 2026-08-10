import { z } from "zod";

const latitude = z.number().min(-90).max(90);
const longitude = z.number().min(-180).max(180);

export const createRideSchema = z.object({
  pickupAddress: z.string().trim().min(3, "Pickup address is required").max(300),
  pickupLatitude: latitude,
  pickupLongitude: longitude,
  destinationAddress: z.string().trim().min(3, "Destination address is required").max(300),
  destinationLatitude: latitude,
  destinationLongitude: longitude,
});

export const cancelRideSchema = z.object({
  reason: z.string().trim().max(300).optional(),
});

export type CreateRideInput = z.infer<typeof createRideSchema>;
export type CancelRideInput = z.infer<typeof cancelRideSchema>;
