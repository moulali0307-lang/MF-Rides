import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { createRide, getRide } from "../api/ride";
import type { Ride } from "../api/ride";
import { useAuth } from "../context/AuthContext";
import { colors, radius, spacing } from "../theme/colors";

interface BookRideScreenProps {
  onBack: () => void;
}

// Statuses where the ride is still "in play" and worth polling for updates.
const ACTIVE_STATUSES: Ride["status"][] = ["REQUESTED", "ACCEPTED", "STARTED"];

// How often to check for a status change while there's no realtime channel yet.
const POLL_INTERVAL_MS = 6000;

export function BookRideScreen({ onBack }: BookRideScreenProps) {
  const { token } = useAuth();

  const [pickupAddress, setPickupAddress] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const [ride, setRide] = useState<Ride | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Poll GET /api/rides/:id while the ride is active, so this screen picks up
  // status changes (e.g. a partner accepting) without a manual refresh.
  useEffect(() => {
    function stopPolling() {
      if (pollTimerRef.current !== null) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    }

    if (!ride || !token || !ACTIVE_STATUSES.includes(ride.status)) {
      stopPolling();
      return;
    }

    stopPolling();
    pollTimerRef.current = setInterval(async () => {
      try {
        const result = await getRide(ride.id, token);
        setRide(result.ride);
      } catch (error) {
        // Transient network hiccups shouldn't kill the flow — just log and
        // let the next interval try again.
        console.error("RIDE STATUS POLL ERROR:", error);
      }
    }, POLL_INTERVAL_MS);

    return stopPolling;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ride?.id, ride?.status, token]);

  async function handleBookRide() {
    if (loading) {
      return;
    }

    setErrorMessage("");

    if (!pickupAddress.trim() || !destinationAddress.trim()) {
      setErrorMessage("Please enter pickup and destination.");
      return;
    }

    if (!token) {
      setErrorMessage("Your login session has expired. Please login again.");
      return;
    }

    setLoading(true);

    try {
      const result = await createRide(
        {
          pickupAddress: pickupAddress.trim(),
          pickupLatitude: 16.1234,
          pickupLongitude: 80.1234,

          destinationAddress: destinationAddress.trim(),
          destinationLatitude: 16.4567,
          destinationLongitude: 80.4567,
        },
        token,
      );

      console.log("CREATE RIDE RESULT:", result);

      if (!result?.ride?.id) {
        console.error("Unexpected ride response:", result);

        throw new Error(
          "Ride was created, but the server returned an unexpected response.",
        );
      }

      setRide(result.ride);

      setPickupAddress("");
      setDestinationAddress("");
    } catch (error) {
      console.error("BOOK RIDE ERROR:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Unable to create ride.";

      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }

  function handleBackFromRide() {
    setRide(null);
    onBack();
  }

  return (
    <View style={styles.container}>
      <Pressable
        onPress={onBack}
        disabled={loading}
      >
        <Text style={styles.backText}>← Back</Text>
      </Pressable>

      <Text style={styles.title}>Book a Ride</Text>

      <Text style={styles.subtitle}>
        Where do you want to go?
      </Text>

      {ride ? (
        <RideStatusCard ride={ride} onBack={handleBackFromRide} />
      ) : null}

      {errorMessage ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>
            Booking failed
          </Text>

          <Text style={styles.errorText}>
            {errorMessage}
          </Text>
        </View>
      ) : null}

      {!ride ? (
        <>
          <Text style={styles.label}>
            Pickup location
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter pickup location"
            placeholderTextColor={colors.textMuted}
            value={pickupAddress}
            onChangeText={setPickupAddress}
            editable={!loading}
          />

          <Text style={styles.label}>
            Destination
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter destination"
            placeholderTextColor={colors.textMuted}
            value={destinationAddress}
            onChangeText={setDestinationAddress}
            editable={!loading}
          />

          <Pressable
            style={[
              styles.button,
              loading && styles.buttonDisabled,
            ]}
            onPress={handleBookRide}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading
                ? "Requesting Ride..."
                : "Confirm Ride"}
            </Text>
          </Pressable>
        </>
      ) : null}
    </View>
  );
}

interface RideStatusCardProps {
  ride: Ride;
  onBack: () => void;
}

// Renders the right message/heading for whatever status the ride is
// currently in, and re-renders automatically as `ride` updates from polling.
function RideStatusCard({ ride, onBack }: RideStatusCardProps) {
  const content = getRideStatusContent(ride);

  return (
    <View style={styles.successBox}>
      <Text style={styles.successTitle}>
        {content.emoji} {content.heading}
      </Text>

      <Text style={styles.successText}>
        {content.body}
      </Text>

      {(ride.status === "COMPLETED" || ride.status === "CANCELLED") ? (
        <Pressable
          style={styles.homeButton}
          onPress={onBack}
        >
          <Text style={styles.buttonText}>
            Back to Home
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function getRideStatusContent(ride: Ride): {
  emoji: string;
  heading: string;
  body: string;
} {
  switch (ride.status) {
    case "REQUESTED":
      return {
        emoji: "🚕",
        heading: "Ride Requested",
        body: `Ride ID: ${ride.id}\n\nLooking for a nearby driver...`,
      };

    case "ACCEPTED":
      return {
        emoji: "✅",
        heading: "Driver Assigned",
        body: ride.rider
          ? `${ride.rider.fullName} is on the way.\nContact: ${ride.rider.phoneNumber}`
          : "A driver has accepted your ride.",
      };

    case "STARTED":
      return {
        emoji: "🚗",
        heading: "Ride In Progress",
        body: ride.rider
          ? `Your ride with ${ride.rider.fullName} has started.`
          : "Your ride has started.",
      };

    case "COMPLETED":
      return {
        emoji: "🏁",
        heading: "Ride Completed",
        body: "Thanks for riding with MF Rides!",
      };

    case "CANCELLED":
      return {
        emoji: "✕",
        heading: "Ride Cancelled",
        body: ride.cancellationReason
          ? `Reason: ${ride.cancellationReason}`
          : "This ride was cancelled.",
      };

    default:
      return {
        emoji: "🚕",
        heading: "Ride Requested",
        body: `Ride ID: ${ride.id}`,
      };
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    paddingTop: spacing.xxl,
  },

  backText: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: spacing.lg,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
  },

  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },

  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.text,
  },

  button: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.xl,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  homeButton: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.lg,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  successBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },

  successTitle: {
    color: colors.accent,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },

  successText: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
  },

  errorBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: "#d9534f",
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },

  errorTitle: {
    color: "#d9534f",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },

  errorText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 21,
  },
});