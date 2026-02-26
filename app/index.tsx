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
    if (isLoading) return;

    // TEMP: always open user home for testing
    router.replace("/user/home");

    // if (token && role === "DRIVER") {
    //   router.replace("/driver/home");
    // } else if (token && role === "USER") {
    //   router.replace("/user/home");
    // } else {
    //   // Not logged in — remember last role used
    //   if (lastRole === "DRIVER") {
    //     router.replace("/driver/login");
    //   } else {
    //     router.replace("/user/login");
    //   }
    // }
  }, [isLoading, token, role, lastRole, router]);

  // Render nothing while deciding (keeps splash visible on native)
  return <View style={{ flex: 1 }} />;
}
