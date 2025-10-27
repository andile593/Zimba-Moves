import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getPayments,
  getPaymentById,
  initiatePayment,
  verifyPayment,
  requestRefund,
  deletePayment,
} from "../services/paymentApi";
import type { Payment } from "../types/payment";

export function usePayments() {
  return useQuery<Payment[]>({
    queryKey: ["payments"],
    queryFn: async () => {
      const res = await getPayments();
      return res.data;
    },
  });
}

export const usePayment = (id: string) => {
  return useQuery<Payment>({
    queryKey: ["payment", id],
    queryFn: async () => {
      const res = await getPaymentById(id);
      return res.data;
    },
    enabled: !!id,
  });
};

export function useInitiatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: initiatePayment,
    onMutate: () => toast.loading("Starting payment..."),
    onSuccess: (response) => {
      toast.dismiss();
      const paymentData = response.data;
      toast.success("Redirecting to payment gateway...");
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      if (paymentData.authorizationUrl) {
        window.location.href = paymentData.authorizationUrl;
      }
    },
    onError: (err: any) => {
      toast.dismiss();
      toast.error("Payment initiation failed.");
      console.error(err);
    },
  });
}

export function useVerifyPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: verifyPayment,
    onMutate: () => toast.loading("Verifying payment..."),
    onSuccess: (response, { id }) => {
      toast.dismiss();
      const verifiedPayment = response.data;
      toast.success("Payment verified!");
      queryClient.setQueryData(["payment", id], verifiedPayment);
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
    onError: (err: any) => {
      toast.dismiss();
      toast.error("Verification failed.");
      console.error(err);
    },
  });
}

export function useRequestRefund() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: requestRefund,
    onMutate: () => toast.loading("Initiating refund..."),
    onSuccess: (response, { id }) => {
      toast.dismiss();
      toast.success("Refund initiated successfully!");
      queryClient.setQueryData(["payment", id], response.data);
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
    onError: (err: any) => {
      toast.dismiss();
      toast.error("Refund failed to initiate.");
      console.error(err);
    },
  });
}

export function useDeletePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePayment,
    onMutate: () => toast.loading("Deleting payment record..."),
    onSuccess: (_, { id }) => {
      toast.dismiss();
      toast.success("Payment deleted.");
      queryClient.removeQueries({ queryKey: ["payment", id] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
    onError: (err: any) => {
      toast.dismiss();
      toast.error("Failed to delete payment record.");
      console.error(err);
    },
  });
}
