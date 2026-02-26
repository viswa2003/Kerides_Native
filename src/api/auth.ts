export type Role = "USER" | "DRIVER" | "ADMIN";

type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  role: Role;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken?: string;
  user: AuthUser;
};

function getApiBaseUrl(): string {
  const raw = process.env.EXPO_PUBLIC_API_BASE_URL ?? "";
  return raw.replace(/\/+$/, "");
}

function buildUrl(path: string): string {
  const base = getApiBaseUrl();
  if (!base) return path;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export type RegisterRequest = {
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
  role: Role;
};

/**
 * Call backend POST /auth/register
 * Uses a relative URL so it works on web; replace with an absolute API_BASE if needed for native.
 */
export async function register(
  payload: RegisterRequest,
): Promise<AuthResponse> {
  const res = await fetch(buildUrl("/auth/register"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message =
      (body && (body.message || body.error)) ||
      (await res.text()) ||
      "Registration failed";
    throw new Error(message);
  }

  return res.json();
}

/* ------------------ LOGIN ------------------ */
export type LoginRequest = {
  email: string;
  password: string;
};

/**
 * Call backend POST /auth/login
 */
export async function login(payload: LoginRequest): Promise<AuthResponse> {
  const res = await fetch(buildUrl("/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message =
      (body && (body.message || body.error)) ||
      (await res.text()) ||
      "Login failed";
    throw new Error(message);
  }

  return res.json();
}
