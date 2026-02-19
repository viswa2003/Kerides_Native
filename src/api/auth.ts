export type Role = "USER" | "DRIVER" | "ADMIN";

export type RegisterRequest = {
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
  role: Role;
};

export type RegisterResponse = {
  id: string;
  email: string;
  fullName: string;
  role: Role;
};

/**
 * Call backend POST /auth/register
 * Uses a relative URL so it works on web; replace with an absolute API_BASE if needed for native.
 */
export async function register(
  payload: RegisterRequest,
): Promise<RegisterResponse> {
  const res = await fetch("/auth/register", {
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
  role?: Role;
};

export type LoginResponse = {
  token?: string;
  user?: {
    id: string;
    email: string;
    fullName?: string;
    role: Role;
  };
};

/**
 * Call backend POST /auth/login
 * We include role when provided so the server can validate role-scoped logins.
 */
export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const res = await fetch("/auth/login", {
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
