const axios = require('axios');

exports.calculateDistance = async (req, res) => {
  try {
    const { pickup, dropoff } = req.body;

    // Validate input
    if (!pickup || !dropoff) {
      return res.status(400).json({ 
        status: 'INVALID_ADDRESS',
        error: 'Both pickup and dropoff addresses are required' 
      });
    }

    // Clean and validate addresses
    const cleanPickup = pickup.trim();
    const cleanDropoff = dropoff.trim();

    // Basic validation - addresses should be at least 5 characters
    if (cleanPickup.length < 5 || cleanDropoff.length < 5) {
      return res.status(400).json({ 
        status: 'INVALID_ADDRESS',
        error: 'Please enter complete addresses' 
      });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.warn('GOOGLE_MAPS_API_KEY not configured');
      return res.status(500).json({ 
        status: 'ERROR',
        error: 'Distance calculation service is not configured' 
      });
    }

    const url = 'https://maps.googleapis.com/maps/api/distancematrix/json';
    
    const response = await axios.get(url, {
      params: {
        origins: cleanPickup,
        destinations: cleanDropoff,
        units: 'metric',
        key: apiKey,
        // Add region biasing for South Africa
        region: 'za'
      }
    });

    const data = response.data;

    // Check if Google Maps API returned an error
    if (data.status !== "OK") {
      console.error('Google Maps API error:', data.status, data.error_message);
      return res.status(400).json({ 
        status: 'ERROR',
        error: 'Unable to process addresses. Please check and try again.' 
      });
    }

    // Check if we got valid results
    const element = data.rows[0]?.elements[0];
    
    if (!element) {
      return res.status(400).json({ 
        status: 'NOT_FOUND',
        error: 'Could not find route between addresses' 
      });
    }

    // Check element status
    if (element.status === "ZERO_RESULTS") {
      return res.status(400).json({ 
        status: 'NOT_FOUND',
        error: 'No route found between these addresses' 
      });
    }

    if (element.status === "NOT_FOUND") {
      return res.status(400).json({ 
        status: 'INVALID_ADDRESS',
        error: 'One or both addresses could not be found. Please enter valid addresses.' 
      });
    }

    if (element.status !== "OK") {
      return res.status(400).json({ 
        status: 'ERROR',
        error: 'Unable to calculate distance. Please try again.' 
      });
    }

    // Successfully calculated distance
    const distanceInKm = parseFloat((element.distance.value / 1000).toFixed(2));
    const durationInMinutes = Math.round(element.duration.value / 60);

    // Sanity check - distance should be reasonable (e.g., less than 1000km for local moves)
    if (distanceInKm > 1000) {
      console.warn(`Unusually large distance calculated: ${distanceInKm}km`);
    }

    return res.json({
      status: 'OK',
      distance: distanceInKm,
      duration: durationInMinutes,
      distanceText: element.distance.text,
      durationText: element.duration.text,
      originAddress: data.origin_addresses[0],
      destinationAddress: data.destination_addresses[0]
    });

  } catch (error) {
    console.error('Distance calculation error:', error.message);
    
    if (error.response?.status === 400) {
      return res.status(400).json({ 
        status: 'INVALID_ADDRESS',
        error: 'Invalid addresses provided. Please check and try again.' 
      });
    }

    return res.status(500).json({ 
      status: 'ERROR',
      error: 'Failed to calculate distance. Please try again later.' 
    });
  }
};