import { getToken } from "../auth/session";

const SERVICE_URLS = {
  auth: () => stripTrailingSlash(process.env.EXPO_PUBLIC_AUTH_API_URL ?? process.env.EXPO_PUBLIC_API_BASE_URL ?? ""),
  user: () => stripTrailingSlash(process.env.EXPO_PUBLIC_USER_API_URL ?? ""),
  driver: () => stripTrailingSlash(process.env.EXPO_PUBLIC_DRIVER_API_URL ?? ""),
  booking: () => stripTrailingSlash(process.env.EXPO_PUBLIC_BOOKING_API_URL ?? ""),
} as const;

export type ServiceName = keyof typeof SERVICE_URLS;

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

function buildUrl(service: ServiceName, path: string): string {
  const base = SERVICE_URLS[service]();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${normalized}` : normalized;
}

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

async function parseError(res: Response): Promise<string> {
  const body = await res.json().catch(() => null);
  if (body?.message) {
    return Array.isArray(body.message) ? body.message.join(", ") : body.message;
  }
  return body?.error ?? `Request failed (${res.status})`;
}

type RequestOptions = {
  service: ServiceName;
  path: string;
  method?: string;
  body?: unknown;
  query?: Record<string, string | number | undefined>;
  authenticated?: boolean;
};

export async function request<T = unknown>(opts: RequestOptions): Promise<T> {
  const {
    service,
    path,
    method = "GET",
    body,
    query,
    authenticated = true,
  } = opts;

  let url = buildUrl(service, path);

  if (query) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null) params.append(k, String(v));
    }
    const qs = params.toString();
    if (qs) url += `?${qs}`;
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(authenticated ? await authHeaders() : {}),
  };

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const message = await parseError(res);
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export function sseUrl(service: ServiceName, path: string): string {
  return buildUrl(service, path);
}
