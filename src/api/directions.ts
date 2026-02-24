import { decodePolyline, type LatLng } from "../utils/decodePolyline";

export type DirectionsRouteOption = {
  summary: string;
  distanceText: string;
  durationText: string;
  coordinates: LatLng[];
};

type DirectionsApiRoute = {
  summary?: string;
  overview_polyline?: { points: string };
  legs?: {
    distance?: { text?: string };
    duration?: { text?: string };
  }[];
};

type DirectionsApiResponse = {
  status: string;
  error_message?: string;
  routes?: DirectionsApiRoute[];
};

export type DirectionsOrigin = string | { latitude: number; longitude: number };

function originToParam(origin: DirectionsOrigin): string {
  if (typeof origin === "string") return origin;
  return `${origin.latitude},${origin.longitude}`;
}

export async function fetchDirectionsAlternatives(opts: {
  origin: DirectionsOrigin;
  destination: string;
  apiKey: string;
  maxRoutes?: number;
}): Promise<DirectionsRouteOption[]> {
  const { origin, destination, apiKey, maxRoutes = 3 } = opts;

  if (!apiKey) {
    throw new Error(
      "Missing Google Directions API key. Set EXPO_PUBLIC_GOOGLE_DIRECTIONS_API_KEY (or EXPO_PUBLIC_GOOGLE_MAPS_API_KEY) in .env.",
    );
  }
  if (!destination?.trim()) throw new Error("Destination is required");

  const originParam = encodeURIComponent(originToParam(origin));
  const destParam = encodeURIComponent(destination);
  const keyParam = encodeURIComponent(apiKey);

  const url =
    `https://maps.googleapis.com/maps/api/directions/json?origin=${originParam}` +
    `&destination=${destParam}` +
    `&mode=driving&alternatives=true&key=${keyParam}`;

  const res = await fetch(url);
  const data = (await res.json()) as DirectionsApiResponse;

  if (!res.ok) {
    throw new Error(
      data?.error_message || `Directions request failed (${res.status})`,
    );
  }

  if (!data || data.status !== "OK") {
    throw new Error(
      data?.error_message || `Directions error: ${data?.status || "UNKNOWN"}`,
    );
  }

  const routes = (data.routes ?? []).slice(0, maxRoutes);

  return routes
    .map((route) => {
      const leg = route.legs?.[0];
      const points = route.overview_polyline?.points ?? "";
      const coordinates = decodePolyline(points);

      return {
        summary: route.summary || "",
        distanceText: leg?.distance?.text || "",
        durationText: leg?.duration?.text || "",
        coordinates,
      } satisfies DirectionsRouteOption;
    })
    .filter((r) => r.coordinates.length > 0);
}
