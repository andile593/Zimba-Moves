import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Truck, Star, Filter, Loader2, ArrowLeft } from "lucide-react";
import { getProviders } from "../../services/providerApi";
import type { Provider } from "../../types/provider";

export default function SearchResults() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const address = searchParams.get("address") || "";
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const radius = parseInt(searchParams.get("radius") || "30");

  const [selectedRadius, setSelectedRadius] = useState(radius);
  const [sortBy, setSortBy] = useState<"distance" | "price" | "rating">(
    "distance"
  );

  // Fetch all providers
  const { data: allProviders = [], isLoading } = useQuery({
    queryKey: ["providers"],
    queryFn: async () => {
      const res = await getProviders();
      return res.data || [];
    },
  });

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Filter and sort providers
  const filteredProviders = (() => {
    if (!lat || !lng) {
      // No coordinates, show all providers
      return allProviders;
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    // Add distance to each provider
    const providersWithDistance = allProviders
      .map((provider: Provider) => {
        // Use provider's actual location if available
        if (provider.latitude && provider.longitude) {
          const distance = calculateDistance(
            userLat,
            userLng,
            provider.latitude,
            provider.longitude
          );
          return { ...provider, distance };
        }
        // If provider has no location, don't show them in distance-based search
        return null;
      })
      .filter(Boolean) as (Provider & { distance: number })[];

    // Filter by radius
    const filtered = providersWithDistance.filter(
      (p) => p.distance <= selectedRadius
    );

    // Sort providers
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "distance") {
        return a.distance - b.distance;
      } else if (sortBy === "price") {
        const priceA = a.vehicles?.[0]?.baseRate || 999999;
        const priceB = b.vehicles?.[0]?.baseRate || 999999;
        return priceA - priceB;
      } else {
        // rating (random for now)
        return 0;
      }
    });

    return sorted;
  })();

  
  const getVehicleImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) return null;

    let cleanPath = imagePath.replace(/\\/g, '/');

    if (cleanPath.startsWith('uploads/')) {
      cleanPath = cleanPath.substring('uploads/'.length);
    }

    const baseUrl = import.meta.env.VITE_API_URL || 'https://lwwx2f-4000.csb.app';
    
    // URL encode the path to handle spaces and special characters
    const encodedPath = cleanPath.split('/').map(segment => encodeURIComponent(segment)).join('/');
    const fullUrl = `${baseUrl}/uploads/${encodedPath}`;

    return fullUrl;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Finding movers near you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <div className="flex items-center gap-3 mb-2">
            <MapPin className="w-6 h-6 text-green-600" />
            <h1 className="text-2xl font-bold text-gray-800">
              Movers near {address || "you"}
            </h1>
          </div>
          <p className="text-gray-600">
            {filteredProviders.length} provider
            {filteredProviders.length !== 1 ? "s" : ""} found
            {lat && lng && ` within ${selectedRadius}km`}
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-gray-700" />
                <h2 className="font-semibold text-gray-800">Filters</h2>
              </div>

              {/* Distance Filter */}
              {lat && lng && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Distance Radius
                  </label>
                  <select
                    value={selectedRadius}
                    onChange={(e) =>
                      setSelectedRadius(parseInt(e.target.value))
                    }
                    className="w-full text-gray-600 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="10">Within 10km</option>
                    <option value="20">Within 20km</option>
                    <option value="30">Within 30km</option>
                    <option value="50">Within 50km</option>
                    <option value="100">Within 100km</option>
                  </select>
                </div>
              )}

              {/* Sort By */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full text-gray-600 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="distance">Distance</option>
                  <option value="price">Price (Low to High)</option>
                  <option value="rating">Rating</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {filteredProviders.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No movers found
                </h3>
                <p className="text-gray-600 mb-6">
                  {lat && lng
                    ? `Try increasing the search radius or search a different location`
                    : "Please provide a location to find nearby movers"}
                </p>
                <button
                  onClick={() => navigate("/")}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Back to Home
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProviders.map((provider: any) => {
                  // Get vehicle image for THIS specific provider
                  const vehicleImage = 
                    provider.vehicles?.[0]?.files?.[0]?.url || 
                    provider.vehicles?.[0]?.image || 
                    provider.vehicles?.[0]?.imageUrl ||
                    provider.vehicles?.[0]?.images?.[0];
                  const imageUrl = getVehicleImageUrl(vehicleImage);

                  return (
                    <div
                      key={provider.id}
                      className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6 cursor-pointer"
                      onClick={() => navigate(`/provider/${provider.id}`)}
                    >
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Provider Image */}
                        <div className="w-full md:w-45 h-40 bg-gradient-to-br from-green-50 to-green-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={`${
                                provider.user?.firstName || "Provider"
                              }'s Vehicle`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.error("Image load error for:", imageUrl);
                                (e.target as HTMLImageElement).style.display =
                                  "none";
                              }}
                            />
                          ) : (
                            <Truck className="w-12 h-12 text-green-600" />
                          )}
                        </div>

                        {/* Provider Info */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-xl font-bold text-gray-800 mb-1">
                                {`${provider.user.firstName} ${provider.user.lastName}` ||
                                  "Professional Mover"}
                              </h3>
                              {provider.distance && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <MapPin className="w-4 h-4 text-green-600" />
                                  <span>
                                    {provider.distance.toFixed(1)}km away
                                  </span>
                                  {provider.city && (
                                    <span className="text-gray-400">
                                      • {provider.city}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Rating */}
                            <div className="flex items-center gap-1 bg-green-50 px-3 py-1 rounded-lg">
                              <Star className="w-4 h-4 fill-green-600 text-green-600" />
                              <span className="font-semibold text-gray-800">
                                {(Math.random() * 2 + 3).toFixed(1)}
                              </span>
                            </div>
                          </div>

                          <p className="text-gray-600 mb-4 line-clamp-2">
                            {provider.bio ||
                              "Reliable and professional moving services"}
                          </p>

                          {/* Details */}
                          <div className="flex flex-wrap items-center gap-4 mb-4">
                            {provider.vehicles?.length > 0 && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Truck className="w-4 h-4" />
                                <span>
                                  {provider.vehicles.length} vehicle
                                  {provider.vehicles.length !== 1 ? "s" : ""}
                                </span>
                              </div>
                            )}
                            {provider.includeHelpers && (
                              <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                                Helpers Available
                              </span>
                            )}
                          </div>

                          {/* Price & Action */}
                          <div className="flex items-center justify-between pt-4 border-t">
                            <div>
                              <p className="text-xs text-gray-500">
                                Starting from
                              </p>
                              <p className="text-xl font-bold text-green-700">
                                R
                                {provider.vehicles?.[0]?.baseRate?.toFixed(2) ||
                                  "TBD"}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/provider/${provider.id}`);
                                }}
                                className="px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition font-medium"
                              >
                                View Details
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(
                                    `/quote-request?providerId=${provider.id}`
                                  );
                                }}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                              >
                                Get Quote
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}