
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
  if (vehicleId) {
    formData.append('vehicleId', vehicleId);
  }

  const response = await api.post(`/providers/${providerId}/files`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  
  return response;
};

// Get all files for a provider
export const getProviderFiles = (providerId: string) =>
  api.get<FileType[]>(`/providers/${providerId}/files`);

// Delete a provider file
export const deleteProviderFile = (providerId: string, fileId: string) =>
  api.delete(`/providers/${providerId}/files/${fileId}`);

/**
 * Centralized function to construct proper image URLs
 * This ensures consistent URL formatting across the entire app
 */
export const getImageUrl = (imagePath: string | undefined | null): string | null => {
  if (!imagePath) return null;

  // If it's already a full URL, return it
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  
  // Clean the path:
  // 1. Replace all backslashes with forward slashes
  let cleanPath = imagePath.replace(/\\/g, '/');
  
  // 2. Remove leading slashes
  cleanPath = cleanPath.replace(/^\/+/, '');
  
  // 3. Remove 'uploads/' prefix if it exists (we'll add it back consistently)
  cleanPath = cleanPath.replace(/^uploads\//, '');
  
  // 4. URL encode each path segment to handle spaces and special characters
  const encodedPath = cleanPath
    .split('/')
    .map(segment => encodeURIComponent(segment))
    .join('/');
  
  // 5. Construct the final URL with a single 'uploads/' prefix
  return `${baseUrl}/uploads/${encodedPath}`;
};