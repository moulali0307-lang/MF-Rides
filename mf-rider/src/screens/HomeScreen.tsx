import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
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

const COLORS = {
  bg: "#FBF7EF",
  cream: "#FFF1CF",
  cream2: "#F5DEAA",
  gold: "#E8A20A",
  goldDark: "#C88400",
  navy: "#101B2E",
  white: "#FFFFFF",
  green: "#159A62",
  red: "#E94B43",
  bus: "#E0F5F3",
  train: "#E8ECFF",
  pink: "#FCE6E6",
  recharge: "#EAF5DD",
  more: "#F3E9D8",
};

const IMAGES = {
  car: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1500&q=90",
  bus: "https://images.unsplash.com/photo-1570125909232-eb263c188f7a?auto=format&fit=crop&w=900&q=90",
  train: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=900&q=90",
  movie: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=90",
  recharge:
    "https://images.unsplash.com/photo-1609592424830-7e4e8f8f1c16?auto=format&fit=crop&w=900&q=90",
};

export function HomeScreen({ onBookRide }: HomeScreenProps) {
  const { user } = useAuth();

  const [locationLabel, setLocationLabel] = useState("Current location");
  const [locationLoading, setLocationLoading] = useState(true);

  useEffect(() => {
    detectCurrentLocation();
  }, []);

  const detectCurrentLocation = async () => {
    try {
      setLocationLoading(true);

      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setLocationLabel("Tap to detect location");
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const result = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      if (result.length > 0) {
        const place = result[0];
        setLocationLabel(
          place.city ||
            place.district ||
            place.subregion ||
            place.region ||
            "Current location"
        );
      }
    } catch (error) {
      console.log("Location error:", error);
      setLocationLabel("Current location");
    } finally {
      setLocationLoading(false);
    }
  };

  const displayName = user?.email?.split("@")[0] || "MF Rider";

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.brandContainer}>
            <View style={styles.wingLogo}>
              <View style={styles.wingLeft} />
              <View style={styles.logoCircle}>
                <Text style={styles.logoText}>MF</Text>
              </View>
              <View style={styles.wingRight} />
            </View>

            <View>
              <Text style={styles.brandName}>MF-RIDES</Text>
              <Text style={styles.brandTagline}>Ride. Travel. Explore.</Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <View style={styles.securePill}>
              <Text style={styles.secureCheck}>✓</Text>
              <Text style={styles.secureText}>100% Secure</Text>
            </View>

            <Pressable style={styles.menuButton}>
              <Text style={styles.menuText}>☰</Text>
            </Pressable>
          </View>
        </View>

        {/* HERO */}
        <View style={styles.hero}>
          <View style={styles.heroBgGlow} />

          <View style={styles.heroLeft}>
            <View style={styles.premiumBadge}>
              <View style={styles.badgeDot} />
              <Text style={styles.badgeText}>PREMIUM RIDE SERVICE</Text>
            </View>

            <Text style={styles.heroTitle}>MF RIDES</Text>
            <Text style={styles.heroGoldTitle}>Unlimited</Text>
            <Text style={styles.heroTitle}>journeys.</Text>

            <Text style={styles.heroSubtitle}>
              From daily rides to long journeys,
              {"\n"}we&apos;ve got you covered.
            </Text>

            <View style={styles.featureRow}>
              <View style={styles.featurePill}>
                <Text style={styles.featureIcon}>✓</Text>
                <Text style={styles.featureText}>Safe &amp; Secure</Text>
              </View>

              <View style={styles.featurePill}>
                <Text style={styles.featureIcon}>⚡</Text>
                <Text style={styles.featureText}>Quick &amp; Reliable</Text>
              </View>

              <View style={styles.featurePill}>
                <Text style={styles.featureIcon}>♙</Text>
                <Text style={styles.featureText}>Verified Partners</Text>
              </View>
            </View>
          </View>

          <View style={styles.heroCarArea}>
            <View style={styles.carGlow} />

            <Image
              source={{ uri: IMAGES.car }}
              style={styles.heroCar}
              resizeMode="contain"
            />

            {/* MF branding */}
            <View style={styles.carBrandPlate}>
              <Text style={styles.carBrandMF}>MF</Text>
              <Text style={styles.carBrandSmall}>RIDE WITH STYLE</Text>
            </View>

            <View style={styles.floatingLogo}>
              <Text style={styles.floatingLogoText}>MF</Text>
            </View>
          </View>
        </View>

        {/* PICKUP / DROP */}
        <Pressable style={styles.routeBar} onPress={onBookRide}>
          <View style={styles.routeSection}>
            <View style={styles.greenDotBox}>
              <View style={styles.greenDot} />
            </View>

            <View>
              <Text style={styles.routeSmall}>PICKUP</Text>
              {locationLoading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color={COLORS.gold} />
                  <Text style={styles.routeValue}>Detecting...</Text>
                </View>
              ) : (
                <>
                  <Text style={styles.routeValue}>{locationLabel}</Text>
                  <Text style={styles.routeHint}>Use my location</Text>
                </>
              )}
            </View>
          </View>

          <View style={styles.routeMiddle}>
            <View style={styles.routeLine} />
            <View style={styles.swapCircle}>
              <Text style={styles.swapText}>⇄</Text>
            </View>
            <View style={styles.routeLine} />
          </View>

          <View style={styles.routeSection}>
            <View style={styles.redDotBox}>
              <View style={styles.redDot} />
            </View>

            <View>
              <Text style={styles.routeSmall}>DROP</Text>
              <Text style={styles.routeValue}>Where are you going?</Text>
              <Text style={styles.routeHint}>Search destination</Text>
            </View>
          </View>

          <View style={styles.routeArrow}>
            <Text style={styles.routeArrowText}>→</Text>
          </View>
        </Pressable>

        {/* SERVICE GRID */}
        <View style={styles.grid}>
          <ServiceCard
            label="CAR"
            title="Ride"
            subtitle="Book a ride"
            background={COLORS.cream}
            image={IMAGES.car}
            onPress={onBookRide}
          />

          <ServiceCard
            label="BUS"
            title="Bus"
            subtitle="Tickets & Passes"
            background={COLORS.bus}
            image={IMAGES.bus}
          />

          <ServiceCard
            label="TRAIN"
            title="Train"
            subtitle="Tickets"
            background={COLORS.train}
            image={IMAGES.train}
          />

          <ServiceCard
            label="MOVIES"
            title="Movies"
            subtitle="Book now"
            background={COLORS.pink}
            image={IMAGES.movie}
          />

          <ServiceCard
            label="RECHARGE"
            title="Recharge"
            subtitle="Mobile & more"
            background={COLORS.recharge}
            image={IMAGES.recharge}
          />

          <Pressable style={[styles.serviceCard, { backgroundColor: COLORS.more }]}>
            <View style={styles.cardContent}>
              <Text style={styles.cardLabel}>MORE</Text>
              <Text style={styles.cardTitle}>More</Text>
              <Text style={styles.cardSubtitle}>Services</Text>
              <View style={styles.smallArrow}>
                <Text style={styles.smallArrowText}>→</Text>
              </View>
            </View>

            <View style={styles.moreIcons}>
              <View style={styles.moreIcon}><Text>✈</Text></View>
              <View style={styles.moreIcon}><Text>▣</Text></View>
              <View style={styles.moreIcon}><Text>✣</Text></View>
              <View style={styles.moreIcon}><Text>⚙</Text></View>
              <View style={styles.moreIcon}><Text>◎</Text></View>
              <View style={styles.moreIcon}><Text>•••</Text></View>
            </View>
          </Pressable>
        </View>

        {/* REWARDS */}
        <Pressable style={styles.rewardsCard}>
          <View style={styles.rewardLogo}>
            <Text style={styles.rewardLogoText}>MF</Text>
          </View>

          <View style={styles.rewardTextBox}>
            <Text style={styles.rewardTitle}>MF Rewards</Text>
            <Text style={styles.rewardSubtitle}>More rides. More rewards.</Text>
          </View>

          <View style={styles.rewardPoints}>
            <Text style={styles.pointsNumber}>0</Text>
            <Text style={styles.pointsText}>POINTS</Text>
          </View>

          <Text style={styles.rewardArrow}>→</Text>
        </Pressable>

        {/* CTA */}
        <Pressable style={styles.startButton} onPress={onBookRide}>
          <Text style={styles.startButtonText}>Start your journey</Text>
          <View style={styles.startArrowBox}>
            <Text style={styles.startArrow}>→</Text>
          </View>
        </Pressable>

        {/* LOGIN */}
        <View style={styles.loginRow}>
          <Text style={styles.loginNormal}>Already have an account? </Text>
          <Text style={styles.loginText}>Log in</Text>
        </View>

        {/* TRUST */}
        <View style={styles.trustRow}>
          <TrustItem text="Safe Rides" />
          <TrustItem text="Verified Partners" />
          <TrustItem text="Secure Payments" />
          <TrustItem text="24/7 Support" />
        </View>

        <Text style={styles.welcomeUser}>Welcome, {displayName}</Text>
      </ScrollView>
    </View>
  );
}

function ServiceCard({
  label,
  title,
  subtitle,
  background,
  image,
  onPress,
}: {
  label: string;
  title: string;
  subtitle: string;
  background: string;
  image: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      style={[styles.serviceCard, { backgroundColor: background }]}
      onPress={onPress}
    >
      <View style={styles.cardContent}>
        <Text style={styles.cardLabel}>{label}</Text>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSubtitle}>{subtitle}</Text>

        <View style={styles.smallArrow}>
          <Text style={styles.smallArrowText}>→</Text>
        </View>
      </View>

      <Image
        source={{ uri: image }}
        style={styles.cardImage}
        resizeMode="cover"
      />
    </Pressable>
  );
}

function TrustItem({ text }: { text: string }) {
  return (
    <View style={styles.trustItem}>
      <View style={styles.trustCheck}>
        <Text style={styles.trustCheckText}>✓</Text>
      </View>
      <Text style={styles.trustText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  scrollContent: {
    width: "100%",
    maxWidth: 1400,
    alignSelf: "center",
    paddingHorizontal: Platform.OS === "web" ? 48 : 16,
    paddingTop: Platform.OS === "web" ? 14 : 12,
    paddingBottom: 45,
  },

  header: {
    minHeight: 76,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: "#E9E0D0",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },

  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  wingLogo: {
    width: 112,
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 5,
  },

  wingLeft: {
    width: 35,
    height: 13,
    backgroundColor: COLORS.navy,
    transform: [{ skewX: "-25deg" }],
    marginRight: -9,
  },

  wingRight: {
    width: 35,
    height: 13,
    backgroundColor: COLORS.navy,
    transform: [{ skewX: "25deg" }],
    marginLeft: -9,
  },

  logoCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.navy,
    borderWidth: 4,
    borderColor: COLORS.gold,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    shadowColor: COLORS.gold,
    shadowOpacity: 0.35,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },

  logoText: {
    color: COLORS.gold,
    fontSize: 22,
    fontWeight: "900",
  },

  brandName: {
    color: COLORS.navy,
    fontSize: 21,
    fontWeight: "900",
    letterSpacing: 1.3,
  },

  brandTagline: {
    color: "#687286",
    fontSize: 11,
    marginTop: 2,
  },

  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  securePill: {
    height: 42,
    paddingHorizontal: 16,
    borderRadius: 22,
    backgroundColor: "#FFF8E7",
    borderWidth: 1,
    borderColor: "#EAD9B2",
    flexDirection: "row",
    alignItems: "center",
  },

  secureCheck: {
    color: COLORS.green,
    fontSize: 16,
    fontWeight: "900",
    marginRight: 5,
  },

  secureText: {
    color: COLORS.navy,
    fontSize: 11,
    fontWeight: "900",
  },

  menuButton: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: COLORS.gold,
    justifyContent: "center",
    alignItems: "center",
  },

  menuText: {
    color: COLORS.white,
    fontSize: 27,
    fontWeight: "900",
  },

  hero: {
    minHeight: Platform.OS === "web" ? 420 : 480,
    backgroundColor: COLORS.cream,
    borderRadius: 30,
    overflow: "hidden",
    position: "relative",
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#EBD9AC",
  },

  heroBgGlow: {
    position: "absolute",
    right: -80,
    top: 30,
    width: 620,
    height: 390,
    borderRadius: 220,
    backgroundColor: "#F8E2A8",
  },

  heroLeft: {
    flex: 0.9,
    justifyContent: "center",
    paddingHorizontal: Platform.OS === "web" ? 48 : 24,
    paddingVertical: 38,
    zIndex: 3,
  },

  premiumBadge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EADDBD",
    marginBottom: 23,
  },

  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gold,
    marginRight: 8,
  },

  badgeText: {
    color: COLORS.navy,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.25,
  },

  heroTitle: {
    color: COLORS.navy,
    fontSize: Platform.OS === "web" ? 48 : 39,
    lineHeight: Platform.OS === "web" ? 53 : 43,
    fontWeight: "900",
    letterSpacing: -1.6,
  },

  heroGoldTitle: {
    color: COLORS.goldDark,
    fontSize: Platform.OS === "web" ? 48 : 39,
    lineHeight: Platform.OS === "web" ? 53 : 43,
    fontWeight: "900",
    letterSpacing: -1.6,
  },

  heroSubtitle: {
    color: "#34415A",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 13,
    marginBottom: 23,
  },

  featureRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },

  featurePill: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    paddingHorizontal: 11,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
  },

  featureIcon: {
    color: COLORS.navy,
    fontSize: 13,
    fontWeight: "900",
    marginRight: 5,
  },

  featureText: {
    color: COLORS.navy,
    fontSize: 10,
    fontWeight: "900",
  },

  heroCarArea: {
    flex: 1.25,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },

  carGlow: {
    position: "absolute",
    right: 20,
    width: "92%",
    height: 260,
    borderRadius: 150,
    backgroundColor: "#F7DFA0",
  },

  heroCar: {
    width: "112%",
    height: Platform.OS === "web" ? 390 : 310,
    zIndex: 2,
    marginRight: -35,
  },

  carBrandPlate: {
    position: "absolute",
    top: 25,
    right: 25,
    width: 125,
    height: 57,
    borderRadius: 17,
    backgroundColor: COLORS.navy,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
  },

  carBrandMF: {
    color: COLORS.gold,
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: 2,
  },

  carBrandSmall: {
    color: COLORS.white,
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 1,
    marginTop: 3,
  },

  floatingLogo: {
    position: "absolute",
    right: 38,
    top: 88,
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: COLORS.gold,
    borderWidth: 3,
    borderColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 6,
  },

  floatingLogoText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "900",
  },

  routeBar: {
    minHeight: 100,
    backgroundColor: COLORS.white,
    borderRadius: 25,
    marginTop: -2,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 10,
    borderWidth: 1,
    borderColor: "#E6DDCE",
    shadowColor: "#000",
    shadowOpacity: 0.09,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 5 },
  },

  routeSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  greenDotBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#E2F6ED",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 11,
  },

  greenDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.green,
  },

  redDotBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#FDE5E4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 11,
  },

  redDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.red,
  },

  routeSmall: {
    color: "#858B96",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.5,
  },

  routeValue: {
    color: COLORS.navy,
    fontSize: 14,
    fontWeight: "900",
    marginTop: 4,
  },

  routeHint: {
    color: "#7B8491",
    fontSize: 10,
    marginTop: 3,
  },

  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 4,
  },

  routeMiddle: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },

  routeLine: {
    width: 42,
    height: 1,
    backgroundColor: "#DDCEB5",
  },

  swapCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFF1C9",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
  },

  swapText: {
    color: COLORS.goldDark,
    fontSize: 19,
    fontWeight: "900",
  },

  routeArrow: {
    width: 56,
    height: 56,
    borderRadius: 17,
    backgroundColor: COLORS.gold,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },

  routeArrowText: {
    color: COLORS.white,
    fontSize: 28,
  },

  grid: {
    marginTop: 18,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  serviceCard: {
    width: "calc(33.333% - 8px)" as any,
    minHeight: 142,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#DDD5C7",
    flexDirection: "row",
    position: "relative",
  },

  cardContent: {
    flex: 1,
    padding: 18,
    justifyContent: "center",
    zIndex: 3,
  },

  cardLabel: {
    color: "#667083",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: 7,
  },

  cardTitle: {
    color: COLORS.navy,
    fontSize: 22,
    fontWeight: "900",
  },

  cardSubtitle: {
    color: "#687386",
    fontSize: 11,
    marginTop: 4,
  },

  smallArrow: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 11,
  },

  smallArrowText: {
    color: COLORS.navy,
    fontSize: 18,
    fontWeight: "900",
  },

  cardImage: {
    width: "52%",
    height: "100%",
  },

  moreIcons: {
    width: "48%",
    padding: 13,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    alignContent: "center",
    justifyContent: "center",
  },

  moreIcon: {
    width: 48,
    height: 43,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.42)",
    alignItems: "center",
    justifyContent: "center",
  },

  rewardsCard: {
    minHeight: 68,
    marginTop: 13,
    backgroundColor: COLORS.navy,
    borderRadius: 19,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
  },

  rewardLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.navy,
    borderWidth: 3,
    borderColor: COLORS.gold,
    alignItems: "center",
    justifyContent: "center",
  },

  rewardLogoText: {
    color: COLORS.gold,
    fontSize: 16,
    fontWeight: "900",
  },

  rewardTextBox: {
    flex: 1,
    marginLeft: 13,
  },

  rewardTitle: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "900",
  },

  rewardSubtitle: {
    color: "#AAB2C1",
    fontSize: 10,
    marginTop: 3,
  },

  rewardPoints: {
    alignItems: "center",
    marginRight: 15,
  },

  pointsNumber: {
    color: COLORS.gold,
    fontSize: 20,
    fontWeight: "900",
  },

  pointsText: {
    color: "#B8BFCA",
    fontSize: 7,
    fontWeight: "900",
  },

  rewardArrow: {
    color: COLORS.gold,
    fontSize: 24,
  },

  startButton: {
    height: 62,
    marginTop: 12,
    borderRadius: 18,
    backgroundColor: COLORS.gold,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    shadowColor: COLORS.goldDark,
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },

  startButtonText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: "900",
  },

  startArrowBox: {
    position: "absolute",
    right: 9,
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.23)",
    alignItems: "center",
    justifyContent: "center",
  },

  startArrow: {
    color: COLORS.white,
    fontSize: 23,
  },

  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
  },

  loginNormal: {
    color: "#7B8390",
    fontSize: 11,
  },

  loginText: {
    color: COLORS.goldDark,
    fontSize: 11,
    fontWeight: "900",
  },

  trustRow: {
    marginTop: 25,
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: 6,
  },

  trustItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  trustCheck: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#E3F4E8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },

  trustCheckText: {
    color: COLORS.green,
    fontSize: 11,
    fontWeight: "900",
  },

  trustText: {
    color: "#687181",
    fontSize: 9,
  },

  welcomeUser: {
    textAlign: "center",
    color: "#A0A5AD",
    fontSize: 9,
    marginTop: 18,
  },
});

export default HomeScreen;