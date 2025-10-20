import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Truck, Edit, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import VehicleForm from "../../components/VehicleForm/VehicleForm";
import { getVehiclesByProvider } from "../../services/vehicleApi";
import api from "../../services/axios";
import type { Vehicle } from "../../types/vehicle";

export default function Vehicles() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [providerId, setProviderId] = useState<string>("");

  // Fetch provider profile
  useQuery({
    queryKey: ["myProvider"],
    queryFn: async () => {
      const res = await api.get("/providers/me/profile");
      setProviderId(res.data.id);
      console.log("Response Data:", res.data);

      return res.data;
    },
  });

  // Fetch vehicles with images
  const { data: vehicles = [], isLoading } = useQuery({
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
      toast.success("Vehicle deleted");
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Vehicles</h1>
          <p className="text-gray-600 mt-1">
            Manage your fleet and vehicle information
          </p>
        </div>
        <button
          onClick={handleAddVehicle}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          <Plus className="w-5 h-5" /> Add Vehicle
        </button>
      </div>

      {vehicles?.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Truck className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No Vehicles Added
          </h3>
          <p className="text-gray-600 mb-6">
            Start by adding your first vehicle
          </p>
          <button
            onClick={handleAddVehicle}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Add Your First Vehicle
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => {
            const hasImages = vehicle.files && vehicle.files.length > 0;
            const primaryImage = vehicle.files?.[0]?.url || null;

            // Debug: Log the image path
            if (primaryImage) {
              console.log(
                "Vehicle:",
                vehicle.plate,
                "Image path:",
                primaryImage
              );
            }

            return (
              <div
                key={vehicle.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
              >
                {/* Vehicle Image */}
                <div className="h-48 bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center relative overflow-hidden">
                  {primaryImage ? (
                    <img
                      src={`${
                        import.meta.env.VITE_API_URL ||
                        window.location.origin.replace("5173", "4000")
                      }/${primaryImage.replace(/\\/g, "/")}`}
                      alt={`${vehicle.make} ${vehicle.model}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error("Image failed to load:", primaryImage);
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                      }}
                    />
                  ) : (
                    <Truck className="w-20 h-20 text-green-600" />
                  )}
                  {!primaryImage && (
                    <Truck className="w-20 h-20 text-green-600" />
                  )}
                  {vehicle.files && vehicle.files.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                      +{vehicle.files.length - 1} more
                    </div>
                  )}
                </div>

                {/* Vehicle Details */}
                <div className="p-5">
                  {/* Vehicle Name & Type */}
                  <div className="mb-3">
                    <h3 className="text-lg font-bold text-gray-800">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                        {getVehicleTypeLabel(vehicle.type)}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-medium">
                        {vehicle.color}
                      </span>
                    </div>
                  </div>

                  {/* License Plate */}
                  <p className="text-sm text-gray-600 font-mono bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 mb-3">
                    {vehicle.plate}
                  </p>

                  {/* Specifications */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Capacity:</span>
                      <span className="font-semibold text-gray-800">
                        {vehicle.capacity} m³
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Max Weight:</span>
                      <span className="font-semibold text-gray-800">
                        {vehicle.weight} kg
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Base Rate:</span>
                      <span className="font-semibold text-green-600">
                        R {vehicle.baseRate.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Per KM:</span>
                      <span className="font-semibold text-green-600">
                        R {vehicle.perKmRate?.toFixed(2) || 0}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t mt-4">
                    <button
                      onClick={() => handleEditVehicle(vehicle)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                    >
                      <Edit className="w-4 h-4" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteVehicle(vehicle.id!)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
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
  );
}
