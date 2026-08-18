import { StatusBar } from "expo-status-bar";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors, radius, spacing } from "../theme/colors";

interface Props {
  onGoToRegister: () => void;
  onGoToLogin: () => void;
}

export function WelcomeScreen({
  onGoToRegister,
  onGoToLogin,
}: Props) {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Decorative background */}
        <View style={styles.topGlow} />
        <View style={styles.bottomGlow} />

        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.brandArea}>
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>MF</Text>
            </View>

            <View>
              <Text style={styles.brand}>MF-RIDES</Text>
              <Text style={styles.brandTagline}>
                Ride. Travel. Explore.
              </Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <View style={styles.secureBadge}>
              <View style={styles.secureIcon}>
                <Text style={styles.shieldText}>✓</Text>
              </View>

              <Text style={styles.secureText}>
                100% Secure
              </Text>
            </View>

            <View style={styles.menuButton}>
              <View style={styles.menuLine} />
              <View style={styles.menuLine} />
              <View style={styles.menuLine} />
            </View>
          </View>
        </View>

        {/* HERO */}
        <View style={styles.hero}>
          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>
              One app.
            </Text>

            <Text style={styles.heroTitleGold}>
              Unlimited
            </Text>

            <Text style={styles.heroTitle}>
              journeys.
            </Text>

            <Text style={styles.heroDescription}>
              From daily rides to long journeys,
              {"\n"}
              we've got you covered.
            </Text>
          </View>

          {/* Scenic journey visual */}
          <View style={styles.scenery}>
            {/* sky */}
            <View style={styles.sun} />

            {/* mountains */}
            <View style={styles.mountainBack} />
            <View style={styles.mountainMiddle} />
            <View style={styles.mountainFront} />

            {/* trees */}
            <View style={[styles.tree, styles.treeOne]} />
            <View style={[styles.tree, styles.treeTwo]} />
            <View style={[styles.tree, styles.treeThree]} />
            <View style={[styles.tree, styles.treeFour]} />

            {/* road */}
            <View style={styles.roadOuter}>
              <View style={styles.roadInner}>
                <View style={styles.roadMarkOne} />
                <View style={styles.roadMarkTwo} />
                <View style={styles.roadMarkThree} />
              </View>
            </View>

            {/* car */}
            <View style={styles.heroCar}>
              <View style={styles.heroCarRoof}>
                <View style={styles.heroWindowOne} />
                <View style={styles.heroWindowTwo} />
              </View>

              <View style={styles.heroCarBody}>
                <View style={styles.heroLightOne} />
                <View style={styles.heroLightTwo} />
              </View>

              <View style={styles.heroWheelOne} />
              <View style={styles.heroWheelTwo} />
            </View>
          </View>
        </View>

        {/* PICKUP / DROP CARD */}
        <View style={styles.routeCard}>
          <View style={styles.routeLocation}>
            <View style={styles.greenLocation}>
              <View style={styles.greenDot} />
            </View>

            <View style={styles.locationContent}>
              <Text style={styles.locationLabel}>
                PICKUP
              </Text>

              <Text style={styles.locationValue}>
                Current location
              </Text>
            </View>
          </View>

          <View style={styles.routeArrow}>
            <View style={styles.routeDashed} />
            <Text style={styles.routeArrowText}>→</Text>
          </View>

          <View style={styles.routeLocation}>
            <View style={styles.redLocation}>
              <View style={styles.redDot} />
            </View>

            <View style={styles.locationContent}>
              <Text style={styles.locationLabel}>
                DROP
              </Text>

              <Text style={styles.locationValue}>
                Where are you going?
              </Text>
            </View>
          </View>

          <View style={styles.routeAction}>
            <Text style={styles.routeActionText}>→</Text>
          </View>
        </View>

        {/* SERVICES */}
        <View style={styles.services}>
          <ServiceCard
            icon="CAR"
            title="Ride"
            subtitle="Book a ride"
            background="#FFF4D9"
            iconBackground="#FFF0C2"
            onPress={onGoToRegister}
          />

          <ServiceCard
            icon="BUS"
            title="Bus"
            subtitle="Tickets"
            background="#E8F7F5"
            iconBackground="#D5F0ED"
            onPress={onGoToRegister}
          />

          <ServiceCard
            icon="TRAIN"
            title="Train"
            subtitle="Tickets"
            background="#EAF0FF"
            iconBackground="#DCE6FF"
            onPress={onGoToRegister}
          />

          <ServiceCard
            icon="FILM"
            title="Movies"
            subtitle="Book now"
            background="#FFF0F0"
            iconBackground="#FFE1E1"
            onPress={onGoToRegister}
          />

          <ServiceCard
            icon="⚡"
            title="Recharge"
            subtitle="Mobile & more"
            background="#EFF7E6"
            iconBackground="#E0F0CE"
            onPress={onGoToRegister}
          />

          <ServiceCard
            icon="+"
            title="More"
            subtitle="Services"
            background="#F6F0E6"
            iconBackground="#EEE4D2"
            onPress={onGoToRegister}
          />
        </View>

        {/* REWARDS */}
        <Pressable
          style={styles.rewardsCard}
          onPress={onGoToRegister}
        >
          <View style={styles.rewardIcon}>
            <Text style={styles.rewardStar}>★</Text>
          </View>

          <View style={styles.rewardInfo}>
            <Text style={styles.rewardTitle}>
              MF Rewards
            </Text>

            <Text style={styles.rewardSubtitle}>
              More rides. More rewards.
            </Text>
          </View>

          <View style={styles.rewardPoints}>
            <Text style={styles.pointsNumber}>0</Text>
            <Text style={styles.pointsLabel}>POINTS</Text>
          </View>

          <Text style={styles.rewardArrow}>›</Text>
        </Pressable>

        {/* PRIMARY ACTION */}
        <Pressable
          style={styles.primaryButton}
          onPress={onGoToRegister}
        >
          <Text style={styles.primaryButtonText}>
            Start your journey
          </Text>

          <View style={styles.primaryArrow}>
            <Text style={styles.primaryArrowText}>
              →
            </Text>
          </View>
        </Pressable>

        {/* LOGIN */}
        <Pressable
          style={styles.loginButton}
          onPress={onGoToLogin}
        >
          <Text style={styles.loginText}>
            Already have an account?
          </Text>

          <Text style={styles.loginLink}>
            Log in
          </Text>
        </Pressable>

        {/* TRUST */}
        <View style={styles.trustRow}>
          <TrustItem text="Safe Rides" />
          <TrustItem text="Verified Partners" />
          <TrustItem text="Secure Payments" />
          <TrustItem text="24/7 Support" />
        </View>
      </ScrollView>
    </View>
  );
}

/* -------------------------------------------------- */
/* SERVICE CARD */
/* -------------------------------------------------- */

interface ServiceCardProps {
  icon: string;
  title: string;
  subtitle: string;
  background: string;
  iconBackground: string;
  onPress: () => void;
}

function ServiceCard({
  icon,
  title,
  subtitle,
  background,
  iconBackground,
  onPress,
}: ServiceCardProps) {
  return (
    <Pressable
      style={[
        styles.serviceCard,
        {
          backgroundColor: background,
        },
      ]}
      onPress={onPress}
    >
      <View
        style={[
          styles.serviceIcon,
          {
            backgroundColor: iconBackground,
          },
        ]}
      >
        <Text style={styles.serviceIconText}>
          {icon}
        </Text>
      </View>

      <Text style={styles.serviceTitle}>
        {title}
      </Text>

      <Text style={styles.serviceSubtitle}>
        {subtitle}
      </Text>
    </Pressable>
  );
}

/* -------------------------------------------------- */
/* TRUST ITEM */
/* -------------------------------------------------- */

function TrustItem({ text }: { text: string }) {
  return (
    <View style={styles.trustItem}>
      <View style={styles.trustCheck}>
        <Text style={styles.trustCheckText}>✓</Text>
      </View>

      <Text style={styles.trustText}>
        {text}
      </Text>
    </View>
  );
}

/* -------------------------------------------------- */
/* STYLES */
/* -------------------------------------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FCFAF5",
  },

  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },

  topGlow: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "#FFF1D2",
    top: -160,
    right: -100,
  },

  bottomGlow: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#F4E7D4",
    bottom: -120,
    left: -110,
  },

  /* HEADER */

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  brandArea: {
    flexDirection: "row",
    alignItems: "center",
  },

  logoBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#D99A22",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
    shadowColor: "#C18418",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },

  logoText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 1,
  },

  brand: {
    color: "#171B2A",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 2.2,
  },

  brandTagline: {
    color: "#777B86",
    fontSize: 10,
    marginTop: 3,
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  secureBadge: {
    height: 34,
    paddingHorizontal: 9,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E9E1D3",
    flexDirection: "row",
    alignItems: "center",
  },

  secureIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFF0C7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 5,
  },

  shieldText: {
    color: "#B97910",
    fontSize: 11,
    fontWeight: "900",
  },

  secureText: {
    color: "#3D3A32",
    fontSize: 9,
    fontWeight: "800",
  },

  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E9E1D3",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },

  menuLine: {
    width: 17,
    height: 2,
    borderRadius: 2,
    backgroundColor: "#9A6818",
  },

  /* HERO */

  hero: {
    backgroundColor: "#FFF9ED",
    borderRadius: 26,
    minHeight: 255,
    padding: 18,
    borderWidth: 1,
    borderColor: "#F0E4CC",
    overflow: "hidden",
    position: "relative",
  },

  heroText: {
    zIndex: 5,
    maxWidth: "57%",
  },

  heroTitle: {
    color: "#171B2A",
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "800",
  },

  heroTitleGold: {
    color: "#C98A1C",
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "900",
  },

  heroDescription: {
    color: "#626672",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12,
  },

  /* SCENERY */

  scenery: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: "57%",
    height: "100%",
    overflow: "hidden",
  },

  sun: {
    position: "absolute",
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#FFD978",
    top: 34,
    right: 55,
    opacity: 0.75,
  },

  mountainBack: {
    position: "absolute",
    width: 180,
    height: 150,
    backgroundColor: "#D5D9D8",
    transform: [{ rotate: "45deg" }],
    right: -35,
    top: 28,
    borderRadius: 18,
  },

  mountainMiddle: {
    position: "absolute",
    width: 145,
    height: 130,
    backgroundColor: "#A8B0AE",
    transform: [{ rotate: "45deg" }],
    right: 42,
    top: 55,
    borderRadius: 18,
  },

  mountainFront: {
    position: "absolute",
    width: 155,
    height: 100,
    backgroundColor: "#7D8A80",
    transform: [{ rotate: "42deg" }],
    right: 95,
    top: 90,
    borderRadius: 20,
  },

  tree: {
    position: "absolute",
    width: 10,
    height: 28,
    backgroundColor: "#50684E",
    borderRadius: 5,
    bottom: 75,
  },

  treeOne: {
    right: 25,
  },

  treeTwo: {
    right: 48,
    height: 36,
  },

  treeThree: {
    right: 75,
    height: 23,
  },

  treeFour: {
    right: 105,
    height: 31,
  },

  roadOuter: {
    position: "absolute",
    width: 300,
    height: 110,
    backgroundColor: "#D6C7AC",
    transform: [{ rotate: "-13deg" }],
    bottom: -55,
    right: -70,
    borderRadius: 55,
  },

  roadInner: {
    position: "absolute",
    width: 280,
    height: 84,
    backgroundColor: "#F3E8D3",
    borderRadius: 42,
    top: 13,
    left: 10,
    overflow: "hidden",
  },

  roadMarkOne: {
    position: "absolute",
    width: 35,
    height: 3,
    backgroundColor: "#D8A73C",
    top: 40,
    left: 40,
  },

  roadMarkTwo: {
    position: "absolute",
    width: 35,
    height: 3,
    backgroundColor: "#D8A73C",
    top: 40,
    left: 110,
  },

  roadMarkThree: {
    position: "absolute",
    width: 35,
    height: 3,
    backgroundColor: "#D8A73C",
    top: 40,
    left: 180,
  },

  /* HERO CAR */

  heroCar: {
    position: "absolute",
    width: 92,
    height: 60,
    right: 65,
    bottom: 42,
  },

  heroCarRoof: {
    position: "absolute",
    width: 55,
    height: 27,
    left: 18,
    top: 0,
    backgroundColor: "#343B4B",
    borderRadius: 12,
  },

  heroWindowOne: {
    position: "absolute",
    width: 21,
    height: 15,
    backgroundColor: "#B8C1CA",
    left: 5,
    top: 5,
    borderRadius: 5,
  },

  heroWindowTwo: {
    position: "absolute",
    width: 21,
    height: 15,
    backgroundColor: "#B8C1CA",
    right: 5,
    top: 5,
    borderRadius: 5,
  },

  heroCarBody: {
    position: "absolute",
    width: 92,
    height: 31,
    bottom: 6,
    backgroundColor: "#F4F1E8",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D0C9B9",
  },

  heroLightOne: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFE18A",
    left: 7,
    top: 11,
  },

  heroLightTwo: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFE18A",
    right: 7,
    top: 11,
  },

  heroWheelOne: {
    position: "absolute",
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#202533",
    bottom: 0,
    left: 13,
  },

  heroWheelTwo: {
    position: "absolute",
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#202533",
    bottom: 0,
    right: 13,
  },

  /* ROUTE */

  routeCard: {
    marginTop: -26,
    marginHorizontal: 12,
    minHeight: 92,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E8E2D7",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#5B4B30",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
    zIndex: 10,
  },

  routeLocation: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  greenLocation: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "#E0F6EA",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  greenDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#18A66E",
  },

  redLocation: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "#FFE4E5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  redDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#E6535F",
  },

  locationContent: {
    flex: 1,
  },

  locationLabel: {
    color: "#999388",
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  locationValue: {
    color: "#202431",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
  },

  routeArrow: {
    width: 50,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  routeDashed: {
    flex: 1,
    borderTopWidth: 1,
    borderStyle: "dashed",
    borderColor: "#B8B2A7",
  },

  routeArrowText: {
    color: "#B47A16",
    fontSize: 18,
    marginLeft: 3,
  },

  routeAction: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#D99A22",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 7,
  },

  routeActionText: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "700",
  },

  /* SERVICES */

  services: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 18,
    gap: 10,
  },

  serviceCard: {
    width: "30.8%",
    minHeight: 82,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },

  serviceIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
  },

  serviceIconText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#4A4A4A",
  },

  serviceTitle: {
    color: "#202431",
    fontSize: 10,
    fontWeight: "900",
  },

  serviceSubtitle: {
    color: "#7C7E84",
    fontSize: 8,
    marginTop: 2,
  },

  /* REWARDS */

  rewardsCard: {
    marginTop: 14,
    minHeight: 70,
    borderRadius: 20,
    backgroundColor: "#191D2A",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  rewardIcon: {
    width: 47,
    height: 47,
    borderRadius: 16,
    backgroundColor: "#D99A22",
    alignItems: "center",
    justifyContent: "center",
  },

  rewardStar: {
    color: "#FFF4C9",
    fontSize: 25,
  },

  rewardInfo: {
    flex: 1,
    marginLeft: 10,
  },

  rewardTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },

  rewardSubtitle: {
    color: "rgba(255,255,255,0.58)",
    fontSize: 9,
    marginTop: 3,
  },

  rewardPoints: {
    alignItems: "flex-end",
    marginRight: 10,
  },

  pointsNumber: {
    color: "#F3BB43",
    fontSize: 21,
    fontWeight: "900",
  },

  pointsLabel: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 7,
    fontWeight: "800",
  },

  rewardArrow: {
    color: "#FFFFFF",
    fontSize: 25,
  },

  /* ACTION */

  primaryButton: {
    height: 58,
    marginTop: 14,
    borderRadius: 18,
    backgroundColor: "#D99A22",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    shadowColor: "#C18418",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.22,
    shadowRadius: 13,
    elevation: 4,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },

  primaryArrow: {
    position: "absolute",
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },

  primaryArrowText: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "800",
  },

  /* LOGIN */

  loginButton: {
    height: 44,
    marginTop: 3,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  loginText: {
    color: "#777A83",
    fontSize: 11,
  },

  loginLink: {
    color: "#B87913",
    fontSize: 11,
    fontWeight: "900",
    marginLeft: 4,
  },

  /* TRUST */

  trustRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
    paddingHorizontal: 2,
  },

  trustItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  trustCheck: {
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: "#E4F6EC",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 4,
  },

  trustCheckText: {
    color: "#17915F",
    fontSize: 8,
    fontWeight: "900",
  },

  trustText: {
    color: "#777A83",
    fontSize: 7,
  },
});