import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Platform,
  Pressable,
  ScrollView,
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
// MF-Rides design tokens — premium, daylight mobility identity: porcelain
// surfaces, near-black type, one confident indigo accent. Self-contained
// so this screen's identity doesn't depend on other screens.
// ---------------------------------------------------------------------------
const mf = {
  bg: "#FBF8F1",
  surface: "#FFFFFF",
  surfaceAlt: "#FFF3D6",
  border: "#E8DDC9",
  borderStrong: "#D8C6A5",
  ink: "#172033",
  inkMuted: "#747887",
  inkFaint: "#A29C90",
  accent: "#E3A321",
  accentDeep: "#C98A13",
  accentSoft: "rgba(227, 163, 33, 0.12)",
  accentGlow: "rgba(227, 163, 33, 0.20)",
  accentGlowStrong: "rgba(227, 163, 33, 0.38)",
  success: "#159A62",
  successSoft: "rgba(21, 154, 98, 0.10)",
  danger: "#D93A2B",
  dangerSoft: "rgba(217, 58, 43, 0.09)",
};

const space = { xs: 4, sm: 8, md: 14, lg: 20, xl: 30, xxl: 44 };
const radii = { sm: 10, md: 16, lg: 24, xl: 30, pill: 999 };

const CONTENT_MAX_WIDTH = 520;

export function HomeScreen({ onBookRide }: HomeScreenProps) {
  const { user, logout } = useAuth();

  const [location, setLocation] =
    useState<Location.LocationObject | null>(null);

  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);

  // ------------------------------------------------------------------
  // Purely visual animation state — none of this affects location,
  // auth, or navigation logic.
  // ------------------------------------------------------------------
  const fadeHeader = useRef(new Animated.Value(0)).current;
  const fadeAccount = useRef(new Animated.Value(0)).current;
  const fadeHero = useRef(new Animated.Value(0)).current;
  const fadeActions = useRef(new Animated.Value(0)).current;
  const fadeService = useRef(new Animated.Value(0)).current;

  const pulseAnim = useRef(new Animated.Value(0)).current;
  const roadAnim = useRef(new Animated.Value(0)).current;
  const ctaScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    detectCurrentLocation();
  }, []);

  // Staggered entrance animation.
  useEffect(() => {
    Animated.stagger(90, [
      Animated.timing(fadeHeader, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAccount, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(fadeHero, {
        toValue: 1,
        duration: 460,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(fadeActions, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(fadeService, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [
    fadeHeader,
    fadeAccount,
    fadeHero,
    fadeActions,
    fadeService,
  ]);

  // Decorative moving "road" dashes inside the hero card.
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(roadAnim, {
        toValue: 1,
        duration: 1100,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();

    return () => loop.stop();
  }, [roadAnim]);

  // Subtle pulsing halo on the live location dot.
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

  const handleCtaPressIn = () => {
    Animated.spring(ctaScale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 24,
      bounciness: 6,
    }).start();
  };

  const handleCtaPressOut = () => {
    Animated.spring(ctaScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 24,
      bounciness: 6,
    }).start();
  };

  const initials = (user?.fullName ?? "Rider")
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const fadeStyle = (value: Animated.Value) => ({
    opacity: value,
    transform: [
      {
        translateY: value.interpolate({
          inputRange: [0, 1],
          outputRange: [16, 0],
        }),
      },
    ],
  });

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.2],
  });

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.45, 0],
  });

  const roadTranslateX = roadAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -28],
  });

  const locationStatusLabel = locationLoading
    ? "Finding your location…"
    : location
    ? "Location services active"
    : locationError ?? "Location unavailable";

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* HEADER */}
          <Animated.View style={[styles.headerRow, fadeStyle(fadeHeader)]}>
            <View style={styles.headerTextCol}>
              <View style={styles.brandLine}>
                <View style={styles.brandMark}>
                  <Text style={styles.brandMarkText}>MF</Text>
                </View>
                <Text style={styles.eyebrow}>MF-RIDES</Text>
              </View>
              <Text style={styles.greeting} numberOfLines={1}>
                Hi, {user?.fullName ?? "Rider"}
              </Text>
              <Text style={styles.greetingSubtitle}>
                Ready for your next ride?
              </Text>
            </View>

            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          </Animated.View>

          {/* ACCOUNT CARD */}
          <Animated.View
            style={[styles.accountCard, fadeStyle(fadeAccount)]}
          >
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
          </Animated.View>

          {/* HERO / RIDE SECTION */}
          <Animated.View style={[styles.heroCard, fadeStyle(fadeHero)]}>
            <View style={styles.heroGlowTop} />
            <View style={styles.heroGlowBottom} />

            <Text style={styles.heroTitle}>Where are you heading?</Text>
            <Text style={styles.heroSubtitle}>
              Your ride is just a tap away.
            </Text>

            <View style={styles.heroVehicles}>
              <Text style={styles.heroCar}>🚕</Text>
              <Text style={styles.heroBike}>🏍️</Text>
              <View style={styles.heroVehicleRoad} />
            </View>

            {/* Decorative animated road visual */}
            <View style={styles.roadTrack}>
              <View style={styles.roadNodeStart} />

              <View style={styles.roadDashClip}>
                <Animated.View
                  style={[
                    styles.roadDashRow,
                    { transform: [{ translateX: roadTranslateX }] },
                  ]}
                >
                  {Array.from({ length: 24 }).map((_, i) => (
                    <View key={i} style={styles.roadDash} />
                  ))}
                </Animated.View>
              </View>

              <View style={styles.roadNodeEnd} />
            </View>

            <Animated.View style={{ transform: [{ scale: ctaScale }] }}>
              <Pressable
                style={styles.heroCta}
                onPress={handleBookRide}
                onPressIn={handleCtaPressIn}
                onPressOut={handleCtaPressOut}
              >
                <Text style={styles.heroCtaText}>Book a Ride</Text>
                <View style={styles.heroCtaArrowWrap}>
                  <Text style={styles.heroCtaArrow}>→</Text>
                </View>
              </Pressable>
            </Animated.View>
          </Animated.View>

          {/* QUICK ACTIONS */}
          <Animated.View
            style={[styles.quickActionsRow, fadeStyle(fadeActions)]}
          >
            <Pressable
              style={({ pressed }) => [
                styles.actionCard,
                pressed && styles.actionCardPressed,
              ]}
              onPress={detectCurrentLocation}
            >
              <View style={styles.actionIconBadge}>
                <Text style={styles.actionIconGlyph}>◎</Text>
              </View>
              <Text style={styles.actionLabel}>Current{"\n"}Location</Text>
            </Pressable>

            <View style={styles.actionCard}>
              <View style={styles.actionIconBadge}>
                <Text style={styles.actionIconGlyph}>▤</Text>
              </View>
              <Text style={styles.actionLabel}>Ride{"\n"}History</Text>
              <View style={styles.soonPill}>
                <Text style={styles.soonPillText}>Soon</Text>
              </View>
            </View>

            <View style={styles.actionCard}>
              <View style={styles.actionIconBadge}>
                <Text style={styles.actionIconGlyph}>✦</Text>
              </View>
              <Text style={styles.actionLabel}>Support</Text>
              <View style={styles.soonPill}>
                <Text style={styles.soonPillText}>Soon</Text>
              </View>
            </View>
          </Animated.View>

          {/* SERVICE INFORMATION */}
          <Animated.View
            style={[styles.serviceCard, fadeStyle(fadeService)]}
          >
            <Text style={styles.serviceCardTitle}>MF-Rides Service</Text>

            <View style={styles.serviceGrid}>
              <View style={styles.serviceCell}>
                <View style={styles.serviceCellIconWrap}>
                  <Text style={styles.serviceCellIcon}>◎</Text>
                </View>
                <Text style={styles.serviceCellLabel}>Nearby rides</Text>
              </View>

              <View style={styles.serviceCellDivider} />

              <View style={styles.serviceCell}>
                <View style={styles.serviceCellIconWrap}>
                  <Text style={styles.serviceCellIcon}>↔</Text>
                </View>
                <Text style={styles.serviceCellLabel}>30 km coverage</Text>
              </View>

              <View style={styles.serviceCellDivider} />

              <View style={styles.serviceCell}>
                <View style={styles.serviceCellIconWrap}>
                  <Text style={styles.serviceCellIcon}>✓</Text>
                </View>
                <Text style={styles.serviceCellLabel}>Verified partners</Text>
              </View>
            </View>

            {/* LOCATION STATUS */}
            <View style={styles.locationStatusRow}>
              <View style={styles.locationStatusDotWrap}>
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

                {locationLoading ? (
                  <ActivityIndicator size="small" color={mf.inkMuted} />
                ) : (
                  <View
                    style={[
                      styles.locationStatusDot,
                      location
                        ? styles.locationStatusDotActive
                        : styles.locationStatusDotError,
                    ]}
                  />
                )}
              </View>

              <Text
                style={[
                  styles.locationStatusText,
                  !location &&
                    !locationLoading &&
                    styles.locationStatusTextError,
                ]}
                numberOfLines={1}
              >
                {locationStatusLabel}
              </Text>

              {!locationLoading && !location ? (
                <Pressable
                  style={({ pressed }) => [
                    styles.retryLink,
                    pressed && styles.retryLinkPressed,
                  ]}
                  onPress={detectCurrentLocation}
                >
                  <Text style={styles.retryLinkText}>Retry</Text>
                </Pressable>
              ) : null}
            </View>
          </Animated.View>

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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: mf.bg,
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: space.lg,
    paddingTop: Platform.OS === "web" ? space.xxl : space.xxl,
    paddingBottom: space.xxl,
  },

  content: {
    width: "100%",
    maxWidth: CONTENT_MAX_WIDTH,
  },

  // Header
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  headerTextCol: {
    flex: 1,
    paddingRight: space.md,
  },

  brandLine: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 7,
  },

  brandMark: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: mf.accent,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  brandMarkText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.5,
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
  },

  greetingSubtitle: {
    fontSize: 13,
    color: mf.inkMuted,
    marginTop: 3,
  },

  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: mf.accent,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  // Account card
  accountCard: {
    flexDirection: "row",
    backgroundColor: mf.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: mf.border,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    marginTop: space.lg,
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
    marginTop: 3,
  },

  // Hero card
  heroCard: {
    backgroundColor: "#FFF8E8",
    borderRadius: radii.xl,
    padding: space.xl,
    marginTop: space.lg,
    overflow: "hidden",
    position: "relative",
    shadowColor: mf.accentDeep,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.28,
    shadowRadius: 30,
    elevation: 8,
  },

  heroGlowTop: {
    position: "absolute",
    top: -70,
    right: -55,
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: "rgba(227, 163, 33, 0.18)",
  },

  heroGlowBottom: {
    position: "absolute",
    bottom: -75,
    left: -45,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "rgba(23, 32, 51, 0.06)",
  },

  heroTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: mf.ink,
    letterSpacing: -0.3,
  },

  heroSubtitle: {
    fontSize: 14,
    color: mf.inkMuted,
    marginTop: 6,
  },

  // Car + bike hero visual
  heroVehicles: {
    height: 112,
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 20,
    backgroundColor: "#FFF1C9",
    position: "relative",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },

  heroCar: {
    fontSize: 68,
    marginTop: 5,
    marginLeft: -36,
  },

  heroBike: {
    position: "absolute",
    right: 26,
    bottom: 19,
    fontSize: 43,
  },

  heroVehicleRoad: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 15,
    height: 3,
    borderRadius: 2,
    backgroundColor: mf.accent,
    transform: [{ rotate: "-3deg" }],
  },

  // Decorative road visual
  roadTrack: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: space.xl,
    marginBottom: space.lg,
  },

  roadNodeStart: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: mf.accent,
  },

  roadNodeEnd: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: mf.borderStrong,
    backgroundColor: "transparent",
  },

  roadDashClip: {
    flex: 1,
    height: 2,
    marginHorizontal: space.sm,
    overflow: "hidden",
  },

  roadDashRow: {
    flexDirection: "row",
    width: 700,
    height: 2,
  },

  roadDash: {
    width: 16,
    height: 2,
    marginRight: 12,
    backgroundColor: "rgba(23,32,51,0.22)",
    borderRadius: 1,
  },

  heroCta: {
    backgroundColor: mf.ink,
    borderRadius: radii.md,
    paddingVertical: 17,
    paddingHorizontal: space.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  heroCtaText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.2,
  },

  heroCtaArrowWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },

  heroCtaArrow: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  // Quick actions
  quickActionsRow: {
    flexDirection: "row",
    marginTop: space.lg,
    gap: space.sm,
  },

  actionCard: {
    flex: 1,
    backgroundColor: mf.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: mf.border,
    paddingVertical: space.md,
    paddingHorizontal: space.sm,
    alignItems: "center",
    position: "relative",
  },

  actionCardPressed: {
    backgroundColor: mf.surfaceAlt,
  },

  actionIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: mf.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: space.sm,
  },

  actionIconGlyph: {
    color: mf.accent,
    fontSize: 15,
    fontWeight: "700",
  },

  actionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: mf.ink,
    textAlign: "center",
    lineHeight: 15,
  },

  soonPill: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: mf.surfaceAlt,
    borderRadius: radii.pill,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },

  soonPillText: {
    fontSize: 8,
    fontWeight: "800",
    color: mf.inkFaint,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },

  // Service card
  serviceCard: {
    backgroundColor: mf.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: mf.border,
    padding: space.lg,
    marginTop: space.lg,
  },

  serviceCardTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: mf.inkFaint,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: space.md,
  },

  serviceGrid: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  serviceCell: {
    flex: 1,
    alignItems: "center",
  },

  serviceCellDivider: {
    width: 1,
    height: 40,
    backgroundColor: mf.border,
    marginTop: 6,
  },

  serviceCellIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: mf.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },

  serviceCellIcon: {
    color: mf.accent,
    fontSize: 13,
    fontWeight: "700",
  },

  serviceCellLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: mf.inkMuted,
    textAlign: "center",
  },

  // Location status
  locationStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: space.lg,
    paddingTop: space.md,
    borderTopWidth: 1,
    borderTopColor: mf.border,
  },

  locationStatusDotWrap: {
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: space.sm,
  },

  pulseHalo: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: mf.accentGlowStrong,
  },

  locationStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  locationStatusDotActive: {
    backgroundColor: mf.success,
  },

  locationStatusDotError: {
    backgroundColor: mf.danger,
  },

  locationStatusText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    color: mf.inkMuted,
  },

  locationStatusTextError: {
    color: mf.danger,
  },

  retryLink: {
    marginLeft: space.sm,
  },

  retryLinkPressed: {
    opacity: 0.6,
  },

  retryLinkText: {
    fontSize: 12,
    fontWeight: "800",
    color: mf.accent,
  },

  // Logout
  logoutButton: {
    borderRadius: radii.md,
    paddingVertical: space.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: mf.border,
    backgroundColor: mf.surface,
    marginTop: space.xl,
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