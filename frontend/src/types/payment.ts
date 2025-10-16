import type { PaymentStatus } from "./enums";

export interface Payment {
  id?: string;
  bookingId: string;
  amount: number;
  status?: PaymentStatus;
  providerId?: string;
  gatewayReference?: string;
  refundReference?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CreatePaymentInput = {
  bookingId: string;
  amount: number;
  providerId?: string;
};
