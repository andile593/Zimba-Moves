import type { RefundStatus } from "./enums";

export interface Refund {
  id?: string;
  paymentId: string;
  amount: number;
  gateway: string; // 'PAYSTACK' | 'OZOW'
  gatewayRef?: string;
  status?: RefundStatus;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateRefundInput = {
  paymentId: string;
  amount: number;
  gateway: string;
  gatewayRef?: string;
};
