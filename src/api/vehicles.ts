import { request } from "./client";

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
  fareStructure?: {
    perKilometerRate?: number;
    waitingChargePerMinute?: number;
  };
};

export type CreateVehicleRequest = {
  make: string;
  vehicleModel: string;
  year?: number;
  registrationNumber: string;
  type: string;
  seatingCapacity?: number;
  color?: string;
  fareStructure?: {
    perKilometerRate?: number;
    waitingChargePerMinute?: number;
  };
};

export type UpdateVehicleRequest = Partial<CreateVehicleRequest>;

export function createVehicle(data: CreateVehicleRequest): Promise<Vehicle> {
  return request({ service: "driver", path: "/vehicles", method: "POST", body: data });
}

export function getMyVehicles(): Promise<Vehicle[]> {
  return request({ service: "driver", path: "/vehicles/my-vehicles" });
}

export function getVehicleById(id: string): Promise<Vehicle> {
  return request({ service: "driver", path: `/vehicles/${encodeURIComponent(id)}` });
}

export function updateVehicle(id: string, data: UpdateVehicleRequest): Promise<Vehicle> {
  return request({ service: "driver", path: `/vehicles/${encodeURIComponent(id)}`, method: "PUT", body: data });
}

export function deactivateVehicle(id: string): Promise<Vehicle> {
  return request({ service: "driver", path: `/vehicles/${encodeURIComponent(id)}/deactivate`, method: "PATCH" });
}
