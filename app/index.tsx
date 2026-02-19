import { useRouter } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // Replace the root route with the tabs Home screen so the app opens on Home
    router.replace("/home");
  }, [router]);

  // Render nothing while redirecting (keeps splash visible on native)
  return <View style={{ flex: 1 }} />;
}
