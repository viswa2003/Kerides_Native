import { Redirect, Stack } from "expo-router";
import React from "react";
import { useAuth } from "../../src/auth/AuthProvider";

/**
 * Guard: only authenticated users with role === USER may enter.
 * - Not logged in → redirect to user login
 * - Logged in as DRIVER → redirect to driver home
 */
export default function UserLayout() {
  const { isLoading, token, role } = useAuth();

  if (isLoading) return null;
  if (!token) return <Redirect href="/(auth)/user/login" />;
  if (role !== "USER") return <Redirect href="/driver/(tabs)/home" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
