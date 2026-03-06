import { useRouter } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import { useAuth } from "../src/auth/AuthProvider";

/**
 * Root entry: decides where to send the user on app start.
 * - Logged in + USER  → /user/home
 * - Logged in + DRIVER → /driver/home
 * - Logged out → lastRole-based login (defaults to user login)
 */
export default function Index() {
  const router = useRouter();
  const { isLoading, token, role, lastRole } = useAuth();

  useEffect(() => {
    // === TEMPORARY BYPASS: skip auth, go straight to driver home for testing ===
    router.replace("/driver/(tabs)/home");
    return;
    // === END TEMPORARY BYPASS ===

    if (isLoading) return;

    if (token && role === "DRIVER") {
      router.replace("/driver/(tabs)/home");
    } else if (token && role === "USER") {
      router.replace("/user/(tabs)/home");
    } else {
      // Not logged in — remember last role used
      if (lastRole === "DRIVER") {
        router.replace("/(auth)/driver/login");
      } else {
        router.replace("/(auth)/user/login");
      }
    }
  }, [isLoading, token, role, lastRole, router]);

  // Render nothing while deciding (keeps splash visible on native)
  return <View style={{ flex: 1 }} />;
}
