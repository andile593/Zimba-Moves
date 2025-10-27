import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
} from "../services/bookingApi";
import type { Booking } from "../types/booking";
import type {
  UpdateBookingInput,
  DeleteBookingInput,
} from "../services/bookingApi";

export function useBookings() {
  return useQuery<Booking[]>({
    queryKey: ["bookings"],
    queryFn: async () => {
      const res = await getBookings();
      return res.data;
    },
  });
}

export function useBooking(id: string) {
  return useQuery<Booking>({
    queryKey: ["booking", id],
    queryFn: async () => {
      const res = await getBookingById(id);
      return res.data;
    },
    enabled: !!id,
  });
}

// New hook for fetching bookings by provider
export function useProviderBookings(providerId: string) {
  return useQuery<Booking[]>({
    queryKey: ["bookings", "provider", providerId],
    queryFn: async () => {
      const res = await getBookings();
      // Filter bookings where the providerId matches
      return res.data.filter(
        (booking: Booking) => booking.providerId === providerId
      );
    },
    enabled: !!providerId,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBooking,
    onMutate: () => {
      toast.loading("Creating booking...");
    },
    onSuccess: (response) => {
      const newBooking = response.data;
      toast.dismiss();
      toast.success("Booking created successfully!");
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.setQueryData(["booking", newBooking.id], newBooking);
    },

    onError: (err: any) => {
      toast.dismiss();
      toast.error("Failed to create booking");
      console.error(err);
    },
  });
}

export function useUpdateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateBookingInput) => updateBooking(input),
    onMutate: async ({ id, booking }) => {
      toast.loading("Updating booking...");

      await queryClient.cancelQueries({ queryKey: ["bookings"] });
      const previousBookings = queryClient.getQueryData<Booking[]>([
        "bookings",
      ]);

      // Update in all bookings list
      queryClient.setQueryData(["bookings"], (old: Booking[] | undefined) =>
        old
          ? old.map((b) => (b.id === id ? { ...b, ...booking } : b))
          : undefined
      );

      // Update in specific booking query
      queryClient.setQueryData(["booking", id], (old: Booking | undefined) =>
        old ? { ...old, ...booking } : undefined
      );

      return { previousBookings };
    },
    onSuccess: (response, { id }) => {
      const updatedBooking = response.data;
      toast.dismiss();
      toast.success("Booking updated!");
      queryClient.setQueryData(["booking", id], updatedBooking);
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", "provider"] });
    },

    onError: (err, _, context: any) => {
      toast.dismiss();
      toast.error("Failed to update booking");
      console.error(err);
      if (context?.previousBookings) {
        queryClient.setQueryData(["bookings"], context.previousBookings);
      }
    },
  });
}

export function useDeleteBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: DeleteBookingInput) => deleteBooking(input),
    onMutate: async ({ id }) => {
      toast.loading("Deleting booking...");

      await queryClient.cancelQueries({ queryKey: ["bookings"] });
      const previousBookings = queryClient.getQueryData<Booking[]>([
        "bookings",
      ]);

      queryClient.setQueryData(["bookings"], (old: Booking[] | undefined) =>
        old ? old.filter((b) => b.id !== id) : []
      );

      return { previousBookings };
    },
    onSuccess: (_, { id }) => {
      toast.dismiss();
      toast.success("Booking deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.removeQueries({ queryKey: ["booking", id] });
    },
    onError: (err, _vars, context: any) => {
      toast.dismiss();
      toast.error("Failed to delete booking");
      console.error(err);
      if (context?.previousBookings) {
        queryClient.setQueryData(["bookings"], context.previousBookings);
      }
    },
  });
}
