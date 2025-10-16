import type { MoveType, QuoteStatus } from "./enums";

export interface Quote {
  id?: string;
  customerId: string;
  providerId: string;
  vehicleId: string;
  pickup: string;
  dropoff: string;
  moveType: MoveType;
  helpersNeeded?: number;
  instantEstimate: number;
  status?: QuoteStatus;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateQuoteInput = {
  customerId: string;
  providerId: string;
  vehicleId: string;
  pickup: string;
  dropoff: string;
  moveType: MoveType;
  helpersNeeded?: number;
};
