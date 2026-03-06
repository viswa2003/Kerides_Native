import { Redirect, Stack } from "expo-router";
import React from "react";
import { useAuth } from "../../src/auth/AuthProvider";

/**
 * Guard: only authenticated users with role === DRIVER may enter.
 * - Not logged in → redirect to driver login
 * - Logged in as USER → redirect to user home
 */
export default function DriverLayout() {
  const { isLoading, token, role } = useAuth();

  if (isLoading) return null;

  // === TEMPORARY BYPASS: skip auth guard for testing ===
  // if (!token) return <Redirect href="/(auth)/driver/login" />;
  // if (role !== "DRIVER") return <Redirect href="/user/(tabs)/home" />;
  // === END TEMPORARY BYPASS ===

  return <Stack screenOptions={{ headerShown: false }} />;
}