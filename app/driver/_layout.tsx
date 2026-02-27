// import { Redirect, Stack } from "expo-router";
// import React from "react";
// import { useAuth } from "../../src/auth/AuthProvider";
// {
// /**
//  * Guard: only authenticated users with role === DRIVER may enter.
//  * - Not logged in → redirect to driver login
//  * - Logged in as USER → redirect to user home
//  */}
// export default function DriverLayout() {
//   const { isLoading, token, role } = useAuth();

//   if (isLoading) return null; // still hydrating from SecureStore

//   if (!token) return <Redirect href="/driver/login" />;
//   if (role !== "DRIVER") return <Redirect href="/user/home" />;

//   return <Stack screenOptions={{ headerShown: false }} />;
// }
import { Stack } from "expo-router";

export default function DriverLayout() {
  // TEMP: bypass driver auth guard for testing
  return <Stack screenOptions={{ headerShown: false }} />;
}