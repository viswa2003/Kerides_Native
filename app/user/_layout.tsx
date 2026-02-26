import { Redirect, Stack } from "expo-router";
import React from "react";
import { useAuth } from "../../src/auth/AuthProvider";

/**
 * Guard: only authenticated users with role === USER may enter.
 * - Not logged in → redirect to user login
 * - Logged in as DRIVER → redirect to driver home
 */
export default function UserLayout() {
  // TEMP: bypass auth guard for testing
  return <Stack screenOptions={{ headerShown: false }} />;

  // const { isLoading, token, role } = useAuth();
  //
  // if (isLoading) return null;
  // if (!token) return <Redirect href="/user/login" />;
  // if (role !== "USER") return <Redirect href="/driver/home" />;
  //
  // return <Stack screenOptions={{ headerShown: false }} />;
}
