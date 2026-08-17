import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as Location from "expo-location";

import { useAuth } from "../context/AuthContext";

interface HomeScreenProps {
  onBookRide: () => void;
}

// ---------------------------------------------------------------------------
// MF-Rides design tokens — clean, daylight "premium mobility" look:
// porcelain surfaces, near-black type, one confident indigo accent.
// Self-contained so this screen's identity doesn't depend on other screens.
// ---------------------------------------------------------------------------
const mf = {
  bg: "#F5F6FA",
  surface: "#FFFFFF",
  surfaceAlt: "#EFF1F8",
  border: "#E4E7F1",
  borderStrong: "#D3D8E6",
  ink: "#12141C",
  inkMuted: "#6B7180",
  inkFaint: "#A0A5B4",
  accent: "#3D4FE0",
  accentDeep: "#2E3CB5",
  accentSoft: "rgba(61, 79, 224, 0.08)",
  accentGlow: "rgba(61, 79, 224, 0.35)",
  success: "#189A5C",
  successSoft: "rgba(24, 154, 92, 0.10)",
  danger: "#D93A2B",
  dangerSoft: "rgba(217, 58, 43, 0.09)",
};

const space = { xs: 4, sm: 8, md: 14, lg: 20, xl: 30, xxl: 44 };
const radii = { sm: 10, md: 16, lg: 24, pill: 999 };

export function HomeScreen({ onBookRide }: HomeScreenProps) {
  const { user, logout } = useAuth();

  const [location, setLocation] =
    useState<Location.LocationObject | null>(null);

  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Purely visual — a subtle pulsing halo around the pickup node once GPS
  // is live. Does not affect location state or business logic.
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    detectCurrentLocation();
  }, []);

  useEffect(() => {
    if (!location) return;

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();

    return () => loop.stop();
  }, [location, pulseAnim]);

  const detectCurrentLocation = async () => {
    try {
      setLocationLoading(true);
      setLocationError(null);

      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== Location.PermissionStatus.GRANTED) {
        setLocationError("Location permission denied");
        setLocationLoading(false);
        return;
      }

      const currentLocation =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

      setLocation(currentLocation);
    } catch (error) {
      console.error("Location error:", error);
      setLocationError("Unable to detect your location");
    } finally {
      setLocationLoading(false);
    }
  };

  const handleBookRide = () => {
    onBookRide();
  };

  const initials = (user?.fullName ?? "Rider")
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const gpsLabel = locationLoading
    ? "Locating"
    : location
    ? "Live"
    : "Unavailable";

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.1],
  });

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.45, 0],
  });

  return (
    <View style={styles.container}>
      <View>
        {/* HEADER */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.eyebrow}>MF-RIDES</Text>
            <Text style={styles.greeting} numberOfLines={1}>
              Hi, {user?.fullName ?? "Rider"}
            </Text>
          </View>

          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        </View>

        {/* ACCOUNT STRIP */}
        <View style={styles.accountCard}>
          <View style={styles.accountField}>
            <Text style={styles.accountLabel}>Phone</Text>
            <Text style={styles.accountValue} numberOfLines={1}>
              {user?.phoneNumber}
            </Text>
          </View>

          {user?.email ? (
            <>
              <View style={styles.accountDivider} />
              <View style={styles.accountField}>
                <Text style={styles.accountLabel}>Email</Text>
                <Text style={styles.accountValue} numberOfLines={1}>
                  {user.email}
                </Text>
              </View>
            </>
          ) : null}

          <View style={styles.accountDivider} />

          <View style={styles.accountField}>
            <Text style={styles.accountLabel}>Account</Text>
            <Text style={styles.accountValue}>Rider</Text>
          </View>
        </View>

        {/* YOUR RIDE — pickup / destination */}
        <View style={styles.rideCard}>
          <View style={styles.rideCardHeader}>
            <Text style={styles.rideCardTitle}>Your ride</Text>

            <View
              style={[
                styles.gpsPill,
                location
                  ? styles.gpsPillSuccess
                  : locationLoading
                  ? styles.gpsPillNeutral
                  : styles.gpsPillDanger,
              ]}
            >
              {locationLoading ? (
                <ActivityIndicator size="small" color={mf.inkMuted} />
              ) : (
                <View
                  style={[
                    styles.gpsDot,
                    location ? styles.gpsDotSuccess : styles.gpsDotDanger,
                  ]}
                />
              )}
              <Text
                style={[
                  styles.gpsPillText,
                  location
                    ? styles.gpsPillTextSuccess
                    : locationLoading
                    ? styles.gpsPillTextNeutral
                    : styles.gpsPillTextDanger,
                ]}
              >
                {gpsLabel}
              </Text>
            </View>
          </View>

          <View style={styles.routeRow}>
            {/* Rail: pickup node -> dashed connector -> destination node */}
            <View style={styles.rail}>
              <View style={styles.pickupNodeWrap}>
                {location ? (
                  <Animated.View
                    style={[
                      styles.pulseHalo,
                      {
                        opacity: pulseOpacity,
                        transform: [{ scale: pulseScale }],
                      },
                    ]}
                  />
                ) : null}
                <View
                  style={[
                    styles.pickupNode,
                    location
                      ? styles.pickupNodeActive
                      : locationLoading
                      ? styles.pickupNodePending
                      : styles.pickupNodeError,
                  ]}
                />
              </View>

              <View style={styles.railConnector} />

              <View style={styles.destinationNode} />
            </View>

            {/* Fields */}
            <View style={styles.fieldsCol}>
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Pickup</Text>
                <View style={styles.fieldInput}>
                  <Text style={styles.fieldInputText}>
                    Choose pickup location
                  </Text>
                </View>

                {!locationLoading && !location ? (
                  <Pressable
                    style={({ pressed }) => [
                      styles.retryLink,
                      pressed && styles.retryLinkPressed,
                    ]}
                    onPress={detectCurrentLocation}
                  >
                    <Text style={styles.retryLinkText}>
                      {locationError ?? "Unable to detect location"} · Retry
                    </Text>
                  </Pressable>
                ) : null}
              </View>

              <View style={[styles.fieldBlock, styles.fieldBlockLast]}>
                <Text style={styles.fieldLabel}>Destination</Text>
                <View style={styles.fieldInput}>
                  <Text style={styles.fieldInputText}>
                    Where are you going?
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* BOOK RIDE */}
        <Pressable
          style={({ pressed }) => [
            styles.bookButton,
            pressed && styles.bookButtonPressed,
          ]}
          onPress={handleBookRide}
        >
          <Text style={styles.bookButtonText}>Book a ride</Text>
          <View style={styles.bookButtonArrowWrap}>
            <Text style={styles.bookButtonArrow}>→</Text>
          </View>
        </Pressable>

        {/* SERVICE INFO */}
        <View style={styles.serviceGrid}>
          <View style={styles.serviceCell}>
            <Text style={styles.serviceCellLabel}>Coverage</Text>
            <Text style={styles.serviceCellValue}>Nearby trips</Text>
          </View>

          <View style={styles.serviceCellDivider} />

          <View style={styles.serviceCell}>
            <Text style={styles.serviceCellLabel}>Max distance</Text>
            <Text style={styles.serviceCellValue}>30 km</Text>
          </View>

          <View style={styles.serviceCellDivider} />

          <View style={styles.serviceCell}>
            <Text style={styles.serviceCellLabel}>Partners</Text>
            <Text style={styles.serviceCellValue}>Verified</Text>
          </View>
        </View>
      </View>

      {/* LOGOUT */}
      <Pressable
        style={({ pressed }) => [
          styles.logoutButton,
          pressed && styles.logoutButtonPressed,
        ]}
        onPress={logout}
      >
        <Text style={styles.logoutButtonText}>Log out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: mf.bg,
    justifyContent: "space-between",
    padding: space.lg,
    paddingTop: space.xxl,
    paddingBottom: space.xl,
  },

  // Header
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  eyebrow: {
    fontSize: 11,
    fontWeight: "800",
    color: mf.accent,
    letterSpacing: 2,
    marginBottom: 6,
  },

  greeting: {
    fontSize: 26,
    fontWeight: "800",
    color: mf.ink,
    letterSpacing: -0.4,
    maxWidth: 240,
  },

  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: mf.ink,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  // Account strip
  accountCard: {
    flexDirection: "row",
    backgroundColor: mf.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: mf.border,
    padding: space.lg,
    marginTop: space.xl,
  },

  accountField: {
    flex: 1,
  },

  accountDivider: {
    width: 1,
    backgroundColor: mf.border,
    marginHorizontal: space.md,
  },

  accountLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: mf.inkFaint,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  accountValue: {
    fontSize: 14,
    fontWeight: "700",
    color: mf.ink,
    marginTop: 4,
  },

  // Ride card
  rideCard: {
    backgroundColor: mf.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: mf.border,
    padding: space.lg,
    marginTop: space.md,
    shadowColor: "#1B2140",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 2,
  },

  rideCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: space.lg,
  },

  rideCardTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: mf.inkFaint,
    textTransform: "uppercase",
    letterSpacing: 1.4,
  },

  gpsPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.pill,
  },

  gpsPillSuccess: {
    backgroundColor: mf.successSoft,
  },

  gpsPillNeutral: {
    backgroundColor: mf.surfaceAlt,
  },

  gpsPillDanger: {
    backgroundColor: mf.dangerSoft,
  },

  gpsDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  gpsDotSuccess: {
    backgroundColor: mf.success,
  },

  gpsDotDanger: {
    backgroundColor: mf.danger,
  },

  gpsPillText: {
    fontSize: 11,
    fontWeight: "700",
  },

  gpsPillTextSuccess: {
    color: mf.success,
  },

  gpsPillTextNeutral: {
    color: mf.inkMuted,
  },

  gpsPillTextDanger: {
    color: mf.danger,
  },

  // Route row: rail + fields
  routeRow: {
    flexDirection: "row",
  },

  rail: {
    width: 22,
    alignItems: "center",
    marginRight: space.md,
    paddingTop: 14,
  },

  pickupNodeWrap: {
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
  },

  pulseHalo: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: mf.accentGlow,
  },

  pickupNode: {
    width: 13,
    height: 13,
    borderRadius: 6.5,
    borderWidth: 3,
  },

  pickupNodeActive: {
    backgroundColor: mf.accent,
    borderColor: mf.accentSoft,
  },

  pickupNodePending: {
    backgroundColor: mf.inkFaint,
    borderColor: mf.surfaceAlt,
  },

  pickupNodeError: {
    backgroundColor: mf.danger,
    borderColor: mf.dangerSoft,
  },

  railConnector: {
    width: 2,
    flex: 1,
    minHeight: 46,
    backgroundColor: mf.borderStrong,
    marginVertical: 6,
  },

  destinationNode: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: mf.borderStrong,
    backgroundColor: mf.surface,
  },

  fieldsCol: {
    flex: 1,
  },

  fieldBlock: {
    marginBottom: space.lg,
  },

  fieldBlockLast: {
    marginBottom: 0,
  },

  fieldLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: mf.accent,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },

  fieldInput: {
    borderWidth: 1,
    borderColor: mf.border,
    backgroundColor: mf.surfaceAlt,
    borderRadius: radii.sm,
    paddingHorizontal: space.md,
    paddingVertical: 13,
  },

  fieldInputText: {
    fontSize: 14,
    fontWeight: "600",
    color: mf.inkMuted,
  },

  retryLink: {
    alignSelf: "flex-start",
    marginTop: space.sm,
  },

  retryLinkPressed: {
    opacity: 0.6,
  },

  retryLinkText: {
    fontSize: 12,
    fontWeight: "700",
    color: mf.danger,
  },

  // Book ride CTA
  bookButton: {
    backgroundColor: mf.accent,
    borderRadius: radii.md,
    paddingVertical: 18,
    paddingHorizontal: space.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: space.xl,
    shadowColor: mf.accent,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 5,
  },

  bookButtonPressed: {
    backgroundColor: mf.accentDeep,
  },

  bookButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.2,
  },

  bookButtonArrowWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },

  bookButtonArrow: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  // Service info grid
  serviceGrid: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: mf.surfaceAlt,
    borderRadius: radii.md,
    marginTop: space.lg,
    paddingVertical: space.md,
    paddingHorizontal: space.sm,
  },

  serviceCell: {
    flex: 1,
    alignItems: "center",
  },

  serviceCellDivider: {
    width: 1,
    height: 28,
    backgroundColor: mf.borderStrong,
  },

  serviceCellLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: mf.inkFaint,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  serviceCellValue: {
    fontSize: 13,
    fontWeight: "700",
    color: mf.ink,
    marginTop: 4,
  },

  // Logout
  logoutButton: {
    borderRadius: radii.md,
    paddingVertical: space.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: mf.border,
    backgroundColor: mf.surface,
  },

  logoutButtonPressed: {
    backgroundColor: mf.surfaceAlt,
  },

  logoutButtonText: {
    color: mf.inkMuted,
    fontSize: 15,
    fontWeight: "700",
  },
});