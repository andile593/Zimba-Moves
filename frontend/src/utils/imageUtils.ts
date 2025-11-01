export const getImageUrl = (imagePath: string | undefined | null): string | null => {
  if (!imagePath) return null;

  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  
  let cleanPath = imagePath
    .replace(/\\/g, '/')
    .replace(/^uploads\//, '')
    .replace(/^\/+/, '');
  
  const encodedPath = cleanPath
    .split('/')
    .map(segment => encodeURIComponent(segment))
    .join('/');
  
  return `${baseUrl}/uploads/${encodedPath}`;
};

export const getVehicleImageUrl = (vehicle: any): string | null => {
  const imagePath = vehicle?.files?.[0]?.url;
  return getImageUrl(imagePath);
};