import api from './axios';
import type { File as FileType } from '../types/file';

export const uploadProviderFile = async (
  providerId: string,
  file: File,
  category: string,
  vehicleId?: string
) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('category', category);
  if (vehicleId) formData.append('vehicleId', vehicleId);

  return api.post(`/providers/${providerId}/files`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};


// Get all files for a provider
export const getProviderFiles = (providerId: string) =>
  api.get<FileType[]>(`/providers/${providerId}/files`);

// Delete a provider file
export const deleteProviderFile = (providerId: string, fileId: string) =>
  api.delete(`/providers/${providerId}/files/${fileId}`);