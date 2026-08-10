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

  async function handleBookRide() {
    alert("1. FUNCTION STARTED");
    

    if (!pickupAddress.trim() || !destinationAddress.trim()) {
      Alert.alert(
        "Missing details",
        "Please enter pickup and destination.",
      );
      return;
    }
    alert("2. TOKEN = " + (token ? "YES" : "NO"));

    if (!token) {
      Alert.alert("Login required", "Please login again.");
      return;
    }

    setLoading(true);

    try {
      alert("3. CALLING BACKEND");

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

      alert("4. BACKEND RESPONSE RECEIVED");
      Alert.alert(
        "Ride requested 🚕",
        `Ride ID: ${result.ride.id}`,
      );

      setPickupAddress("");
      setDestinationAddress("");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to create ride.";

      Alert.alert("Booking failed", message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Pressable onPress={onBack}>
        <Text style={styles.backText}>← Back</Text>
      </Pressable>

      <Text style={styles.title}>Book a Ride</Text>

      <Text style={styles.subtitle}>
        Where do you want to go?
      </Text>

      <Text style={styles.label}>Pickup location</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter pickup location"
        placeholderTextColor={colors.textMuted}
        value={pickupAddress}
        onChangeText={setPickupAddress}
      />

      <Text style={styles.label}>Destination</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter destination"
        placeholderTextColor={colors.textMuted}
        value={destinationAddress}
        onChangeText={setDestinationAddress}
      />

    <Pressable
  style={styles.button}
  onPress={handleBookRide}
>
  <Text style={styles.buttonText}>Confirm Ride</Text>
</Pressable>
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

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});