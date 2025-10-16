import api from "./axios";
import type { Booking, CreateBookingInput } from "../types";

export const getBookings = () => api.get<Booking[]>('./bookings');
export const getBookingById = (id: string) => api.get<Booking>(`/bookings/${id}`);
export const createBooking = (booking: CreateBookingInput) => api.post<Booking>("/bookings", booking);

export type UpdateBookingInput = { id: string; booking: Partial<Booking> }
export const updateBooking = ({ id, booking }: UpdateBookingInput) =>
  api.put(`/bookings/${id}`, booking);

export type DeleteBookingInput = { id: string };
export const deleteBooking = ({ id }: DeleteBookingInput) =>
  api.delete(`/bookings/${id}`);