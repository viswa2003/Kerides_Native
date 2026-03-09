import { request } from "./client";

export type BookingStatus =
  | "PENDING"
  | "ACCEPTED"
  | "DRIVER_ARRIVED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type PaymentMethod = "CASH" | "CARD" | "UPI";

export type BookingLocation = {
  address: string;
  coordinates: { lat: number; lng: number };
};

export type BookingMetric = {
  text: string;
  value: number;
};

export type FareBreakdown = {
  baseFare: number;
  distanceFare: number;
  timeFare: number;
  surgeFare: number;
  total: number;
};

export type Booking = {
  _id: string;
  userId: string;
  driverId: string | null;
  vehicleId: string | null;
  vehicleType: string | null;
  origin: BookingLocation;
  destination: BookingLocation;
  distance: BookingMetric;
  duration: BookingMetric;
  fare: number;
  fareBreakdown: FareBreakdown;
  status: BookingStatus;
  paymentMethod: PaymentMethod;
  scheduledAt: string | null;
  expiresAt: string | null;
  rating?: number;
  review?: string;
  otp?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateBookingRequest = {
  origin: BookingLocation;
  destination: BookingLocation;
  distance: BookingMetric;
  duration: BookingMetric;
  vehicleId?: string;
  driverId?: string;
  vehicleType?: string;
  paymentMethod?: PaymentMethod;
  scheduledAt?: string;
  notes?: string;
};

export type CreateBookingResponse = {
  bookingId: string;
  status: BookingStatus;
  fare: number;
  fareBreakdown: FareBreakdown;
  expiresAt: string;
  driversNotified: number;
};

export type EstimateFareRequest = {
  distanceInMeters: number;
  durationInSeconds: number;
  vehicleId?: string;
  vehicleType?: string;
};

export type FareEstimate = {
  estimatedFare: number;
  fareBreakdown: FareBreakdown;
  vehicleType: string;
};

export type NearbyDriver = {
  accountId: string;
  fullName: string;
  phoneNumber: string;
  rating: number;
  distance: number;
  estimatedArrival: number;
  vehicle: {
    _id: string;
    make: string;
    vehicleModel: string;
    type: string;
    color: string;
    registrationNumber: string;
  } | null;
};

export function createBooking(data: CreateBookingRequest): Promise<CreateBookingResponse> {
  return request({ service: "booking", path: "/bookings", method: "POST", body: data });
}

export function estimateFare(data: EstimateFareRequest): Promise<FareEstimate> {
  return request({ service: "booking", path: "/bookings/estimate-fare", method: "POST", body: data });
}

export function findNearbyDrivers(
  pickupLat: number,
  pickupLng: number,
  radiusKm?: number,
  limit?: number,
  vehicleType?: string,
): Promise<{ drivers: NearbyDriver[]; count: number }> {
  return request({
    service: "booking",
    path: "/bookings/nearby-drivers",
    query: { pickupLat, pickupLng, radiusKm, limit, vehicleType },
  });
}

export function getMyBookings(): Promise<Booking[]> {
  return request({ service: "booking", path: "/bookings/my-bookings" });
}

export function getDriverBookings(): Promise<Booking[]> {
  return request({ service: "booking", path: "/bookings/driver/my-bookings" });
}

export function getPendingBookings(): Promise<Booking[]> {
  return request({ service: "booking", path: "/bookings/pending" });
}

export function getBookingById(bookingId: string): Promise<Booking> {
  return request({ service: "booking", path: `/bookings/${encodeURIComponent(bookingId)}` });
}

export function updateBookingStatus(
  bookingId: string,
  status: BookingStatus,
): Promise<Booking> {
  return request({
    service: "booking",
    path: `/bookings/${encodeURIComponent(bookingId)}/status`,
    method: "PATCH",
    body: { status },
  });
}

export function acceptBooking(bookingId: string): Promise<Booking> {
  return request({
    service: "booking",
    path: `/bookings/${encodeURIComponent(bookingId)}/accept`,
    method: "POST",
  });
}

export function rejectBooking(bookingId: string): Promise<Booking> {
  return request({
    service: "booking",
    path: `/bookings/${encodeURIComponent(bookingId)}/reject`,
    method: "POST",
  });
}

export function generateOtp(bookingId: string): Promise<{ message: string }> {
  return request({
    service: "booking",
    path: `/bookings/${encodeURIComponent(bookingId)}/generate-otp`,
    method: "POST",
  });
}

export function verifyOtp(bookingId: string, otp: string): Promise<Booking> {
  return request({
    service: "booking",
    path: `/bookings/${encodeURIComponent(bookingId)}/verify-otp`,
    method: "POST",
    body: { otp },
  });
}

export function rateBooking(
  bookingId: string,
  rating: number,
  review?: string,
): Promise<Booking> {
  return request({
    service: "booking",
    path: `/bookings/${encodeURIComponent(bookingId)}/rate`,
    method: "POST",
    body: { rating, review },
  });
}
