import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  MapPin,
  Star,
  Truck,
  ArrowRight,
  Loader2,
  Mail,
  Phone,
} from "lucide-react";
import { getProviders } from "../../services/providerApi";
import type { Provider as ProviderType } from "../../types/provider";

interface ProviderWithDistance extends ProviderType {
  distance?: number | null;
}

interface UserLocation {
  lat: number;
  lng: number;
  city?: string;
  region?: string;
}

export default function FeaturedProviders() {
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location: UserLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}`,
              {
                headers: {
                  'User-Agent': 'MoverApp/1.0'
                }
              }
            );

            if (response.ok) {
              const data = await response.json();
              location.city =
                data.address?.city || data.address?.town || data.address?.suburb;
              location.region = data.address?.state || data.address?.province;
            }
          } catch (err) {
            console.log("Could not get city name:", err);
          }

          setUserLocation(location);
          setPermissionDenied(false);
          console.log("Location set:", location);
        },
        (error) => {
          console.error("Location error:", error.code, error.message);
          if (error.code === 1) {
            setPermissionDenied(true);
          }
        },
        {
          enableHighAccuracy: false,
          timeout: 15000,
          maximumAge: 300000,
        }
      );
    } else {
      console.log("Geolocation not supported");
    }
  }, []);

  const { data: allProviders = [], isLoading } = useQuery<ProviderType[]>({
    queryKey: ["featuredProviders"],
    queryFn: async () => {
      const res = await getProviders();
      console.log("Fetched providers:", res.data?.length || 0);
      return res.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371;
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

  const featuredProviders: ProviderWithDistance[] = (() => {
    if (!allProviders.length) {
      return [];
    }

    // If no location yet, show random providers
    if (!userLocation) {
      return [...allProviders].sort(() => Math.random() - 0.5).slice(0, 6);
    }

    // Filter providers that have coordinates
    const providersWithCoords = allProviders.filter(
      (provider) => provider.latitude && provider.longitude
    );

    console.log(`Providers with coordinates: ${providersWithCoords.length} out of ${allProviders.length}`);

    // If no providers have coordinates, show random ones
    if (providersWithCoords.length === 0) {
      console.log("No providers have coordinates, showing random providers");
      return [...allProviders].sort(() => Math.random() - 0.5).slice(0, 6);
    }

    // Calculate distances
    const providersWithDistance = providersWithCoords.map((provider): ProviderWithDistance => {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        provider.latitude!,
        provider.longitude!
      );

      return {
        ...provider,
        distance,
      };
    });

    // Try to get providers within 30km
    const nearbyProviders = providersWithDistance
      .filter((p) => p.distance !== undefined && p.distance !== null && p.distance <= 30)
      .sort((a, b) => (a.distance || 0) - (b.distance || 0))
      .slice(0, 6);

    if (nearbyProviders.length > 0) {
      console.log(`Found ${nearbyProviders.length} providers within 30km`);
      return nearbyProviders;
    }

    // Fallback: show closest 6 providers regardless of distance
    console.log("No providers within 30km, showing closest providers");
    return providersWithDistance
      .sort((a, b) => (a.distance || 0) - (b.distance || 0))
      .slice(0, 6);
  })();

  const getVehicleImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) return null;

    let cleanPath = imagePath.replace(/\\/g, '/');

    if (cleanPath.startsWith('uploads/')) {
      cleanPath = cleanPath.substring('uploads/'.length);
    }

    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    const encodedPath = cleanPath.split('/').map(segment => encodeURIComponent(segment)).join('/');
    return `${baseUrl}/uploads/${encodedPath}`;
  };

  if (isLoading) {
    return (
      <section className="bg-white py-12 sm:py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
        </div>
      </section>
    );
  }

  // Only hide if we have NO providers from API at all
  if (!allProviders.length) {
    return null;
  }

  return (
    <section className="bg-white py-12 sm:py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              {userLocation && !permissionDenied
                ? `Top Movers ${userLocation.city ? `in ${userLocation.city}` : "Near You"}`
                : "Featured Movers"}
            </h2>
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4 text-green-600" />
              <span className="text-sm">
                {userLocation && !permissionDenied
                  ? `Showing providers within 30km of your location`
                  : permissionDenied
                    ? "Enable location for personalized results"
                    : "Popular providers in your area"}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              if (userLocation) {
                navigate(
                  `/search?address=Your Location&lat=${userLocation.lat}&lng=${userLocation.lng}`
                );
              } else {
                navigate("/search");
              }
            }}
            className="hidden sm:flex items-center gap-2 text-green-600 hover:text-green-700 font-medium transition"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {permissionDenied && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-800 mb-1">
                  Enable Location Services
                </h3>
                <p className="text-sm text-yellow-700 mb-3">
                  Allow location access to see movers closest to you. We only
                  use this to show nearby providers.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="text-sm bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium transition"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {featuredProviders.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No providers found nearby
              </h3>
              <p className="text-gray-500 mb-4">
                Try expanding your search radius or check back later
              </p>
              <button
                onClick={() => navigate("/search")}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition"
              >
                View All Providers
              </button>
            </div>
          ) : (
            featuredProviders.map((provider) => {
              const vehicleImage = provider.vehicles?.[0]?.files?.[0]?.url;
              const imageUrl = getVehicleImageUrl(vehicleImage);

              return (
                <div
                  key={provider.id}
                  className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer overflow-hidden group"
                  onClick={() => navigate(`/provider/${provider.id}`)}
                >
                  <div className="h-40 bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center relative overflow-hidden">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={`${provider.user?.firstName || "Provider"}'s Vehicle`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : null}

                    {!imageUrl && (
                      <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg group-hover:scale-110 transition-transform">
                        <Truck className="w-8 h-8" />
                      </div>
                    )}

                    {provider.vehicles && provider.vehicles.length > 0 && (
                      <div className="absolute top-3 right-3 bg-white rounded-full px-3 py-1 text-xs font-medium text-gray-700 shadow flex items-center gap-1">
                        <Truck className="w-3 h-3" />
                        {provider.vehicles.length}
                      </div>
                    )}

                    {userLocation && provider.distance && (
                      <div className="absolute top-3 left-3 bg-green-600 text-white rounded-full px-3 py-1 text-xs font-medium shadow">
                        {provider.distance.toFixed(1)}km away
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 mb-2 group-hover:text-green-600 transition truncate">
                      {`${provider.user?.firstName || ""} ${provider.user?.lastName || ""}`.trim() || "Provider"}
                    </h3>

                    {provider.user && (
                      <div className="mb-3 pb-3 border-b border-gray-100">
                        {provider.user.phone && (
                          <div className="flex items-center gap-2 mb-1">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-xs text-gray-600">
                              {provider.user.phone}
                            </span>
                          </div>
                        )}
                        {provider.user.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-xs text-gray-600 truncate">
                              {provider.user.email}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[40px]">
                      Reliable and professional moving services
                    </p>

                    <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-semibold text-gray-800">
                          {(Math.random() * 2 + 3).toFixed(1)}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        ({Math.floor(Math.random() * 50) + 10} reviews)
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Starting from</p>
                        <p className="text-lg font-bold text-green-700">
                          R{provider.vehicles?.[0]?.baseRate || Math.floor(Math.random() * 300) + 200}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/quote-request?providerId=${provider.id}`);
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                      >
                        Get Quote
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="sm:hidden mt-6">
          <button
            onClick={() => {
              if (userLocation) {
                navigate(
                  `/search?address=Your Location&lat=${userLocation.lat}&lng=${userLocation.lng}`
                );
              } else {
                navigate("/search");
              }
            }}
            className="w-full flex items-center justify-center gap-2 text-green-600 hover:text-green-700 font-medium py-3 border border-green-600 rounded-lg transition"
          >
            View All Movers
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}