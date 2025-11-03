import api from './axios';
import type { File as FileType } from '../types/file';

/**
 * Upload a file to Cloudinary via backend
 */
export const uploadProviderFile = async (
  providerId: string,
  file: File,
  category: string,
  vehicleId?: string
): Promise<FileType> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('category', category);
  if (vehicleId) {
    formData.append('vehicleId', vehicleId);
  }

  const response = await api.post<{ file: FileType }>(
    `/providers/${providerId}/files`, 
    formData, 
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );
  
  return response.data.file;
};

/**
 * Get all files for a provider
 */
export const getProviderFiles = async (providerId: string): Promise<FileType[]> => {
  const response = await api.get<FileType[]>(`/providers/${providerId}/files`);
  return response.data;
};

/**
 * Delete a provider file (also deletes from Cloudinary)
 */
export const deleteProviderFile = async (
  providerId: string, 
  fileId: string
): Promise<void> => {
  await api.delete(`/providers/${providerId}/files/${fileId}`);
};

/**
 * Get image URL - Since we're using Cloudinary, URLs are already complete
 */
export const getImageUrl = (imagePath: string | undefined | null): string | null => {
  if (!imagePath) return null;

  // If it's already a full Cloudinary URL, return it as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Fallback for local development or old URLs
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const cleanPath = imagePath.replace(/\\/g, '/').replace(/^\/+/, '');
  const encodedPath = cleanPath
    .split('/')
    .map(segment => encodeURIComponent(segment))
    .join('/');
  
  return `${baseUrl}/uploads/${encodedPath}`;
};