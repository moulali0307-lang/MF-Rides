import { useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { HomeScreen } from "./src/screens/HomeScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { RegisterScreen } from "./src/screens/RegisterScreen";
import { WelcomeScreen } from "./src/screens/WelcomeScreen";
import { colors } from "./src/theme/colors";

type AuthScreen = "welcome" | "register" | "login";

function RootNavigator() {
  const { user, isRestoring } = useAuth();
  const [authScreen, setAuthScreen] = useState<AuthScreen>("welcome");

  if (isRestoring) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (user) {
    return <HomeScreen />;
  }

  switch (authScreen) {
    case "register":
      return <RegisterScreen onGoToLogin={() => setAuthScreen("login")} />;
    case "login":
      return <LoginScreen onGoToRegister={() => setAuthScreen("register")} />;
    case "welcome":
    default:
      return (
        <WelcomeScreen
          onGoToRegister={() => setAuthScreen("register")}
          onGoToLogin={() => setAuthScreen("login")}
        />
      );
  }
}

export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
});
