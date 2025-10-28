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

export interface PaymentCard {
  id: string;
  accountNumber: string;
  accountName: string;
  bankCode: string;
  bankName: string;
  isDefault: boolean;
  recipientCode: string;
}
