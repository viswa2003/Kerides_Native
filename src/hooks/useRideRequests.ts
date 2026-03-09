import { useEffect, useRef, useState } from "react";
import {
  createRideRequestSSE,
  getPendingRideRequests,
  type PendingRideRequestsResponse,
  type RideRequest,
} from "../api/ride-requests";

export function useRideRequests(enabled: boolean) {
  const [requests, setRequests] = useState<RideRequest[]>([]);
  const [count, setCount] = useState(0);
  const sseRef = useRef<{ close: () => void } | null>(null);

  useEffect(() => {
    if (!enabled) {
      setRequests([]);
      setCount(0);
      return;
    }

    // Fetch once immediately
    getPendingRideRequests()
      .then((data) => {
        setRequests(data.requests);
        setCount(data.count);
      })
      .catch(() => {});

    // Open SSE stream
    sseRef.current = createRideRequestSSE(
      (data: PendingRideRequestsResponse) => {
        setRequests(data.requests);
        setCount(data.count);
      },
      () => {
        // On SSE error, fall back to polling
        const interval = setInterval(() => {
          getPendingRideRequests()
            .then((data) => {
              setRequests(data.requests);
              setCount(data.count);
            })
            .catch(() => {});
        }, 10000);
        return () => clearInterval(interval);
      },
    );

    return () => {
      sseRef.current?.close();
      sseRef.current = null;
    };
  }, [enabled]);

  return { requests, count };
}
