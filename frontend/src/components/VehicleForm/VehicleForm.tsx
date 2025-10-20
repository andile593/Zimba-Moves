import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Truck, X, Image as ImageIcon, Info } from "lucide-react";
import FileUpload from "../FileUpload/FileUpload";
import { uploadProviderFile } from "../../services/providerFileUploadApi";
import api from "../../services/axios";
import type { CreateVehicleInput, Vehicle } from "../../types/vehicle";

interface VehicleFormProps {
  providerId: string;
  onClose: () => void;
  existingVehicle?: Vehicle;
}

type VehiclePayload = Omit<CreateVehicleInput, "providerId">;

export default function VehicleForm({
  providerId,
  onClose,
  existingVehicle,
}: VehicleFormProps) {
  const queryClient = useQueryClient();
  const isEditing = !!existingVehicle;

  const [formData, setFormData] = useState<VehiclePayload>({
    make: existingVehicle?.make || "",
    model: existingVehicle?.model || "",
    year: existingVehicle?.year || new Date().getFullYear(),
    color: existingVehicle?.color || "",
    type: existingVehicle?.type || "SMALL_VAN",
    capacity: existingVehicle?.capacity || 1,
    weight: existingVehicle?.weight || 1,
    plate: existingVehicle?.plate || "",
    baseRate: existingVehicle?.baseRate || 1,
    perKmRate: existingVehicle?.perKmRate || 0,
  });

  const [vehicleImages, setVehicleImages] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const vehicleMutation = useMutation({
    mutationFn: async (data: VehiclePayload) => {
      if (isEditing) {
        return api.put<Vehicle>(`/vehicles/${existingVehicle!.id}`, data);
      }
      return api.post<Vehicle>(`/providers/${providerId}/vehicles`, data);
    },
    onSuccess: async ({ data: vehicle }) => {
      // Upload images after vehicle is created/updated
      if (vehicleImages.length > 0 && vehicle.id) {
        setIsUploading(true);
        try {
          await Promise.all(
            vehicleImages.map((file) =>
              uploadProviderFile(providerId, file, "BRANDING", vehicle.id!)
            )
          );
          toast.success(
            isEditing
              ? "Vehicle updated with images!"
              : "Vehicle added with images!"
          );
        } catch (error) {
          console.error("Image upload error:", error);
          toast.error("Vehicle saved but some images failed to upload");
        } finally {
          setIsUploading(false);
        }
      } else {
        toast.success(isEditing ? "Vehicle updated!" : "Vehicle added!");
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["vehicles", providerId] });
      queryClient.invalidateQueries({
        queryKey: ["providerFiles", providerId],
      });
      onClose();
    },
    onError: (err: any) => {
      toast.error(
        err.response?.data?.error ||
          `Failed to ${isEditing ? "update" : "add"} vehicle`
      );
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : ["capacity", "weight", "baseRate", "perKmRate", "year"].includes(
              name
            )
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleImageSelect = (file: File) => {
    if (vehicleImages.length >= 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }
    setVehicleImages((prev) => [...prev, file]);
  };

  const handleImageRemove = (index: number) => {
    setVehicleImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      plate: formData.plate.trim().toUpperCase(),
      make: formData.make.trim(),
      model: formData.model.trim(),
      color: formData.color.trim(),
    };

    if (!payload.make) return toast.error("Vehicle make is required");
    if (!payload.model) return toast.error("Vehicle model is required");
    if (
      !payload.year ||
      payload.year < 1900 ||
      payload.year > new Date().getFullYear() + 1
    )
      return toast.error("Please enter a valid year");
    if (!payload.color) return toast.error("Vehicle color is required");
    if (!payload.plate) return toast.error("License plate is required");
    if (payload.capacity <= 0 || payload.weight <= 0 || payload.baseRate <= 0)
      return toast.error(
        "Capacity, weight, and base rate must be positive numbers"
      );

    vehicleMutation.mutate(payload);
  };

  const isLoading = vehicleMutation.isPending || isUploading;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {isEditing ? "Edit Vehicle" : "Add New Vehicle"}
              </h2>
              <p className="text-sm text-green-100">
                {isEditing
                  ? "Update vehicle information"
                  : "Register a new vehicle to your fleet"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 hover:bg-white/20 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Vehicle Details Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
              Vehicle Details
            </h3>

            {/* Make & Model */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Make <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="make"
                  value={formData.make}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="w-full px-4 text-gray-600 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition disabled:opacity-50"
                  placeholder="e.g., Toyota"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Model <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="w-full px-4 text-gray-600 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition disabled:opacity-50"
                  placeholder="e.g., Hilux"
                />
              </div>
            </div>

            {/* Year & Color */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Year <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  className="w-full px-4 text-gray-600 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition disabled:opacity-50"
                  placeholder="e.g., 2020"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Color <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="w-full px-4 text-gray-600 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition disabled:opacity-50"
                  placeholder="e.g., White"
                />
              </div>
            </div>

            {/* Vehicle Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Vehicle Type <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                disabled={isLoading}
                className="w-full px-4 text-gray-600 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition disabled:opacity-50"
              >
                <option value="SMALL_VAN">Small Van</option>
                <option value="MEDIUM_TRUCK">Medium Truck</option>
                <option value="LARGE_TRUCK">Large Truck</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            {/* License Plate */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                License Plate <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="plate"
                value={formData.plate}
                onChange={handleInputChange}
                disabled={isLoading}
                className="w-full px-4 text-gray-600 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition uppercase font-mono text-lg disabled:opacity-50"
                placeholder="TNM 145 GP"
              />
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <Info className="w-3 h-3" /> Enter the vehicle's registration
                number
              </p>
            </div>
          </div>

          {/* Specifications Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
              Specifications
            </h3>

            {/* Capacity & Weight */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Capacity (m³)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="w-full text-gray-600 px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition bg-white disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Max Weight (kg)
                </label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="w-full text-gray-600 px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition bg-white disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
              Pricing
            </h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Base Rate (R)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="baseRate"
                  value={formData.baseRate}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="w-full text-gray-600 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Per KM Rate (R)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="perKmRate"
                  value={formData.perKmRate}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="w-full text-gray-600 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Vehicle Images */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" /> Vehicle Images (Optional)
            </h3>
            <div className="space-y-3">
              {vehicleImages.map((file, index) => (
                <div
                  key={index}
                  className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleImageRemove(index)}
                      disabled={isLoading}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {vehicleImages.length < 5 && (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-green-400 transition">
                  <FileUpload
                    category="BRANDING"
                    label="Add Vehicle Image"
                    description="Upload photos of your vehicle (up to 5 images)"
                    accept="image/*"
                    selectedFile={null}
                    onFileSelect={handleImageSelect}
                    onFileRemove={() => {}}
                  />
                </div>
              )}
            </div>
            {vehicleImages.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                {vehicleImages.length} image
                {vehicleImages.length !== 1 ? "s" : ""} selected
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading
                ? isUploading
                  ? "Uploading images..."
                  : isEditing
                  ? "Updating..."
                  : "Adding..."
                : isEditing
                ? "✓ Update Vehicle"
                : "✓ Add Vehicle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
