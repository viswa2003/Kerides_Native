import * as SecureStore from "expo-secure-store";
import { Role } from "../api/auth";

const TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "auth_refresh_token";
const ROLE_KEY = "auth_role";
const LAST_ROLE_KEY = "last_role";

/* ───────── Token ───────── */

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

/* ───────── Refresh Token ───────── */

export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function setRefreshToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
}

/* ───────── Role ───────── */

export async function getRole(): Promise<Role | null> {
  const v = await SecureStore.getItemAsync(ROLE_KEY);
  return (v as Role) ?? null;
}

export async function setRole(role: Role): Promise<void> {
  await SecureStore.setItemAsync(ROLE_KEY, role);
  // Also persist as last-used role (survives logout)
  await SecureStore.setItemAsync(LAST_ROLE_KEY, role);
}

/* ───────── Last Role (survives logout) ───────── */

export async function getLastRole(): Promise<Role | null> {
  const v = await SecureStore.getItemAsync(LAST_ROLE_KEY);
  return (v as Role) ?? null;
}

/* ───────── Session helpers ───────── */

export async function setSession(
  token: string,
  role: Role,
  refreshToken?: string,
): Promise<void> {
  await setToken(token);
  await setRole(role);
  if (refreshToken) await setRefreshToken(refreshToken);
}

export async function clearSession(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  await SecureStore.deleteItemAsync(ROLE_KEY);
  // NOTE: lastRole is intentionally NOT cleared so we remember which login to show
}

export async function isLoggedIn(): Promise<boolean> {
  const token = await getToken();
  return !!token;
}
