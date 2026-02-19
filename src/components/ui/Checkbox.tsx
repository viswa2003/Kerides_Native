import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";

type Props = {
  checked: boolean;
  onValueChange: (value: boolean) => void;
  children?: React.ReactNode;
  accessibilityLabel?: string;
};

/**
 * Simple accessible checkbox used on forms.
 */
export default function Checkbox({
  checked,
  onValueChange,
  children,
  accessibilityLabel,
}: Props) {
  return (
    <Pressable
      onPress={() => onValueChange(!checked)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={accessibilityLabel}
      className="flex-row items-start space-x-3"
    >
      <View
        className={`w-5 h-5 rounded-sm border flex items-center justify-center ${
          checked
            ? "bg-primary-600 border-primary-600"
            : "bg-white border-gray-300"
        }`}
      >
        {checked ? <MaterialIcons name="check" size={14} color="#fff" /> : null}
      </View>

      <View className="flex-1">
        <Text className="text-sm text-gray-700">{children}</Text>
      </View>
    </Pressable>
  );
}
