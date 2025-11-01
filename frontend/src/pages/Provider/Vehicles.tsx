// frontend/src/pages/Provider/Vehicles.tsx - Updated with getVehicleImageUrl

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Truck,
  Edit,
  Trash2,
  Package,
  Gauge,
  Weight,
  DollarSign,
  Palette,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";
import VehicleForm from "../../components/VehicleForm/VehicleForm";
import { getVehiclesByProvider } from "../../services/vehicleApi";
import { getVehicleImageUrl } from "../../utils/imageUtils";
import api from "../../services/axios";
import type { Vehicle } from "../../types/vehicle";

export default function Vehicles() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [providerId, setProviderId] = useState<string>("");

  // Fetch provider profile
  const { isLoading: isLoadingProvider } = useQuery({
    queryKey: ["myProvider"],
    queryFn: async () => {
      const res = await api.get("/providers/me/profile");
      setProviderId(res.data.id);
      return res.data;
    },
  });

  // Fetch vehicles with images
  const { data: vehicles = [], isLoading: isLoadingVehicles } = useQuery({
    queryKey: ["vehicles", providerId],
    queryFn: async () => {
      if (!providerId) return [];
      const res = await getVehiclesByProvider(providerId);
      return res.data as Vehicle[];
    },
    enabled: !!providerId,
  });

  // Delete vehicle
  const deleteMutation = useMutation({
    mutationFn: (vehicleId: string) => api.delete(`/vehicles/${vehicleId}`),
    onSuccess: () => {
      toast.success("Vehicle deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["vehicles", providerId] });
    },
    onError: () => toast.error("Failed to delete vehicle"),
  });

  const handleAddVehicle = () => {
    setEditingVehicle(null);
    setShowForm(true);
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setShowForm(true);
  };

  const handleDeleteVehicle = (vehicleId: string) => {
    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      deleteMutation.mutate(vehicleId);
    }
  };

  const getVehicleTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      SMALL_VAN: "Small Van",
      MEDIUM_TRUCK: "Medium Truck",
      LARGE_TRUCK: "Large Truck",
      OTHER: "Other",
    };
    return labels[type] || type;
  };

  const getVehicleTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      SMALL_VAN: "bg-blue-100 text-blue-700 border-blue-200",
      MEDIUM_TRUCK: "bg-purple-100 text-purple-700 border-purple-200",
      LARGE_TRUCK: "bg-orange-100 text-orange-700 border-orange-200",
      OTHER: "bg-gray-100 text-gray-700 border-gray-200",
    };
    return colors[type] || colors.OTHER;
  };

  // Show loading state while fetching provider or vehicles
  const isLoading = isLoadingProvider || isLoadingVehicles;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Loading Header Skeleton */}
          <div className="mb-8">
            <div className="h-12 bg-gray-200 rounded-lg w-64 mb-3 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded-lg w-96 animate-pulse"></div>
          </div>

          {/* Loading Cards Skeleton */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
              >
                <div className="h-56 bg-gray-200 animate-pulse"></div>
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                My Vehicles
              </h1>
              <p className="text-lg text-gray-600">
                Manage your fleet and vehicle information
              </p>
            </div>
            <button
              onClick={handleAddVehicle}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl hover:from-green-700 hover:to-green-600 transition-all shadow-lg hover:shadow-xl font-semibold"
            >
              <Plus className="w-5 h-5" />
              Add Vehicle
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        {vehicles.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Truck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">
                    Total Fleet
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {vehicles.length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">
                    Avg Base Rate
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    R
                    {(
                      vehicles.reduce((sum, v) => sum + v.baseRate, 0) /
                      vehicles.length
                    ).toFixed(0)}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">
                    Total Capacity
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {vehicles.reduce((sum, v) => sum + v.capacity, 0)} m³
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <Weight className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">
                    Max Weight
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.max(...vehicles.map((v) => v.weight))} kg
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {vehicles.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Truck className="w-12 h-12 text-green-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-3">
              No Vehicles Yet
            </h3>
            <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
              Start building your fleet by adding your first vehicle
            </p>
            <button
              onClick={handleAddVehicle}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl hover:from-green-700 hover:to-green-600 transition-all shadow-lg hover:shadow-xl font-semibold text-lg"
            >
              <Plus className="w-6 h-6" />
              Add Your First Vehicle
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => {
              // Use the utility function to get the image URL
              const imageUrl = getVehicleImageUrl(vehicle);
              const hasMultipleImages = vehicle.files && vehicle.files.length > 1;

              return (
                <div
                  key={vehicle.id}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 group"
                >
                  {/* Vehicle Image */}
                  <div className="h-56 bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center relative overflow-hidden">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={`${vehicle.make} ${vehicle.model}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                        }}
                      />
                    ) : (
                      <Truck className="w-20 h-20 text-green-600" />
                    )}
                    {hasMultipleImages && (
                      <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full font-semibold">
                        +{vehicle.files!.length - 1} photos
                      </div>
                    )}
                  </div>

                  {/* Vehicle Details */}
                  <div className="p-6">
                    {/* Vehicle Name & Type */}
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-xs px-3 py-1.5 rounded-full font-semibold border ${getVehicleTypeColor(
                            vehicle.type
                          )}`}
                        >
                          {getVehicleTypeLabel(vehicle.type)}
                        </span>
                        <span className="flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full font-semibold border border-gray-200">
                          <Palette className="w-3 h-3" />
                          {vehicle.color}
                        </span>
                      </div>
                    </div>

                    {/* License Plate */}
                    <div className="mb-4 flex items-center gap-2 text-sm text-gray-700 font-mono bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 rounded-xl border-2 border-gray-200">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="font-bold">{vehicle.plate}</span>
                    </div>

                    {/* Specifications Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-5">
                      <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                        <div className="flex items-center gap-2 mb-1">
                          <Package className="w-4 h-4 text-blue-600" />
                          <span className="text-xs text-blue-700 font-medium">
                            Capacity
                          </span>
                        </div>
                        <p className="text-lg font-bold text-blue-900">
                          {vehicle.capacity} m³
                        </p>
                      </div>
                      <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
                        <div className="flex items-center gap-2 mb-1">
                          <Weight className="w-4 h-4 text-purple-600" />
                          <span className="text-xs text-purple-700 font-medium">
                            Max Weight
                          </span>
                        </div>
                        <p className="text-lg font-bold text-purple-900">
                          {vehicle.weight} kg
                        </p>
                      </div>
                      <div className="bg-green-50 rounded-xl p-3 border border-green-100">
                        <div className="flex items-center gap-2 mb-1">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="text-xs text-green-700 font-medium">
                            Base Rate
                          </span>
                        </div>
                        <p className="text-lg font-bold text-green-900">
                          R{vehicle.baseRate.toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-orange-50 rounded-xl p-3 border border-orange-100">
                        <div className="flex items-center gap-2 mb-1">
                          <Gauge className="w-4 h-4 text-orange-600" />
                          <span className="text-xs text-orange-700 font-medium">
                            Per KM
                          </span>
                        </div>
                        <p className="text-lg font-bold text-orange-900">
                          R{vehicle.perKmRate?.toFixed(2) || 0}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleEditVehicle(vehicle)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-green-600 bg-green-50 border-2 border-green-200 rounded-xl hover:bg-green-100 hover:border-green-300 transition-all"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteVehicle(vehicle.id!)}
                        disabled={deleteMutation.isPending}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-red-600 bg-red-50 border-2 border-red-200 rounded-xl hover:bg-red-100 hover:border-red-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4" />
                        {deleteMutation.isPending ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Vehicle Form Modal */}
        {showForm && providerId && (
          <VehicleForm
            providerId={providerId}
            onClose={() => setShowForm(false)}
            existingVehicle={editingVehicle || undefined}
          />
        )}
      </div>
    </div>
  );
}