interface GeocodingResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
}

/**
 * Geocode an address using Google Maps Geocoding API
 */
export async function geocodeAddress(
  address: string,
  city?: string,
  region?: string,
  country?: string
): Promise<GeocodingResult | null> {
  try {
    // Build full address string
    const addressParts = [address, city, region, country].filter(Boolean);
    const fullAddress = addressParts.join(', ');

    if (!fullAddress.trim()) {
      console.error('No address provided for geocoding');
      return null;
    }

    // Google Maps Geocoding API
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.error('Google Maps API key not found. Add VITE_GOOGLE_MAPS_API_KEY to your .env file');
      return null;
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      fullAddress
    )}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0];
      const location = result.geometry.location;

      return {
        latitude: location.lat,
        longitude: location.lng,
        formattedAddress: result.formatted_address,
      };
    } else {
      console.error('Geocoding failed:', data.status, data.error_message);
      return null;
    }
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
}

/**
 * Reverse geocode coordinates to get address
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<string | null> {
  try {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.error('Google Maps API key not found');
      return null;
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      return data.results[0].formatted_address;
    }

    return null;
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return null;
  }
}

/**
 * Extract address components from geocoding result
 */
export function extractAddressComponents(result: any) {
  const components = result.address_components;
  
  const extracted = {
    street: '',
    city: '',
    region: '',
    country: '',
    postalCode: '',
  };

  for (const component of components) {
    const types = component.types;
    
    if (types.includes('street_number') || types.includes('route')) {
      extracted.street += component.long_name + ' ';
    }
    
    if (types.includes('locality') || types.includes('postal_town')) {
      extracted.city = component.long_name;
    }
    
    if (types.includes('administrative_area_level_1')) {
      extracted.region = component.long_name;
    }
    
    if (types.includes('country')) {
      extracted.country = component.long_name;
    }
    
    if (types.includes('postal_code')) {
      extracted.postalCode = component.long_name;
    }
  }

  return {
    ...extracted,
    street: extracted.street.trim(),
  };
}