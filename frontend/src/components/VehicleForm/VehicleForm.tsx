import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { 
  Truck, 
  X, 
  Image as ImageIcon, 
  Info, 
  Calendar,
  Palette,
  Hash,
  Weight,
  Box,
  DollarSign,
  Route,
  Sparkles
} from "lucide-react";
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[92vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300">
        {/* Header with Gradient */}
        <div className="bg-gradient-to-r from-green-600 via-green-600 to-emerald-600 text-white px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 relative overflow-hidden flex-shrink-0">
          <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-36 sm:h-36 md:w-48 md:h-48 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative flex items-start sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Truck className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-1.5 sm:gap-2">
                  <span className="truncate">{isEditing ? "Edit Vehicle" : "Add New Vehicle"}</span>
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-green-200 flex-shrink-0" />
                </h2>
                <p className="text-xs sm:text-sm text-green-100 mt-0.5 sm:mt-1 line-clamp-1">
                  {isEditing
                    ? "Update your vehicle information"
                    : "Register a new vehicle to expand your fleet"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="p-1.5 sm:p-2 md:p-2.5 hover:bg-white/20 rounded-lg sm:rounded-xl transition-all active:scale-95 disabled:opacity-50 flex-shrink-0"
              aria-label="Close"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Form Content - Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
            {/* Vehicle Identity Card */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border-2 border-gray-200">
              <div className="flex items-center gap-2 mb-4 sm:mb-5">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                  Vehicle Identity
                </h3>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                {/* Make */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2.5 flex items-center gap-2">
                    <Hash className="w-4 h-4 text-green-600" />
                    Make <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="make"
                    value={formData.make}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all disabled:opacity-50 disabled:bg-gray-100 text-gray-700 font-medium placeholder:text-gray-400 group-hover:border-gray-400"
                    placeholder="e.g., Toyota, Isuzu"
                  />
                </div>

                {/* Model */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2.5 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-green-600" />
                    Model <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all disabled:opacity-50 disabled:bg-gray-100 text-gray-700 font-medium placeholder:text-gray-400 group-hover:border-gray-400"
                    placeholder="e.g., Hilux, NPR"
                  />
                </div>

                {/* Year */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2.5 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-green-600" />
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
                    className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all disabled:opacity-50 disabled:bg-gray-100 text-gray-700 font-medium placeholder:text-gray-400 group-hover:border-gray-400"
                    placeholder={new Date().getFullYear().toString()}
                  />
                </div>

                {/* Color */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2.5 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-green-600" />
                    Color <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all disabled:opacity-50 disabled:bg-gray-100 text-gray-700 font-medium placeholder:text-gray-400 group-hover:border-gray-400"
                    placeholder="e.g., White, Silver"
                  />
                </div>
              </div>

              {/* Vehicle Type - Full Width */}
              <div className="mt-4 sm:mt-5 group">
                <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-2.5 flex items-center gap-2">
                  <Box className="w-4 h-4 text-green-600" />
                  Vehicle Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="w-full px-3 sm:px-4 py-3 sm:py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all disabled:opacity-50 disabled:bg-gray-100 text-gray-700 font-medium group-hover:border-gray-400 cursor-pointer text-sm sm:text-base"
                >
                  <option value="SMALL_VAN">Small Van (Up to 3m³)</option>
                  <option value="MEDIUM_TRUCK">Medium Truck (3-8m³)</option>
                  <option value="LARGE_TRUCK">Large Truck (8m³+)</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              {/* License Plate - Full Width with Special Styling */}
              <div className="mt-4 sm:mt-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-2.5 flex items-center gap-2">
                  <Hash className="w-4 h-4 text-green-600" />
                  License Plate <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="plate"
                  value={formData.plate}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="w-full px-4 sm:px-5 py-3 sm:py-4 border-2 sm:border-3 border-gray-400 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all uppercase font-mono text-lg sm:text-xl tracking-wider text-center disabled:opacity-50 disabled:bg-gray-100 text-gray-800 font-bold bg-gradient-to-r from-yellow-50 to-orange-50 shadow-inner"
                  placeholder="XMN 342 L"
                  maxLength={15}
                />
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1.5 ml-1">
                  <Info className="w-3 sm:w-3.5 h-3 sm:h-3.5" /> 
                  Enter the vehicle's registration number exactly as shown on the license disk
                </p>
              </div>
            </div>

            {/* Specifications Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border-2 border-blue-200">
              <div className="flex items-center gap-2 mb-4 sm:mb-5">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Box className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                  Specifications
                </h3>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                {/* Capacity */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2.5 flex items-center gap-2">
                    <Box className="w-4 h-4 text-blue-600" />
                    Cargo Capacity (m³) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:opacity-50 disabled:bg-gray-100 text-gray-700 font-medium group-hover:border-gray-400"
                    placeholder="e.g., 5.5"
                  />
                  <p className="text-xs text-gray-500 mt-1.5 ml-1">Volume in cubic meters</p>
                </div>

                {/* Weight */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2.5 flex items-center gap-2">
                    <Weight className="w-4 h-4 text-blue-600" />
                    Max Weight (kg) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:opacity-50 disabled:bg-gray-100 text-gray-700 font-medium group-hover:border-gray-400"
                    placeholder="e.g., 1500"
                  />
                  <p className="text-xs text-gray-500 mt-1.5 ml-1">Maximum payload capacity</p>
                </div>
              </div>
            </div>

            {/* Pricing Card */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border-2 border-green-200">
              <div className="flex items-center gap-2 mb-4 sm:mb-5">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                  Pricing Structure
                </h3>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                {/* Base Rate */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2.5 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    Base Rate (R) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-lg">R</span>
                    <input
                      type="number"
                      step="0.01"
                      name="baseRate"
                      value={formData.baseRate}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className="w-full pl-10 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all disabled:opacity-50 disabled:bg-gray-100 text-gray-700 font-semibold text-lg group-hover:border-gray-400"
                      placeholder="500.00"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5 ml-1">Starting price for the service</p>
                </div>

                {/* Per KM Rate */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2.5 flex items-center gap-2">
                    <Route className="w-4 h-4 text-green-600" />
                    Per KM Rate (R)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-lg">R</span>
                    <input
                      type="number"
                      step="0.01"
                      name="perKmRate"
                      value={formData.perKmRate}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className="w-full pl-10 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all disabled:opacity-50 disabled:bg-gray-100 text-gray-700 font-semibold text-lg group-hover:border-gray-400"
                      placeholder="12.50"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5 ml-1">Additional charge per kilometer</p>
                </div>
              </div>

              {/* Pricing Example */}
              {formData.baseRate > 0 && (
                <div className="mt-4 sm:mt-5 bg-white rounded-xl p-3 sm:p-4 border-2 border-green-200">
                  <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Example Pricing</p>
                  <p className="text-xs text-gray-600">
                    For a 50km trip: <span className="font-bold text-green-700">R{(formData.baseRate + ((formData.perKmRate || 0) * 50)).toFixed(2)}</span>
                    <span className="text-gray-500"> (R{formData.baseRate} base + R{((formData.perKmRate || 0) * 50).toFixed(2)} distance)</span>
                  </p>
                </div>
              )}
            </div>

            {/* Vehicle Images Card */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border-2 border-purple-200">
              <div className="flex items-center gap-2 mb-4 sm:mb-5">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                  Vehicle Photos
                </h3>
                <span className="ml-auto text-xs bg-purple-100 text-purple-700 px-2 sm:px-3 py-1 rounded-full font-medium">
                  Optional
                </span>
              </div>

              <div className="space-y-4">
                {/* Image Previews */}
                {vehicleImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {vehicleImages.map((file, index) => (
                      <div
                        key={index}
                        className="relative group rounded-xl overflow-hidden border-2 border-purple-200 shadow-sm hover:shadow-md transition-all"
                      >
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => handleImageRemove(index)}
                            disabled={isLoading}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg disabled:opacity-50"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <div className="absolute bottom-2 left-2 right-2">
                            <p className="text-xs font-medium text-white truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-200">
                              {(file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Area */}
                {vehicleImages.length < 5 && (
                  <div className="border-2 border-dashed border-purple-300 rounded-xl p-6 hover:border-purple-400 hover:bg-purple-50/50 transition-all">
                    <FileUpload
                      category="BRANDING"
                      label={vehicleImages.length === 0 ? "Upload Vehicle Photos" : "Add More Photos"}
                      description={`High-quality images help attract customers (${vehicleImages.length}/5)`}
                      accept="image/*"
                      selectedFile={null}
                      onFileSelect={handleImageSelect}
                      onFileRemove={() => {}}
                    />
                  </div>
                )}

                {vehicleImages.length >= 5 && (
                  <div className="bg-purple-100 border-2 border-purple-300 rounded-xl p-4 text-center">
                    <p className="text-sm font-medium text-purple-800">
                      ✓ Maximum of 5 images reached
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sticky Footer Actions */}
          <div className="sticky bottom-0 bg-white border-t-2 border-gray-200 px-4 sm:px-6 md:px-8 py-4 sm:py-5 flex flex-col-reverse sm:flex-row gap-3 shadow-2xl">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 sm:px-6 py-3 sm:py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold disabled:opacity-50 active:scale-[0.98] text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-bold text-base sm:text-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span className="text-sm sm:text-base">{isUploading ? "Uploading..." : isEditing ? "Updating..." : "Adding..."}</span>
                </>
              ) : (
                <>
                  {isEditing ? "✓ Update Vehicle" : "✓ Add Vehicle"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}