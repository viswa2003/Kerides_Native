import { request, sseUrl } from "./client";
import { getToken } from "../auth/session";

export type RideRequest = {
  _id: string;
  bookingId: string;
  driverId: string;
  status: string;
  estimatedDistance: number;
  estimatedArrivalTime: number;
  expiresAt: string;
  booking?: {
    origin: { address: string; coordinates: { lat: number; lng: number } };
    destination: { address: string; coordinates: { lat: number; lng: number } };
    fare: number;
    distance: { text: string; value: number };
    duration: { text: string; value: number };
  };
};

export type PendingRideRequestsResponse = {
  count: number;
  requests: RideRequest[];
};

export function getPendingRideRequests(): Promise<PendingRideRequestsResponse> {
  return request({ service: "booking", path: "/ride-requests/pending" });
}

export function createRideRequestSSE(
  onData: (data: PendingRideRequestsResponse) => void,
  onError?: (err: unknown) => void,
): { close: () => void } {
  let controller: AbortController | null = new AbortController();

  (async () => {
    const token = await getToken();
    const url = sseUrl("booking", "/ride-requests/stream");

    try {
      const res = await fetch(url, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          Accept: "text/event-stream",
        },
        signal: controller?.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error(`SSE connection failed (${res.status})`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (line.startsWith("data:")) {
            try {
              const json = JSON.parse(line.slice(5).trim());
              onData(json);
            } catch {
              // skip malformed events
            }
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      onError?.(err);
    }
  })();

  return {
    close() {
      controller?.abort();
      controller = null;
    },
  };
}
