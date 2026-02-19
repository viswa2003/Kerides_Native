import React from "react";
import {
    ActivityIndicator,
    Pressable,
    PressableProps,
    Text,
} from "react-native";

export type ButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
} & PressableProps;

/**
 * Simple accessible button with three variants.
 */
export default function Button({
  children,
  onPress,
  variant = "primary",
  loading = false,
  disabled,
  accessibilityLabel,
  ...rest
}: ButtonProps) {
  const base =
    "rounded-md px-4 py-2 items-center justify-center transition-colors";
  const variantClass =
    variant === "primary"
      ? "bg-primary-600 hover:bg-primary-700 focus-visible:ring-2 focus-visible:ring-primary-500"
      : variant === "secondary"
        ? "bg-gray-100"
        : "bg-transparent";
  const textClass = variant === "primary" ? "text-white" : "text-gray-900";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      disabled={disabled || loading}
      className={`${base} ${variantClass} ${disabled ? "opacity-50" : "opacity-100"}`}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#fff" : "#111827"} />
      ) : (
        <Text className={`${textClass} font-semibold`}>{children}</Text>
      )}
    </Pressable>
  );
}
