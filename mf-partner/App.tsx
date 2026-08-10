import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>MF Rides</Text>
      <Text style={styles.title}>MF Partner</Text>
      <Text style={styles.subtitle}>Earn more. Ride smart.</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    padding: 24,
  },
  logo: {
    fontSize: 34,
    fontWeight: "800",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
  },
});
