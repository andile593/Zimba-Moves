import api from './axios';
import type { Vehicle, CreateVehicleInput } from '../types/vehicle';

// Get all vehicles for a provider
export const getVehiclesByProvider = (providerId: string) => 
  api.get<Vehicle[]>(`/providers/${providerId}/vehicles`);

// Get all vehicles (if needed globally)
export const getVehicles = () => api.get<Vehicle[]>('/vehicles');

// Get single vehicle by ID
export const getVehicleById = (id: string) => 
  api.get<Vehicle>(`/vehicles/${id}`);

// Create a new vehicle for a provider
export const createVehicle = (data: CreateVehicleInput) =>
  api.post<Vehicle>(`/providers/${data.providerId}/vehicles`, data);

// Update vehicle
export type UpdateVehicleInput = { id: string; vehicle: Partial<Vehicle> };
export const updateVehicle = ({ id, vehicle }: UpdateVehicleInput) =>
  api.put<Vehicle>(`/vehicles/${id}`, vehicle);

// Delete vehicle
export type DeleteVehicleInput = { id: string };
export const deleteVehicle = ({ id }: DeleteVehicleInput) =>
  api.delete(`/vehicles/${id}`);