import type {
  PrismaClient,
  Ride,
  RideStatus,
  User,
} from "../../../generated/prisma/client.js";
import { AppError } from "../../utils/AppError.js";
import type { CreateRideInput } from "./ride.schema.js";

const ACTIVE_STATUSES: RideStatus[] = [
  "REQUESTED",
  "ACCEPTED",
  "STARTED",
];

const CANCELLABLE_STATUSES: RideStatus[] = [
  "REQUESTED",
  "ACCEPTED",
];

type RideParticipant = Pick<
  User,
  "id" | "fullName" | "phoneNumber" | "role"
>;

export type RideWithParticipants = Ride & {
  passenger: RideParticipant;
  rider: RideParticipant | null;
};

const participantSelect = {
  id: true,
  fullName: true,
  phoneNumber: true,
  role: true,
} as const;

export function createRideService(prisma: PrismaClient) {
  async function getRideOrThrow(
    rideId: string,
  ): Promise<RideWithParticipants> {
    const ride = await prisma.ride.findUnique({
      where: { id: rideId },
      include: {
        passenger: {
          select: participantSelect,
        },
        rider: {
          select: participantSelect,
        },
      },
    });

    if (!ride) {
      throw new AppError("Ride not found", 404);
    }

    return ride as RideWithParticipants;
  }

  return {
    // ============================================================
    // CREATE RIDE
    // ============================================================
    async createRide(
      passengerId: string,
      input: CreateRideInput,
    ): Promise<RideWithParticipants> {
      console.log("");
      console.log("🔥 CREATE RIDE SERVICE HIT");
      console.log("Passenger ID:", passengerId);
      console.log("Ride input:", input);

      // ----------------------------------------------------------
      // 1. Check for existing active ride
      // ----------------------------------------------------------
      console.log("1️⃣ CHECKING ACTIVE RIDE");

      const existingActiveRide = await prisma.ride.findFirst({
        where: {
          passengerId,
          status: {
            in: ACTIVE_STATUSES,
          },
        },
      });

      console.log("2️⃣ ACTIVE RIDE CHECK COMPLETE");

      if (existingActiveRide) {
        console.log(
          "⚠️ ACTIVE RIDE ALREADY EXISTS:",
          existingActiveRide.id,
        );

        throw new AppError(
          "You already have an active ride request. Finish or cancel it before requesting another.",
          409,
        );
      }

      // ----------------------------------------------------------
      // 2. Create ride
      // ----------------------------------------------------------
      console.log("3️⃣ CREATING RIDE IN DATABASE");

      try {
        const ride = await prisma.ride.create({
          data: {
            passengerId,

            status: "REQUESTED",

            pickupAddress: input.pickupAddress,
            pickupLatitude: input.pickupLatitude,
            pickupLongitude: input.pickupLongitude,

            destinationAddress: input.destinationAddress,
            destinationLatitude: input.destinationLatitude,
            destinationLongitude: input.destinationLongitude,

            requestedAt: new Date(),
          },

          include: {
            passenger: {
              select: participantSelect,
            },
            rider: {
              select: participantSelect,
            },
          },
        });

        console.log("4️⃣ RIDE CREATED SUCCESSFULLY");
        console.log("Ride ID:", ride.id);
        console.log("Ride Status:", ride.status);

        return ride as RideWithParticipants;
      } catch (error) {
        console.error("");
        console.error("❌ CREATE RIDE DATABASE ERROR");
        console.error(error);
        console.error("");

        throw new AppError(
          "Unable to create ride. Please try again.",
          500,
        );
      }
    },

    // ============================================================
    // LIST AVAILABLE RIDES
    // ============================================================
    async listAvailableRides(
      limit = 50,
    ): Promise<RideWithParticipants[]> {
      return prisma.ride.findMany({
        where: {
          status: "REQUESTED",
          riderId: null,
        },
        orderBy: {
          requestedAt: "asc",
        },
        take: limit,
        include: {
          passenger: {
            select: participantSelect,
          },
          rider: {
            select: participantSelect,
          },
        },
      }) as Promise<RideWithParticipants[]>;
    },

    // ============================================================
    // ACCEPT RIDE
    // ============================================================
    async acceptRide(
      rideId: string,
      riderId: string,
    ): Promise<RideWithParticipants> {
      const rider = await prisma.user.findUnique({
        where: {
          id: riderId,
        },
      });

      if (!rider) {
        throw new AppError("User not found", 404);
      }

      if (rider.role !== "PARTNER") {
        throw new AppError(
          "Only partners can accept rides",
          403,
        );
      }

      if (!rider.isOnline) {
        throw new AppError(
          "You must be online to accept rides",
          400,
        );
      }

      const claim = await prisma.ride.updateMany({
        where: {
          id: rideId,
          status: "REQUESTED",
          riderId: null,
        },
        data: {
          riderId,
          status: "ACCEPTED",
          acceptedAt: new Date(),
        },
      });

      if (claim.count === 0) {
        const ride = await prisma.ride.findUnique({
          where: {
            id: rideId,
          },
        });

        if (!ride) {
          throw new AppError("Ride not found", 404);
        }

        throw new AppError(
          "This ride is no longer available",
          409,
        );
      }

      return getRideOrThrow(rideId);
    },

    // ============================================================
    // START RIDE
    // ============================================================
    async startRide(
      rideId: string,
      riderId: string,
    ): Promise<RideWithParticipants> {
      const ride = await getRideOrThrow(rideId);

      assertIsAssignedRider(ride, riderId);
      assertStatus(ride, "ACCEPTED", "start");

      const updatedRide = await prisma.ride.update({
        where: {
          id: rideId,
        },
        data: {
          status: "STARTED",
          startedAt: new Date(),
        },
        include: {
          passenger: {
            select: participantSelect,
          },
          rider: {
            select: participantSelect,
          },
        },
      });

      return updatedRide as RideWithParticipants;
    },

    // ============================================================
    // COMPLETE RIDE
    // ============================================================
    async completeRide(
      rideId: string,
      riderId: string,
    ): Promise<RideWithParticipants> {
      const ride = await getRideOrThrow(rideId);

      assertIsAssignedRider(ride, riderId);
      assertStatus(ride, "STARTED", "complete");

      const updatedRide = await prisma.ride.update({
        where: {
          id: rideId,
        },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
        include: {
          passenger: {
            select: participantSelect,
          },
          rider: {
            select: participantSelect,
          },
        },
      });

      return updatedRide as RideWithParticipants;
    },

    // ============================================================
    // CANCEL RIDE
    // ============================================================
    async cancelRide(
      rideId: string,
      userId: string,
      reason?: string,
    ): Promise<RideWithParticipants> {
      const ride = await getRideOrThrow(rideId);

      const isPassenger = ride.passengerId === userId;
      const isAssignedRider = ride.riderId === userId;

      if (!isPassenger && !isAssignedRider) {
        throw new AppError(
          "You are not part of this ride",
          403,
        );
      }

      if (!CANCELLABLE_STATUSES.includes(ride.status)) {
        throw new AppError(
          `A ride can no longer be cancelled once it has ${
            ride.status === "STARTED"
              ? "started"
              : "ended"
          }`,
          409,
        );
      }

      const updatedRide = await prisma.ride.update({
        where: {
          id: rideId,
        },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
          cancelledBy: userId,
          cancellationReason: reason,
        },
        include: {
          passenger: {
            select: participantSelect,
          },
          rider: {
            select: participantSelect,
          },
        },
      });

      return updatedRide as RideWithParticipants;
    },

    // ============================================================
    // GET SINGLE RIDE
    // ============================================================
    async getRideForParticipant(
      rideId: string,
      userId: string,
    ): Promise<RideWithParticipants> {
      const ride = await getRideOrThrow(rideId);

      if (
        ride.passengerId !== userId &&
        ride.riderId !== userId
      ) {
        throw new AppError(
          "You are not part of this ride",
          403,
        );
      }

      return ride;
    },

    // ============================================================
    // MY RIDES
    // ============================================================
    async listMyRides(
      userId: string,
    ): Promise<RideWithParticipants[]> {
      return prisma.ride.findMany({
        where: {
          OR: [
            {
              passengerId: userId,
            },
            {
              riderId: userId,
            },
          ],
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          passenger: {
            select: participantSelect,
          },
          rider: {
            select: participantSelect,
          },
        },
      }) as Promise<RideWithParticipants[]>;
    },

    getRideOrThrow,
  };
}

function assertIsAssignedRider(
  ride: Ride,
  riderId: string,
) {
  if (ride.riderId !== riderId) {
    throw new AppError(
      "You are not the assigned rider for this ride",
      403,
    );
  }
}

function assertStatus(
  ride: Ride,
  expected: RideStatus,
  action: string,
) {
  if (ride.status !== expected) {
    throw new AppError(
      `Cannot ${action} a ride that is currently ${ride.status}`,
      409,
    );
  }
}

export type RideService = ReturnType<
  typeof createRideService
>;