import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

interface DistanceResult {
  distance: number;
  duration: number;
  distanceText: string;
  durationText: string;
  status: 'OK' | 'INVALID_ADDRESS' | 'NOT_FOUND' | 'ERROR';
  errorMessage?: string;
}

export const calculateDistance = async (
  pickup: string,
  dropoff: string
): Promise<DistanceResult> => {
  try {
    if (!pickup.trim() || !dropoff.trim()) {
      return {
        distance: 0,
        duration: 0,
        distanceText: '',
        durationText: '',
        status: 'INVALID_ADDRESS',
        errorMessage: 'Please enter both pickup and dropoff addresses'
      };
    }

    // Call your backend endpoint that uses Google Maps API
    const response = await axios.post(`${API_URL}/quotes/calculate-distance`, {
      pickup: pickup.trim(),
      dropoff: dropoff.trim()
    });

    if (response.data.status === 'OK') {
      return {
        distance: response.data.distance,
        duration: response.data.duration,
        distanceText: response.data.distanceText,
        durationText: response.data.durationText,
        status: 'OK'
      };
    } else {
      return {
        distance: 0,
        duration: 0,
        distanceText: '',
        durationText: '',
        status: 'INVALID_ADDRESS',
        errorMessage: response.data.error || 'Unable to calculate distance'
      };
    }
  } catch (error: any) {
    console.error('Distance calculation error:', error);
    return {
      distance: 0,
      duration: 0,
      distanceText: '',
      durationText: '',
      status: 'ERROR',
      errorMessage: error.response?.data?.error || 'Failed to calculate distance'
    };
  }
};