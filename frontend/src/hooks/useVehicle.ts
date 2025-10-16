import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from "../services/vehicleApi";
import type { Vehicle } from "../types/vehicle";

export function useVehicles() {
  return useQuery<Vehicle[]>({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const res = await getVehicles();
      return res.data;
    },
  });
}

export const useVehicle = (id: string) => {
  return useQuery<Vehicle>({
    queryKey: ["vehicle", id],
    queryFn: async () => {
      const res = await getVehicleById(id);
      return res.data;
    },
    enabled: !!id,
  });
};

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createVehicle,
    onMutate: () => toast.loading("Adding vehicle..."),
    onSuccess: (response) => {
      const newVehicle = response.data;
      toast.dismiss();
      toast.success("Vehicle added!");
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.setQueryData(["vehicle", newVehicle.id], newVehicle);
    },
    onError: (err: any) => {
      toast.dismiss();
      toast.error("Failed to add vehicle.");
      console.error(err);
    },
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateVehicle,
    onMutate: () => toast.loading("Updating vehicle..."),
    onSuccess: (response, { id }) => {
      const updatedVehicle = response.data;
      toast.dismiss();
      toast.success("Vehicle updated!");
      queryClient.setQueryData(["vehicle", id], updatedVehicle);
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
    onError: (err: any) => {
      toast.dismiss();
      toast.error("Failed to update vehicle.");
      console.error(err);
    },
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteVehicle,
    onMutate: () => toast.loading("Deleting vehicle..."),
    onSuccess: (_, { id }) => {
      toast.dismiss();
      toast.success("Vehicle deleted.");
      queryClient.removeQueries({ queryKey: ["vehicle", id] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
    onError: (err: any) => {
      toast.dismiss();
      toast.error("Failed to delete vehicle.");
      console.error(err);
    },
  });
}
