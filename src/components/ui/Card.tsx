import React from "react";
import { View } from "react-native";

export type CardProps = {
  children: React.ReactNode;
  className?: string;
};

/** Lightweight card wrapper used for auth pages */
export default function Card({ children, className = "" }: CardProps) {
  return (
    <View className={`bg-white rounded-lg p-6 shadow ${className}`}>
      {children}
    </View>
  );
}
