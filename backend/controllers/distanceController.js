const axios = require('axios');

exports.calculateDistance = async (req, res) => {
  try {
    const { pickup, dropoff } = req.body;

    if (!pickup || !dropoff) {
      return res.status(400).json({ 
        error: 'Pickup and dropoff addresses are required' 
      });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.error('GOOGLE_MAPS_API_KEY not found in environment variables');
      return res.status(500).json({ 
        error: 'Distance calculation service not configured' 
      });
    }
    const url = `https://routes.googleapis.com/directions/v2:computeRoutes`;
    
    const requestBody = {
      origin: {
        address: pickup.trim()
      },
      destination: {
        address: dropoff.trim()
      },
      travelMode: "DRIVE",
      routingPreference: "TRAFFIC_AWARE",
      computeAlternativeRoutes: false,
      routeModifiers: {
        avoidTolls: false,
        avoidHighways: false,
        avoidFerries: false
      },
      languageCode: "en-US",
      units: "METRIC"
    };

    const response = await axios.post(url, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline'
      }
    });

    const data = response.data;

    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      
      // Extract distance in meters and convert to km
      const distanceInMeters = route.distanceMeters || 0;
      const distanceInKm = distanceInMeters / 1000;
      
      // Extract duration (format: "1234s" means 1234 seconds)
      const durationString = route.duration || "0s";
      const durationInSeconds = parseInt(durationString.replace('s', ''));
      const durationInMinutes = Math.round(durationInSeconds / 60);
      
      // Format text for display
      const distanceText = `${distanceInKm.toFixed(1)} km`;
      const durationText = durationInMinutes < 60 
        ? `${durationInMinutes} mins`
        : `${Math.floor(durationInMinutes / 60)} hour${Math.floor(durationInMinutes / 60) > 1 ? 's' : ''} ${durationInMinutes % 60} mins`;
      
      
      return res.json({
        success: true,
        distance: parseFloat(distanceInKm.toFixed(2)),
        duration: durationInMinutes,
        distanceText: distanceText,
        durationText: durationText
      });
    } else {
      return res.status(404).json({ 
        error: "No route found between these addresses. Please check the addresses." 
      });
    }
  } catch (error) {
    console.error('Distance calculation error:', error.message);
    
    if (error.response?.data) {
      console.error('Google Routes API error response:', error.response.data);
      
      // Handle specific API errors
      if (error.response.status === 400) {
        return res.status(400).json({
          error: "Invalid addresses provided. Please check and try again."
        });
      }
      
      if (error.response.status === 403) {
        return res.status(500).json({
          error: "Routes API not enabled. Please enable it in Google Cloud Console."
        });
      }
    }
    
    return res.status(500).json({ 
      error: 'Failed to calculate distance. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};