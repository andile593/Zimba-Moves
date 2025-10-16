import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getQuotes,
  getQuoteById,
  createQuote,
  updateQuote,
  deleteQuote,
} from "../services/quoteApi";
import type { Quote } from "../types/quote";

export function useQuotes() {
  return useQuery<Quote[]>({
    queryKey: ["quotes"],
    queryFn: async () => {
      const res = await getQuotes();
      return res.data;
    },
  });
}

export const useQuote = (id: string) => {
  return useQuery<Quote>({
    queryKey: ["quote", id],
    queryFn: async () => {
      const res = await getQuoteById(id);
      return res.data;
    },
    enabled: !!id,
  });
};

export function useCreateQuote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createQuote,
    onMutate: () => toast.loading("Generating quote..."),
    onSuccess: (response) => {
      const newQuote = response.data;
      toast.dismiss();
      toast.success("Quote created!");
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      queryClient.setQueryData(["quote", newQuote.id], newQuote);
    },
    onError: (err: any) => {
      toast.dismiss();
      toast.error("Failed to create quote.");
      console.error(err);
    },
  });
}

export function useUpdateQuote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateQuote,
    onMutate: () => toast.loading("Updating quote..."),
    onSuccess: (response, { id }) => {
      const updatedQuote = response.data;
      toast.dismiss();
      toast.success("Quote updated!");
      queryClient.setQueryData(["quote", id], updatedQuote);
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
    },
    onError: (err: any) => {
      toast.dismiss();
      toast.error("Failed to update quote.");
      console.error(err);
    },
  });
}

export function useDeleteQuote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteQuote,
    onMutate: () => toast.loading("Deleting quote..."),
    onSuccess: (_, { id }) => {
      toast.dismiss();
      toast.success("Quote deleted.");
      queryClient.removeQueries({ queryKey: ["quote", id] });
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
    },
    onError: (err: any) => {
      toast.dismiss();
      toast.error("Failed to delete quote.");
      console.error(err);
    },
  });
}
