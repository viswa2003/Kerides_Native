import {
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
} from "@expo-google-fonts/inter";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Text, TextInput } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../global.css";
import { AuthProvider } from "../src/auth/AuthProvider";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter: Inter_400Regular,
    "Inter-SemiBold": Inter_600SemiBold,
    "Inter-Bold": Inter_700Bold,
  });

  useEffect(() => {
    if (!fontsLoaded) return;

    // Set sensible defaults so all RN Text/TextInput use Inter by default
    (Text as unknown as any).defaultProps =
      (Text as unknown as any).defaultProps || {};
    (Text as unknown as any).defaultProps.style = {
      ...((Text as unknown as any).defaultProps.style || {}),
      fontFamily: "Inter",
    };

    (TextInput as unknown as any).defaultProps =
      (TextInput as unknown as any).defaultProps || {};
    (TextInput as unknown as any).defaultProps.style = {
      ...((TextInput as unknown as any).defaultProps.style || {}),
      fontFamily: "Inter",
    };
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }} />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
