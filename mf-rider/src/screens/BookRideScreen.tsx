import { useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { createRide } from "../api/ride";
import { useAuth } from "../context/AuthContext";
import { colors, radius, spacing } from "../theme/colors";

interface BookRideScreenProps {
  onBack: () => void;
}

export function BookRideScreen({ onBack }: BookRideScreenProps) {
  const { token } = useAuth();

  const [pickupAddress, setPickupAddress] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleBookRide() {
    if (loading) {
      return;
    }

    setSuccessMessage("");
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

      setSuccessMessage(
        `Ride requested successfully!\nRide ID: ${result.ride.id}\n\nLooking for a nearby driver...`,
      );

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

      {successMessage ? (
        <View style={styles.successBox}>
          <Text style={styles.successTitle}>
            🚕 Ride Requested
          </Text>

          <Text style={styles.successText}>
            {successMessage}
          </Text>

          <Pressable
            style={styles.homeButton}
            onPress={onBack}
          >
            <Text style={styles.buttonText}>
              Back to Home
            </Text>
          </Pressable>
        </View>
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

      {!successMessage ? (
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