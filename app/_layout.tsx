import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { Text, TextInput } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import "../global.css";

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
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <Stack />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
