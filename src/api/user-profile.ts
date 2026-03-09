import { request } from "./client";

export type UserProfile = {
  _id: string;
  accountId: string;
  address?: string;
  addressDetails?: {
    city?: string;
    state?: string;
    pincode?: string;
  };
  preferences?: string[];
  image?: string;
};

export type CreateUserProfileRequest = {
  address?: string;
  addressDetails?: {
    city?: string;
    state?: string;
    pincode?: string;
  };
  preferences?: string[];
  image?: string;
};

export type UpdateUserProfileRequest = Partial<CreateUserProfileRequest>;

export function createUserProfile(data: CreateUserProfileRequest): Promise<UserProfile> {
  return request({ service: "user", path: "/profiles", method: "POST", body: data });
}

export function getMyProfile(): Promise<UserProfile> {
  return request({ service: "user", path: "/profiles/me" });
}

export function updateMyProfile(data: UpdateUserProfileRequest): Promise<UserProfile> {
  return request({ service: "user", path: "/profiles/me", method: "PUT", body: data });
}

export function deleteMyProfile(): Promise<void> {
  return request({ service: "user", path: "/profiles/me", method: "DELETE" });
}
