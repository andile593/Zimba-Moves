import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getProviders,
  getProviderById,
  createProvider,
  updateProvider,
  deleteProvider,
} from "../services/providerApi";
import type { Provider } from "../types/provider";

export function useProviders() {
  return useQuery<Provider[]>({
    queryKey: ["providers"],
    queryFn: async () => {
      const res = await getProviders();
      return res.data;
    },
  });
}

export const useProvider = (id: string) => {
  return useQuery<Provider>({
    queryKey: ["provider", id],
    queryFn: async () => {
      const res = await getProviderById(id);
      return res.data;
    },
    enabled: !!id,
  });
};

export function useCreateProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProvider,
    onMutate: () => toast.loading("Creating provider..."),
    onSuccess: (response) => {
      const newProvider = response.data;
      toast.dismiss();
      toast.success("Provider created successfully!");
      queryClient.invalidateQueries({ queryKey: ["providers"] });
      queryClient.setQueryData(["provider", newProvider.id], newProvider);
    },
    onError: (err: any) => {
      toast.dismiss();
      toast.error("Failed to create provider.");
      console.error(err);
    },
  });
}

export function useUpdateProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProvider,
    onMutate: () => toast.loading("Updating provider..."),
    onSuccess: (response, { id }) => {
      const updatedProvider = response.data;
      toast.dismiss();
      toast.success("Provider updated!");
      queryClient.setQueryData(["provider", id], updatedProvider);
      queryClient.invalidateQueries({ queryKey: ["providers"] });
    },
    onError: (err: any) => {
      toast.dismiss();
      toast.error("Failed to update provider.");
      console.error(err);
    },
  });
}

export function useDeleteProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProvider,
    onMutate: () => toast.loading("Deleting provider..."),
    onSuccess: (_, { id }) => {
      toast.dismiss();
      toast.success("Provider deleted.");
      queryClient.removeQueries({ queryKey: ["provider", id] });
      queryClient.invalidateQueries({ queryKey: ["providers"] });
    },
    onError: (err: any) => {
      toast.dismiss();
      toast.error("Failed to delete provider.");
      console.error(err);
    },
  });
}
