import type { MoveType, HelpersSource, BookingStatus, PaymentStatus } from "./enums";
import type { Provider } from "./provider";
import type { Vehicle } from "./vehicle";
import type { User } from "./user";

export interface Booking {
  id?: string;
  customerId: string;
  providerId: string;
  vehicleId: string;
  pickup: string;
  dropoff: string;
  moveType: MoveType;
  dateTime: string;
  helpersRequired?: number;
  helpersProvidedBy?: HelpersSource;
  status?: BookingStatus;
  pricing: Record<string, any>;
  paymentStatus?: PaymentStatus;
  createdAt?: string;
  updatedAt?: string;

  provider?: Provider;
  vehicle?: Vehicle;
  customer?: User;
}


export type CreateBookingInput = {
  customerId: string;
  providerId: string;
  vehicleId: string;
  pickup: string;
  dropoff: string;
  moveType: MoveType;
  dateTime: string;
  helpersRequired?: number;
  pricing: Record<string, any>;
};
