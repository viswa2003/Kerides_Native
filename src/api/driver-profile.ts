import { request } from "./client";

export type DriverProfile = {
  _id: string;
  accountId: string;
  licenseNumber: string;
  bloodGroup?: string;
  dob?: string;
  languages?: string[];
  experienceYears?: number;
  rating?: number;
  totalTrips?: number;
  isOnline?: boolean;
  isVerified?: boolean;
  latitude?: number;
  longitude?: number;
  profileImage?: string;
  drivingLicenseCertificate?: string;
  policeClearanceCertificate?: string;
  medicalFitnessCertificate?: string;
  addressProof?: string;
  professionalTrainingCertificate?: string;
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  vehicle?: Vehicle;
};

export type Vehicle = {
  _id: string;
  driverId: string;
  make: string;
  vehicleModel: string;
  year?: number;
  registrationNumber: string;
  type: string;
  seatingCapacity?: number;
  color?: string;
  isActive?: boolean;
};

export type CreateDriverProfileRequest = {
  licenseNumber: string;
  bloodGroup?: string;
  dob?: string;
  languages?: string[];
  experienceYears?: number;
};

export type UpdateDriverProfileRequest = {
  licenseNumber?: string;
  bloodGroup?: string;
  dob?: string;
  languages?: string[];
  experienceYears?: number;
  profileImage?: string;
  drivingLicenseCertificate?: string;
  policeClearanceCertificate?: string;
  medicalFitnessCertificate?: string;
  addressProof?: string;
  professionalTrainingCertificate?: string;
};

export function createDriverProfile(data: CreateDriverProfileRequest): Promise<DriverProfile> {
  return request({ service: "driver", path: "/driver-profiles", method: "POST", body: data });
}

export function getMyDriverProfile(): Promise<DriverProfile> {
  return request({ service: "driver", path: "/driver-profiles/me" });
}

export function updateMyDriverProfile(data: UpdateDriverProfileRequest): Promise<DriverProfile> {
  return request({ service: "driver", path: "/driver-profiles/me", method: "PUT", body: data });
}

export function updateProfileImage(profileImage: string): Promise<{ success: boolean; profileImage: string }> {
  return request({ service: "driver", path: "/driver-profiles/me/profile-image", method: "PATCH", body: { profileImage } });
}

export function updateOnlineStatus(isOnline: boolean): Promise<DriverProfile> {
  return request({ service: "driver", path: "/driver-profiles/me/online-status", method: "PATCH", body: { isOnline } });
}

export function updateDriverLocation(
  latitude: number,
  longitude: number,
  isOnline?: boolean,
): Promise<{ success: boolean; latitude: number; longitude: number; isOnline: boolean }> {
  return request({
    service: "driver",
    path: "/driver-profiles/me/location",
    method: "PATCH",
    body: { latitude, longitude, isOnline },
  });
}

export function getAvailableDrivers(vehicleType?: string): Promise<DriverProfile[]> {
  return request({
    service: "driver",
    path: "/driver-profiles/available",
    query: { vehicleType },
  });
}

export function deleteMyDriverProfile(): Promise<void> {
  return request({ service: "driver", path: "/driver-profiles/me", method: "DELETE" });
}
