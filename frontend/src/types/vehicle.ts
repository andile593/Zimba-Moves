import type { VehicleType } from "./enums";
import type { Booking } from "./booking";
import type { Quote } from "./quote";
import type { File as FileType } from "./file";


export interface Vehicle {
  id?: string;
  providerId: string;
  make: string;
  model: string;
  year: number;
  color: string;
  type: VehicleType;
  capacity: number;
  weight: number;
  plate: string;
  baseRate: number;
  perKmRate: number;
  loadFee?: number;
  minimumCharge?: number;
  createdAt?: string;
  updatedAt?: string;
  bookings?: Booking[];
  Quote?: Quote[];
  files?: FileType[];
}

export type CreateVehicleInput = {
  providerId: string;
  make: string;
  model: string;
  year: number;
  color: string;
  type: VehicleType;
  capacity: number;
  weight: number;
  plate: string;
  baseRate: number;
  perKmRate: number;
  loadFee?: number;
  minimumCharge?: number;
};