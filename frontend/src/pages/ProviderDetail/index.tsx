import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  ArrowLeft,
  MapPin,
  Star,
  Truck,
  CheckCircle,
  Clock,
  Shield,
  Award,
  Users,
  Package,
  Info,
  Phone,
  Mail,
} from "lucide-react";
import { useProvider } from "@/hooks/useProvider";
import LoadingScreen from "@/components/LoadingScreen/Loading";
import ErrorScreen from "@/components/ErrorScreen";

export default function EnhancedProviderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);

  const { data: provider, isLoading, isError } = useProvider(id);

  const user = provider?.user;

  const getVehicleImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) return null;

    let cleanPath = imagePath.replace(/\\/g, "/");

    if (cleanPath.startsWith("uploads/")) {
      cleanPath = cleanPath.substring("uploads/".length);
    }

    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

    // URL encode the path to handle spaces and special characters
    const encodedPath = cleanPath
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/");
    const fullUrl = `${baseUrl}/uploads/${encodedPath}`;

    return fullUrl;
  };

 if (isLoading) {
    return <LoadingScreen />;
  }

 if (isError || !provider) {
    return <ErrorScreen navigate={navigate} />;
  }

  const rating = 4.8;
  const reviewCount = 127;
  const completedMoves = 340;
  const responseTime = "< 2 hours";

  const selectedVehicleData = provider.vehicles?.find(
    (v: any) => v.id === selectedVehicle
  );

  const displayName =
    typeof provider.user === "string"
      ? provider.user
      : `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
        "Professional Mover";

  // Get the primary vehicle image
  const vehicleImage = provider.vehicles?.[0]?.files?.[0]?.url;
  const imageUrl = getVehicleImageUrl(vehicleImage);

  return (
    <div className="min-h-screen bg-gray-50 pb-24 sm:pb-8">
      {/* Mobile Header */}
      <div className="bg-white border-b sticky top-0 z-20 shadow-sm">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition -ml-2"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-2xl text-gray-800 truncate">
              {displayName}
            </h1>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span>{rating}</span>
              </div>
              <span>•</span>
              <span>{reviewCount} reviews</span>
            </div>
          </div>
        </div>
      </div>

      {/* Provider Hero Section */}
      <div className="bg-gradient-to-br from-green-600 to-green-700 px-4 py-8 sm:py-12 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-6">
            {/* Provider Avatar with Vehicle Image */}
            <div className="w-35 h-24 sm:w-50 sm:h-35 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center overflow-hidden shadow-xl flex-shrink-0 border-4 border-white/30">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={`${provider.user?.firstName || "Provider"}'s Vehicle`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error("Image load error for:", imageUrl);
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : null}
            </div>

            {/* Provider Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 mb-3">
                <Shield className="w-4 h-4" />
                <span className="text-xs font-medium">Verified Provider</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold mb-2">
                {displayName}
              </h2>

              {/* Provider/User Info */}
              {user && (
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm text-green-100 mb-3">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {user.firstName} {user.lastName}
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {user.phone}
                    </div>
                  )}
                </div>
              )}

              {/* Rating and Stats */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-lg">{rating}</span>
                  <span className="text-sm text-white/80">
                    ({reviewCount} reviews)
                  </span>
                </div>

                <div className="w-1 h-4 bg-white/30 hidden sm:block"></div>

                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  <span className="text-sm">
                    {completedMoves}+ completed moves
                  </span>
                </div>

                <div className="w-1 h-4 bg-white/30 hidden sm:block"></div>

                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span className="text-sm">Response time: {responseTime}</span>
                </div>
              </div>

              {/* Location */}
              {provider.city && (
                <div className="flex items-center justify-center sm:justify-start gap-2 text-white/90 mb-4">
                  <MapPin className="w-5 h-5" />
                  <span>
                    {provider.city}
                    {provider.region ? `, ${provider.region}` : ""}{" "}
                    {provider.country && provider.country !== "South Africa"
                      ? `, ${provider.country}`
                      : ""}
                  </span>
                </div>
              )}

              {/* Key Features */}
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                {provider.includeHelpers && (
                  <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-sm">
                    <Users className="w-4 h-4" />
                    Helpers Available
                  </span>
                )}
                <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-sm">
                  <Truck className="w-4 h-4" />
                  {provider.vehicles?.length || 0} Vehicles
                </span>
                <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-sm">
                  <Award className="w-4 h-4" />
                  Top Rated
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                About {displayName}
              </h3>

              <div className="grid sm:grid-cols-2 gap-4">
                <FeatureItem
                  icon={Shield}
                  title="Licensed & Insured"
                  description="Fully licensed and insured for your protection"
                />
                <FeatureItem
                  icon={Award}
                  title="Quality Guarantee"
                  description="100% satisfaction guaranteed"
                />
                <FeatureItem
                  icon={Users}
                  title="Experienced Team"
                  description="Professional and trained movers"
                />
                <FeatureItem
                  icon={Clock}
                  title="On-Time Service"
                  description="Punctual and reliable"
                />
              </div>
            </div>

            {/* Contact Information */}
            {user && (user.phone || user.email) && (
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Contact Information
                </h3>
                <div className="space-y-3">
                  {user.phone && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Phone className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Phone</p>
                        <p className="font-semibold text-gray-800">
                          {user.phone}
                        </p>
                      </div>
                    </div>
                  )}
                  {user.email && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Mail className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Email</p>
                        <p className="font-semibold text-gray-800">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Available Vehicles Section */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Available Vehicles & Pricing
              </h3>

              {provider.vehicles?.length ? (
                <div className="space-y-4">
                  {provider.vehicles.map((vehicle: any) => (
                    <VehicleCard
                      key={vehicle.id}
                      vehicle={vehicle}
                      providerId={provider.id}
                      isSelected={selectedVehicle === vehicle.id}
                      onSelect={() => setSelectedVehicle(vehicle.id)}
                      getVehicleImageUrl={getVehicleImageUrl}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Truck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No vehicles available</p>
                </div>
              )}
            </div>

            {/* Helper Services */}
            {provider.includeHelpers && (
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Helper Services
                </h3>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 mb-2">
                      Professional Helpers Available
                    </h4>
                    <p className="text-gray-600 text-sm mb-3">
                      Our trained helpers assist with loading, unloading, and
                      packing to make your move easier and faster.
                    </p>
                    <span className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                      Helpers Available - R150/helper
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Service Area */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Service Area
              </h3>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-gray-700 mb-2">
                    <strong>Primary Location:</strong>
                  </p>
                  <p className="text-gray-600">
                    {provider.address && <>{provider.address}, </>}
                    {provider.city && <>{provider.city}, </>}
                    {provider.region && <>{provider.region}, </>}
                    {provider.country || "South Africa"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Card (Desktop) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border-2 border-green-100 p-6 sticky top-24">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 bg-green-50 rounded-full px-4 py-2 mb-4">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-gray-800">{rating}</span>
                  <span className="text-sm text-gray-600">({reviewCount})</span>
                </div>

                {selectedVehicleData ? (
                  <div className="bg-green-50 rounded-xl p-4 mb-4">
                    <p className="text-sm text-gray-600 mb-1">
                      Selected Vehicle
                    </p>
                    <p className="font-bold text-lg text-gray-800 mb-2">
                      {selectedVehicleData.make} {selectedVehicleData.model}
                    </p>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-3xl font-bold text-green-700">
                        R{selectedVehicleData.baseRate}
                      </span>
                      <span className="text-sm text-gray-600">base</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      + R{selectedVehicleData.perKmRate}/km
                    </p>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <Info className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Select a vehicle to see pricing
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <button
                  onClick={() =>
                    navigate(
                      `/quote-request?providerId=${provider.id}${
                        selectedVehicle ? `&vehicleId=${selectedVehicle}` : ""
                      }`
                    )
                  }
                  className="block w-full text-center border-2 border-green-600 text-green-600 py-3 rounded-xl font-semibold hover:bg-green-50 transition"
                >
                  Get Free Quote
                </button>

                <button
                  onClick={() =>
                    navigate(
                      `/quote-request?providerId=${provider.id}${
                        selectedVehicle ? `&vehicleId=${selectedVehicle}` : ""
                      }`
                    )
                  }
                  className="block w-full text-center bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition shadow-lg"
                >
                  Book Now
                </button>
              </div>

              <div className="mt-6 pt-6 border-t space-y-3 text-sm">
                <div className="flex items-center gap-3 text-gray-600">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>Instant confirmation</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>Free cancellation up to 24h</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>Secure payment</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom CTA - Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-2xl p-4 z-30">
        {selectedVehicleData && (
          <div className="mb-3 text-center">
            <p className="text-xs text-gray-600">Starting from</p>
            <p className="text-2xl font-bold text-green-700">
              R{selectedVehicleData.baseRate}
              <span className="text-sm text-gray-600 font-normal ml-1">
                + R{selectedVehicleData.perKmRate}/km
              </span>
            </p>
          </div>
        )}
        <div className="flex gap-3">
          <button
            onClick={() =>
              navigate(
                `/quote-request?providerId=${provider.id}${
                  selectedVehicle ? `&vehicleId=${selectedVehicle}` : ""
                }`
              )
            }
            className="flex-1 text-center border-2 border-green-600 text-green-600 py-3 rounded-xl font-semibold hover:bg-green-50 transition"
          >
            Get Quote
          </button>
          <button
            onClick={() =>
              navigate(
                `/quote-request?providerId=${provider.id}${
                  selectedVehicle ? `&vehicleId=${selectedVehicle}` : ""
                }`
              )
            }
            className="flex-1 text-center bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition shadow-lg"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ icon: Icon, title, description }: any) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-green-600" />
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-gray-800 text-sm mb-1">{title}</h4>
        <p className="text-xs text-gray-600">{description}</p>
      </div>
    </div>
  );
}

function VehicleCard({
  vehicle,
  providerId,
  isSelected,
  onSelect,
  getVehicleImageUrl,
}: any) {
  const navigate = useNavigate();

  const getVehicleTypeLabel = (type: string) => {
    return type?.replace(/_/g, " ") || "Vehicle";
  };

  const vehicleImage = vehicle.files?.[0]?.url;
  const imageUrl = getVehicleImageUrl(vehicleImage);

  return (
    <div
      onClick={onSelect}
      className={`border-2 rounded-xl transition cursor-pointer hover:shadow-md overflow-hidden ${
        isSelected
          ? "border-green-600 bg-green-50 shadow-md"
          : "border-gray-200 bg-white hover:border-green-300"
      }`}
    >
      {/* Vehicle Image */}
      {imageUrl && (
        <div className="h-48 bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
          <img
            src={imageUrl}
            alt={vehicle.plate}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error("Image failed to load:", imageUrl);
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4 flex-1">
            <div
              className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                isSelected ? "bg-green-600" : "bg-gray-100"
              }`}
            >
              <Truck
                className={`w-7 h-7 ${
                  isSelected ? "text-white" : "text-gray-600"
                }`}
              />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-800 text-lg mb-1">
                {getVehicleTypeLabel(vehicle.make)} {getVehicleTypeLabel(vehicle.model)}
              </h4>
              <p className="text-sm text-gray-600">Plate: {vehicle.plate}</p>
            </div>
          </div>
          {isSelected && (
            <div className="w-7 h-7 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">Capacity</p>
            <p className="font-semibold text-gray-800">{vehicle.capacity}m³</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">Max Weight</p>
            <p className="font-semibold text-gray-800">{vehicle.weight}kg</p>
          </div>
        </div>

        <div
          className={`rounded-xl p-4 mb-4 ${
            isSelected ? "bg-white" : "bg-gray-50"
          }`}
        >
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-sm text-gray-600">Base Rate</span>
            <span className="text-2xl font-bold text-green-700">
              R{vehicle.baseRate}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-gray-600">Per Kilometer</span>
            <span className="text-lg font-semibold text-green-600">
              R{vehicle.perKmRate}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(
                `/quote-request?providerId=${providerId}&vehicleId=${vehicle.id}`
              );
            }}
            className="flex-1 text-center border border-green-600 text-green-600 rounded-lg py-2.5 text-sm font-medium hover:bg-green-50 transition"
          >
            Get Quote
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(
                `/checkout?providerId=${providerId}&vehicleId=${vehicle.id}`
              );
            }}
            className="flex-1 text-center bg-green-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-green-700 transition"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}
