import { request } from "./client";

export type LocationRecord = {
  _id: string;
  accountId: string;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  address?: string;
  lastUpdatedAt: string;
};

export type SaveLocationRequest = {
  coordinates: [number, number];
  address?: string;
};

export function saveLocation(data: SaveLocationRequest): Promise<LocationRecord> {
  return request({ service: "user", path: "/locations", method: "POST", body: data });
}

export function getMyLocation(): Promise<LocationRecord> {
  return request({ service: "user", path: "/locations/me" });
}

export function findNearbyLocations(
  lng: number,
  lat: number,
  radius?: number,
): Promise<LocationRecord[]> {
  return request({
    service: "user",
    path: "/locations/nearby",
    query: { lng, lat, radius },
  });
}
