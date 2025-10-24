import api from "./axios";
import type { Payment } from "../types/payment";

export const getPayments = () => api.get<Payment[]>("/payments");

export const getPaymentById = (id: string) => api.get<Payment>(`/payments/${id}`);

export const initiatePayment = (data: { bookingId: string }) =>
    api.post(`/payments/${data.bookingId}/pay`);

export const verifyPayment = ({ id }: { id: string }) =>
    api.get(`/payments/${id}/verify`);

export const requestRefund = ({ id }: { id: string }) =>
    api.post(`/payments/${id}/refund`);

export const deletePayment = ({ id }: { id: string }) =>
    api.delete(`/payments/${id}`);