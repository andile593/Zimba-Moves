interface GeocodingResult {
  latitude: number;
  longitude: number;
  displayName?: string;
  formattedAddress?: string;
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

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

/**
 * Geocode an address using Google Maps Geocoding API
 */
export async function geocodeAddress(
  address: string,
  city: string,
  region?: string,
  country?: string
): Promise<GeocodingResult | null> {
  try {
    if (!GOOGLE_MAPS_API_KEY) {
      console.error("Google Maps API key not configured");
      return null;
    }

    // Build the query string
    const parts = [address, city, region, country].filter(Boolean);
    const query = parts.join(", ");

    // Google Maps Geocoding API endpoint
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      query
    )}&key=${GOOGLE_MAPS_API_KEY}&region=za`; // ZA = South Africa

    const response = await fetch(url);

    if (!response.ok) {
      console.error("Google Maps API error:", response.statusText);
      return null;
    }

    const data = await response.json();

    if (data.status !== "OK") {
      console.warn("Google Maps geocoding failed:", data.status, data.error_message);
      return null;
    }

    if (!data.results || data.results.length === 0) {
      console.warn("No geocoding results found for:", query);
      return null;
    }

    const result = data.results[0];
    const location = result.geometry.location;

    return {
      latitude: location.lat,
      longitude: location.lng,
      displayName: result.formatted_address,
      formattedAddress: result.formatted_address,
    };
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

/**
 * Reverse geocode coordinates to get address information using Google Maps
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<any | null> {
  try {
    if (!GOOGLE_MAPS_API_KEY) {
      console.error("Google Maps API key not configured");
      return null;
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      console.error("Google Maps reverse geocoding API error:", response.statusText);
      return null;
    }

    const data = await response.json();

    if (data.status !== "OK" || !data.results || data.results.length === 0) {
      console.warn("No reverse geocoding results found");
      return null;
    }

    const result = data.results[0];
    const components = result.address_components;

    // Extract address components
    const getComponent = (type: string) => {
      const component = components.find((c: any) => c.types.includes(type));
      return component?.long_name || null;
    };

    return {
      address: getComponent("route") || getComponent("street_address"),
      city: getComponent("locality") || getComponent("sublocality"),
      region: getComponent("administrative_area_level_1"),
      country: getComponent("country"),
      postalCode: getComponent("postal_code"),
      displayName: result.formatted_address,
      formattedAddress: result.formatted_address,
    };
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return null;
  }
}

/**
 * Get current user location from browser
 */
export function getCurrentLocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Geolocation not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      (error) => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  });
}

/**
 * Calculate distance between two points using Haversine formula
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

/**
 * Get place autocomplete suggestions using Google Places API
 */
export async function getPlaceSuggestions(
  input: string,
  types?: string[]
): Promise<any[]> {
  try {
    if (!GOOGLE_MAPS_API_KEY) {
      console.error("Google Maps API key not configured");
      return [];
    }

    const typeParam = types ? `&types=${types.join("|")}` : "";
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
      input
    )}&key=${GOOGLE_MAPS_API_KEY}&components=country:za${typeParam}`;

    const response = await fetch(url);

    if (!response.ok) {
      console.error("Google Places API error:", response.statusText);
      return [];
    }

    const data = await response.json();

    if (data.status !== "OK" || !data.predictions) {
      return [];
    }

    return data.predictions.map((prediction: any) => ({
      placeId: prediction.place_id,
      description: prediction.description,
      mainText: prediction.structured_formatting.main_text,
      secondaryText: prediction.structured_formatting.secondary_text,
    }));
  } catch (error) {
    console.error("Place suggestions error:", error);
    return [];
  }
}

/**
 * Get place details by place ID
 */
export async function getPlaceDetails(placeId: string): Promise<any | null> {
  try {
    if (!GOOGLE_MAPS_API_KEY) {
      console.error("Google Maps API key not configured");
      return null;
    }

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      console.error("Google Place Details API error:", response.statusText);
      return null;
    }

    const data = await response.json();

    if (data.status !== "OK" || !data.result) {
      return null;
    }

    const result = data.result;
    const components = result.address_components;

    const getComponent = (type: string) => {
      const component = components.find((c: any) => c.types.includes(type));
      return component?.long_name || null;
    };

    return {
      latitude: result.geometry.location.lat,
      longitude: result.geometry.location.lng,
      address: getComponent("route") || getComponent("street_address"),
      city: getComponent("locality") || getComponent("sublocality"),
      region: getComponent("administrative_area_level_1"),
      country: getComponent("country"),
      postalCode: getComponent("postal_code"),
      formattedAddress: result.formatted_address,
    };
  } catch (error) {
    console.error("Place details error:", error);
    return null;
  }
}