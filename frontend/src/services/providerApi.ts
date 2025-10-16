import api from './axios';
import type { Provider, CreateProviderInput } from '../types';

// Public endpoint - no auth required
export const getProviders = () => api.get<Provider[]>('/providers');

// Public endpoint - no auth required
export const getProviderById = (id: string) => api.get<Provider>(`/providers/${id}`);

export const getProviderProfile = () =>
  api.get<Provider>("/providers/me/profile");

export const updateProviderProfile = (provider: Partial<Provider>) =>
  api.put<Provider>("/providers/me/profile", provider);


// Public endpoint - search providers
export const searchProviders = (filters: any) => 
  api.get<Provider[]>('/providers/search', { params: filters });

// Protected endpoints - auth required
export const createProvider = (provider: CreateProviderInput) => 
  api.post<Provider>('/providers', provider);

export type UpdateProviderInput = { id: string; provider: Partial<Provider> };
export const updateProvider = ({ id, provider }: UpdateProviderInput) =>
  api.put(`/providers/${id}`, provider);

export type DeleteProviderInput = { id: string };
export const deleteProvider = ({ id }: DeleteProviderInput) =>
  api.delete(`/providers/${id}`);