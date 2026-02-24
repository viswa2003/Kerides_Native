import React from "react";
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  Text,
} from "react-native";

export type ButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "success";
  loading?: boolean;
  className?: string;
} & PressableProps;

/**
 * Simple accessible button with variants. Merges incoming `className` so callers
 * can pass layout classes (e.g. `flex-[2]`).
 */
export default function Button({
  children,
  onPress,
  variant = "primary",
  loading = false,
  disabled,
  accessibilityLabel,
  className: incomingClassName,
  ...rest
}: ButtonProps) {
  const base =
    "rounded-md px-4 py-2 items-center justify-center transition-colors";
  const variantClass =
    variant === "primary"
      ? "bg-primary-600 hover:bg-primary-700 focus-visible:ring-2 focus-visible:ring-primary-500"
      : variant === "success"
        ? "bg-green-600 hover:bg-green-700 focus-visible:ring-2 focus-visible:ring-green-500"
        : variant === "secondary"
          ? "bg-gray-100"
          : "bg-transparent";
  const textClass =
    variant === "primary" || variant === "success"
      ? "text-white"
      : "text-gray-900";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      disabled={disabled || loading}
      className={`${base} ${variantClass} ${incomingClassName ?? ""} ${disabled ? "opacity-50" : "opacity-100"}`}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === "primary" || variant === "success" ? "#fff" : "#111827"
          }
        />
      ) : (
        <Text className={`${textClass} font-semibold`}>{children}</Text>
      )}
    </Pressable>
  );
}
