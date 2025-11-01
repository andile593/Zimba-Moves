import { useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { MapPin, Truck, Users, Calculator, ArrowRight, Info, Phone, Mail, Clock, Download, FileText, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useProvider } from "../../hooks/useProvider";
import { calculateDistance } from "../../services/googleMapsService";
import AddressAutocomplete from "../../components/AddressAutocomplete/AddressAutocomplete";
import type { MoveType } from "@/types";
import LoadingScreen from "@/components/LoadingScreen/Loading";
import ErrorScreen from "@/components/ErrorScreen";
import MissingProvider from "@/components/MissingProvider/MissingProviders";
import downloadQuotePDF from "@/components/DownloadPDF";


interface DistanceResult {
  distance: number;
  duration: number;
  distanceText: string;
  durationText: string;
  status: 'OK' | 'INVALID_ADDRESS' | 'NOT_FOUND' | 'ERROR';
  errorMessage?: string;
}


export default function QuoteRequest() {
  const [params] = useSearchParams();
  const providerId = params.get("providerId");
  const vehicleId = params.get("vehicleId");
  const navigate = useNavigate();

  const { data: provider, isLoading, isError } = useProvider(providerId || "");

  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [moveType, setMoveType] = useState<MoveType>("APARTMENT");
  const [helpersNeeded, setHelpersNeeded] = useState(0);
  const [selectedVehicleId, setSelectedVehicleId] = useState(vehicleId || "");
  const [distanceResult, setDistanceResult] = useState<DistanceResult | null>(null);
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);
  const [instantEstimate, setInstantEstimate] = useState<number | null>(null);
  const [addressError, setAddressError] = useState<string>("");

  useEffect(() => {
    if (vehicleId) {
      setSelectedVehicleId(vehicleId);
    } else if (provider?.vehicles?.length === 1 && !selectedVehicleId) {
      setSelectedVehicleId(provider.vehicles[0].id || "");
    }
  }, [provider, selectedVehicleId, vehicleId]);

  // Real distance calculation with validation
  useEffect(() => {
    const fetchDistance = async () => {
      // Reset previous results
      setDistanceResult(null);
      setAddressError("");

      if (!pickup.trim() || !dropoff.trim()) {
        return;
      }

      // Check minimum length
      if (pickup.trim().length < 5 || dropoff.trim().length < 5) {
        setAddressError("Please enter complete addresses (minimum 5 characters)");
        return;
      }

      setIsCalculatingDistance(true);

      try {
        const result = await calculateDistance(pickup, dropoff);

        if (result.status === 'OK') {
          setDistanceResult(result);
          setAddressError("");
        } else {
          setAddressError(result.errorMessage || "Unable to calculate distance");
          setDistanceResult(null);
        }
      } catch (error: any) {
        console.error("Distance calculation error:", error);
        setAddressError("Failed to calculate distance. Please check your addresses.");
        setDistanceResult(null);
      } finally {
        setIsCalculatingDistance(false);
      }
    };

    // Debounce the API call
    const debounceTimer = setTimeout(fetchDistance, 2000);
    return () => clearTimeout(debounceTimer);
  }, [pickup, dropoff]);

  // Calculate instant estimate (no helper charges)
  useEffect(() => {
    if (!selectedVehicleId || !distanceResult || distanceResult.status !== 'OK' || !provider?.vehicles) {
      setInstantEstimate(null);
      return;
    }

    const vehicle = provider.vehicles.find((v: any) => v.id === selectedVehicleId);
    if (!vehicle) return;

    // Base calculation without helper charges
    let estimate = Number(vehicle.baseRate) || 0;
    estimate += distanceResult.distance * (Number(vehicle.perKmRate) || 0);
    estimate += Number(vehicle.loadFee) || 0;
    // No helper charges - they're included

    const complexityMultipliers = {
      APARTMENT: 1.0,
      OFFICE: 1.3,
      SINGLE_ITEM: 0.7,
      OTHER: 1.0,
    };
    estimate *= complexityMultipliers[moveType];

    // Apply minimum charge
    const minimumCharge = 400;
    if (estimate < minimumCharge) {
      estimate = minimumCharge;
    }

    setInstantEstimate(Math.round(estimate * 100) / 100);
  }, [selectedVehicleId, distanceResult, moveType, provider]);

  if (!providerId) {
    return <MissingProvider navigate={navigate} />;
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isError || !provider) {
    return <ErrorScreen navigate={navigate} />;
  }

  const displayName = provider?.user
    ? `${provider.user.firstName} ${provider.user.lastName}`.trim()
    : "Moving Company";
  
  const displayLetter = displayName[0]?.toUpperCase() || "M";

  const handleProceedToCheckout = () => {
    if (!pickup.trim() || !dropoff.trim()) {
      toast.error("Please enter both pickup and dropoff addresses");
      return;
    }

    if (!selectedVehicleId) {
      toast.error("Please select a vehicle");
      return;
    }

    if (!distanceResult || distanceResult.status !== 'OK') {
      toast.error("Please wait for valid distance calculation");
      return;
    }

    if (!instantEstimate) {
      toast.error("Price calculation in progress");
      return;
    }

    navigate("/checkout", {
      state: {
        providerId,
        vehicleId: selectedVehicleId,
        pickup,
        dropoff,
        moveType,
        helpersNeeded,
        estimatedDistance: distanceResult.distance,
        estimatedDuration: distanceResult.duration,
        distanceText: distanceResult.distanceText,
        durationText: distanceResult.durationText,
        instantEstimate,
        provider,
      },
    });
  };

 const handleDownloadQuote = () => {
  if (!instantEstimate || !distanceResult || distanceResult.status !== 'OK') {
    toast.error("Please complete the quote first");
    return;
  }

  const vehicle = provider?.vehicles?.find((v: any) => v.id === selectedVehicleId);
  if (!vehicle) {
    toast.error("Please select a vehicle");
    return;
  }

  downloadQuotePDF({
    provider,
    pickup,
    dropoff,
    distanceResult,
    vehicle,
    helpersNeeded,
    moveType,
    instantEstimate
  });
  toast.success("Opening PDF preview...");
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-2 border-green-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
              {displayLetter}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {displayName}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                {provider?.user && (
                  <>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {provider.user.firstName} {provider.user.lastName}
                    </div>
                    {provider.user.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {provider.user.phone}
                      </div>
                    )}
                  </>
                )}
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {provider.city}, {provider.region}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <MapPin className="w-7 h-7 text-green-600" />
                Moving Details
              </h2>

              <div className="space-y-5">
                <AddressAutocomplete
                  value={pickup}
                  onChange={setPickup}
                  placeholder="e.g., 593 Simmonds Street, Johannesburg"
                  label="Pickup Address"
                  error={addressError && !pickup.trim() ? "Pickup address is required" : ""}
                />

                <AddressAutocomplete
                  value={dropoff}
                  onChange={setDropoff}
                  placeholder="e.g., 15 Oxford Road, Rosebank, Johannesburg"
                  label="Dropoff Address"
                  error={addressError && !dropoff.trim() ? "Dropoff address is required" : ""}
                />

                {isCalculatingDistance && (
                  <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-4 py-3 rounded-xl border border-green-200">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                    Calculating route via Google Maps...
                  </div>
                )}

                {addressError && (
                  <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 px-4 py-3 rounded-xl border border-red-200">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{addressError}</span>
                  </div>
                )}

                {distanceResult && distanceResult.status === 'OK' && (
                  <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-green-700 mb-1">Driving Distance</p>
                        <p className="text-xl font-bold text-green-800">
                          {distanceResult.distanceText}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-green-700 mb-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Estimated Time
                        </p>
                        <p className="text-xl font-bold text-green-800">
                          {distanceResult.durationText}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Move Type & Helpers */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Additional Details</h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Move Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={moveType}
                    onChange={(e) => setMoveType(e.target.value as MoveType)}
                    className="w-full text-gray-700 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                  >
                    <option value="APARTMENT">Apartment Move</option>
                    <option value="OFFICE">Office Move</option>
                    <option value="SINGLE_ITEM">Single Item</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <Users className="w-4 h-4 inline mr-1" />
                    Number of Helpers Needed
                  </label>
                  <div className="flex gap-2">
                    {[0, 1, 2, 3, 4].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setHelpersNeeded(num)}
                        className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${helpersNeeded === num
                            ? "bg-green-600 text-white shadow-lg scale-105"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 mt-2 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                    💡 Helpers included with provider at no extra cost
                  </p>
                </div>
              </div>
            </div>

            {/* Vehicle Selection */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Truck className="w-7 h-7 text-green-600" />
                Select Vehicle
              </h2>

              {!provider?.vehicles || provider.vehicles.length === 0 ? (
                <div className="text-center py-8">
                  <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No vehicles available for this provider</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {provider.vehicles.map((vehicle: any) => (
                    <div
                      key={vehicle.id}
                      onClick={() => setSelectedVehicleId(vehicle.id)}
                      className={`border-2 rounded-xl p-5 cursor-pointer transition-all ${selectedVehicleId === vehicle.id
                          ? "border-green-600 bg-green-50 shadow-lg scale-105"
                          : "border-gray-200 hover:border-green-300 hover:shadow-md"
                        }`}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedVehicleId === vehicle.id ? "bg-green-600" : "bg-gray-200"
                          }`}>
                          <Truck className={`w-6 h-6 ${selectedVehicleId === vehicle.id ? "text-white" : "text-gray-600"
                            }`} />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800">
                            {vehicle.make} {vehicle.model}
                          </h3>
                          <p className="text-sm text-gray-600">{vehicle.plate}</p>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Capacity:</span>
                          <strong className="text-gray-800">{vehicle.capacity} m³</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Max Weight:</span>
                          <strong className="text-gray-800">{vehicle.weight} kg</strong>
                        </div>
                        <div className="pt-2 border-t">
                          <div className="text-green-700 font-bold">
                            R{vehicle.baseRate} base + R{vehicle.perKmRate}/km
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Estimate Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-4 border-2 border-green-100">
              <div className="flex items-center gap-2 mb-6">
                <Calculator className="w-7 h-7 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-800">Quote Summary</h2>
              </div>

              {instantEstimate !== null && distanceResult !== null ? (
                <div className="space-y-5">
                  <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-6 text-center shadow-lg">
                    <p className="text-sm text-green-100 mb-2 font-medium">Estimated Total</p>
                    <p className="text-5xl font-bold text-white mb-1">
                      R{instantEstimate.toFixed(2)}
                    </p>
                    <p className="text-xs text-green-100">Inclusive of all charges</p>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b-2 border-gray-100">
                      <span className="text-gray-600 font-medium">Base Rate</span>
                      <span className="font-bold text-gray-800">
                        R{provider?.vehicles?.find((v: any) => v.id === selectedVehicleId)?.baseRate || 0}
                      </span>
                    </div>

                    <div className="flex justify-between py-2 border-b-2 border-gray-100">
                      <span className="text-gray-600 font-medium">
                        Distance ({distanceResult.distance.toFixed(1)} km)
                      </span>
                      <span className="font-bold text-gray-800">
                        R{(distanceResult.distance * (provider?.vehicles?.find((v: any) => v.id === selectedVehicleId)?.perKmRate || 0)).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between py-2 border-b-2 border-gray-100">
                      <span className="text-gray-600 font-medium">Load Fee</span>
                      <span className="font-bold text-gray-800">
                        R{provider?.vehicles?.find((v: any) => v.id === selectedVehicleId)?.loadFee || 0}
                      </span>
                    </div>

                    {helpersNeeded > 0 && (
                      <div className="flex justify-between py-2 border-b-2 border-gray-100">
                        <span className="text-gray-600 font-medium">Helpers ({helpersNeeded})</span>
                        <span className="font-bold text-green-600">Included</span>
                      </div>
                    )}

                    <div className="flex justify-between py-2 border-b-2 border-gray-100">
                      <span className="text-gray-600 font-medium">Move Type</span>
                      <span className="font-bold text-gray-800 capitalize">
                        {moveType.replace('_', ' ').toLowerCase()}
                      </span>
                    </div>
                  </div>

                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                    <div className="flex gap-2">
                      <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-800 leading-relaxed">
                        This quote is valid for 14 days. Final pricing may vary based on actual route and conditions. Helpers are included at no extra charge.
                      </p>
                    </div>
                  </div>

                  {/* Download Quote Button */}
                  <button
                    onClick={handleDownloadQuote}
                    className="w-full bg-white border-2 border-green-600 text-green-600 font-semibold py-3 rounded-xl transition-all hover:bg-green-50 flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Download className="w-5 h-5" />
                    Download Quote
                  </button>

                  {/* Proceed to Booking Button */}
                  <button
                    onClick={handleProceedToCheckout}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2"
                  >
                    Proceed to Booking
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm font-medium mb-2">
                      {!pickup || !dropoff
                        ? "Enter pickup and dropoff addresses"
                        : !selectedVehicleId
                          ? "Select a vehicle to see pricing"
                          : isCalculatingDistance
                            ? "Calculating route..."
                            : "Calculating estimate..."}
                    </p>
                  </div>

                  <button
                    disabled
                    className="w-full bg-gray-300 text-gray-500 font-semibold py-4 rounded-xl cursor-not-allowed"
                  >
                    Enter Details Above
                  </button>
                </div>
              )}

              {/* Provider Contact */}
              {provider?.user && (
                <div className="mt-6 pt-6 border-t-2 border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                      {displayLetter}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-800">
                        {displayName}
                      </p>
                      <p className="text-xs text-gray-600">
                        {provider.city}, {provider.region}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    {provider.user.phone && (
                      <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                        <Phone className="w-3 h-3" />
                        <span>{provider.user.phone}</span>
                      </div>
                    )}
                    {provider.user.email && (
                      <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                        <Mail className="w-3 h-3" />
                        <span className="truncate">{provider.user.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}