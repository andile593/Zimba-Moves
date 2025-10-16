import type { VehicleType } from "./enums";
import type { Booking } from "./booking";
import type { Quote } from "./quote";

export interface Vehicle {
  id?: string;
  providerId: string;
  type: VehicleType;
  capacity: number;
  weight: number;
  plate: string;
  baseRate: number;
  perKmRate?: number;
  createdAt?: string;
  updatedAt?: string;
  bookings?: Booking[];
  Quote?: Quote[];
  files?: {
    id: string;
    url: string; // Full URL or relative path
    category: string;
  }[];
}

export type CreateVehicleInput = {
  providerId: string;
  type: VehicleType;
  capacity: number;
  weight: number;
  plate: string;
  baseRate: number;
  perKmRate?: number;
};
