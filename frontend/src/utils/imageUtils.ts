import type { Vehicle } from "../types/vehicle";
import type { File as FileType } from "../types/file";

/**
 * Get the primary image URL for a vehicle
 * Handles both Cloudinary URLs and legacy local uploads
 */
export const getVehicleImageUrl = (vehicle?: Vehicle): string | null => {
  if (!vehicle) return null;

  // Check if vehicle has files (images)
  const brandingFiles = vehicle.files?.filter(
    (file: FileType) => file.category === "BRANDING" && file.type === "IMAGE"
  );

  if (brandingFiles && brandingFiles.length > 0) {
    // Get the most recent branding image
    const sortedFiles = [...brandingFiles].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    const imageUrl = sortedFiles[0].url;

    // If it's already a full Cloudinary URL, return it as-is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    // Legacy fallback for old local uploads
    return getImageUrl(imageUrl);
  }

  return null;
};

/**
 * Get all vehicle image URLs
 */
export const getVehicleImageUrls = (vehicle?: Vehicle): string[] => {
  if (!vehicle) return [];

  const brandingFiles = vehicle.files?.filter(
    (file: FileType) => file.category === "BRANDING" && file.type === "IMAGE"
  );

  if (!brandingFiles || brandingFiles.length === 0) return [];

  return brandingFiles
    .map((file) => {
      // If it's already a full Cloudinary URL, return it as-is
      if (file.url.startsWith('http://') || file.url.startsWith('https://')) {
        return file.url;
      }
      // Legacy fallback
      return getImageUrl(file.url);
    })
    .filter((url): url is string => url !== null);
};

/**
 * Get image URL for provider profile picture
 */
export const getProviderProfileImageUrl = (files?: FileType[]): string | null => {
  if (!files || files.length === 0) return null;

  const profilePic = files.find(
    (file) => file.category === "PROFILE_PIC" && file.type === "IMAGE"
  );

  if (!profilePic) return null;

  // If it's already a full Cloudinary URL, return it as-is
  if (profilePic.url.startsWith('http://') || profilePic.url.startsWith('https://')) {
    return profilePic.url;
  }

  // Legacy fallback
  return getImageUrl(profilePic.url);
};

/**
 * Generic image URL handler
 * Handles both Cloudinary URLs and legacy local uploads
 */
export const getImageUrl = (imagePath: string | undefined | null): string | null => {
  if (!imagePath) return null;

  // If it's already a full URL (Cloudinary or external), return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Legacy local file handling
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  
  // Clean the path
  let cleanPath = imagePath.replace(/\\/g, '/');
  cleanPath = cleanPath.replace(/^\/+/, '');
  cleanPath = cleanPath.replace(/^uploads\//, '');
  
  // URL encode each path segment
  const encodedPath = cleanPath
    .split('/')
    .map(segment => encodeURIComponent(segment))
    .join('/');
  
  return `${baseUrl}/uploads/${encodedPath}`;
};

/**
 * Get optimized Cloudinary image URL with transformations
 * Use this for thumbnails and responsive images
 */
export const getOptimizedImageUrl = (
  imageUrl: string | null,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    crop?: 'fill' | 'fit' | 'scale' | 'crop';
  }
): string | null => {
  if (!imageUrl) return null;

  // Only apply transformations to Cloudinary URLs
  if (!imageUrl.includes('cloudinary.com')) {
    return imageUrl;
  }

  try {
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const uploadIndex = pathParts.indexOf('upload');

    if (uploadIndex === -1) return imageUrl;

    // Build transformation string
    const transformations: string[] = [];
    
    if (options?.width) transformations.push(`w_${options.width}`);
    if (options?.height) transformations.push(`h_${options.height}`);
    if (options?.quality) transformations.push(`q_${options.quality}`);
    if (options?.crop) transformations.push(`c_${options.crop}`);
    
    // Add automatic format and quality optimization
    transformations.push('f_auto', 'q_auto');

    const transformationString = transformations.join(',');

    // Insert transformations after 'upload'
    pathParts.splice(uploadIndex + 1, 0, transformationString);

    url.pathname = pathParts.join('/');
    return url.toString();
  } catch (error) {
    console.error('Failed to optimize image URL:', error);
    return imageUrl;
  }
};

/**
 * Get thumbnail URL (optimized for cards and lists)
 */
export const getThumbnailUrl = (imageUrl: string | null): string | null => {
  return getOptimizedImageUrl(imageUrl, {
    width: 400,
    height: 300,
    quality: 80,
    crop: 'fill'
  });
};

/**
 * Get full-size optimized URL (for detail pages)
 */
export const getFullSizeUrl = (imageUrl: string | null): string | null => {
  return getOptimizedImageUrl(imageUrl, {
    width: 1200,
    quality: 85,
    crop: 'fit'
  });
};

/**
 * Check if a URL is a Cloudinary URL
 */
export const isCloudinaryUrl = (url: string): boolean => {
  return url.includes('cloudinary.com') || url.includes('res.cloudinary');
};

/**
 * Extract public ID from Cloudinary URL
 * Useful for deletion or transformation operations
 */
export const getCloudinaryPublicId = (url: string): string | null => {
  if (!isCloudinaryUrl(url)) return null;

  try {
    const urlParts = url.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    
    if (uploadIndex === -1) return null;

    // Get everything after 'upload/v123456789/'
    const pathAfterUpload = urlParts.slice(uploadIndex + 2).join('/');
    
    // Remove file extension
    const publicId = pathAfterUpload.replace(/\.[^/.]+$/, '');
    
    return publicId;
  } catch (error) {
    console.error('Failed to extract public ID:', error);
    return null;
  }
};