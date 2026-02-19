import React from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  title?: string;
};

/**
 * Simple app bar that respects the top safe area.
 * Title is styled using the app `primary` color.
 */
export default function AppBar({ title = "Kerides" }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View
      accessibilityRole="header"
      style={{ paddingTop: insets.top }}
      className="bg-white border-b border-gray-100"
    >
      <View className="h-14 px-4 flex-row items-center justify-center">
        <Text className="text-lg font-bold text-primary-600">{title}</Text>
      </View>
    </View>
  );
}
