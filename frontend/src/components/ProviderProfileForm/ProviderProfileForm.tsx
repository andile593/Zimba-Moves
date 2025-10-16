import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { MapPin, FileText, CheckCircle, Loader2, X, Upload, ChevronDown } from "lucide-react";
import { createProvider } from "../../services/providerApi";
import { uploadProviderFile } from "../../services/providerFileUploadApi";
import { geocodeAddress } from "../../services/geocodingService";
import type { CreateProviderInput } from "../../types/provider";
import type { FileCategory } from "../../types/enums";

interface FileUploadProps {
  category: FileCategory;
  label: string;
  description: string;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  selectedFile: File | null | undefined;
  accept?: string;
}

const FileUpload = ({ 
  label, 
  description, 
  onFileSelect, 
  onFileRemove, 
  selectedFile, 
  accept 
}: FileUploadProps) => (
  <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
    <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
    <p className="text-xs text-gray-500 mb-3">{description}</p>
    {!selectedFile ? (
      <label className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 hover:bg-green-50 transition">
        <Upload className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-600">Choose file</span>
        <input
          type="file"
          accept={accept || "*"}
          onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0])}
          className="hidden"
        />
      </label>
    ) : (
      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
        <span className="text-sm text-gray-700 truncate flex-1">{selectedFile.name}</span>
        <button
          type="button"
          onClick={onFileRemove}
          className="ml-2 p-1 text-red-500 hover:bg-red-100 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    )}
  </div>
);

interface FileUploadData {
  category: FileCategory;
  file: File | null;
}

export default function ProviderProfileForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateProviderInput>({
    includeHelpers: false,
    address: "",
    city: "",
    region: "",
    country: "South Africa",
    postalCode: "",
    latitude: undefined,
    longitude: undefined,
  });

  const [files, setFiles] = useState<FileUploadData[]>([
    { category: "LICENSE", file: null },
    { category: "INSURANCE", file: null },
    { category: "PROFILE_PIC", file: null },
  ]);

  const [isGeocodingLocation, setIsGeocodingLocation] = useState(false);
  const [locationVerified, setLocationVerified] = useState(false);
  const [showDocuments, setShowDocuments] = useState(false);

  // Auto-geocode when address fields change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.address || formData.city) {
        handleGeocodeLocation();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [formData.address, formData.city, formData.region, formData.country]);

  const handleGeocodeLocation = async () => {
    if (!formData.address && !formData.city) {
      setLocationVerified(false);
      return;
    }

    setIsGeocodingLocation(true);
    setLocationVerified(false);

    try {
      const result = await geocodeAddress(
        formData.address || '',
        formData.city || '',
        formData.region || '',
        formData.country || 'South Africa'
      );

      if (result) {
        setFormData(prev => ({
          ...prev,
          latitude: result.latitude,
          longitude: result.longitude,
        }));
        setLocationVerified(true);
      } else {
        setFormData(prev => ({
          ...prev,
          latitude: undefined,
          longitude: undefined,
        }));
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    } finally {
      setIsGeocodingLocation(false);
    }
  };

  const createProviderMutation = useMutation({
    mutationFn: createProvider,
    onSuccess: async (response) => {
      const provider = response.data;
      
      const filesToUpload = files.filter(f => f.file !== null);
      
      if (filesToUpload.length > 0) {
        try {
          const uploadPromises = filesToUpload.map(f => 
            uploadProviderFile(provider.id, f.file!, f.category)
          );
          await Promise.all(uploadPromises);
          toast.success("Provider profile created with documents!");
        } catch (err) {
          toast.error("Profile created! You can upload documents from the Documents page.");
        }
      } else {
        toast.success("Provider profile created! Don't forget to upload required documents.");
      }

      navigate("/provider/profile");
    },
    onError: (err: any) => {
      const errorMsg = err.response?.data?.error || err.response?.data?.details || "Failed to create provider profile";
      toast.error(errorMsg);
      console.error('Error creating provider:', err.response?.data);
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleFileSelect = (category: FileCategory, file: File) => {
    setFiles(prev =>
      prev.map(f => (f.category === category ? { ...f, file } : f))
    );
  };

  const handleFileRemove = (category: FileCategory) => {
    setFiles(prev =>
      prev.map(f => (f.category === category ? { ...f, file: null } : f))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if ((formData.address || formData.city) && !formData.latitude) {
      toast.error("Unable to verify your location. Please check your address.");
      return;
    }

    const cleanData: any = {
      includeHelpers: formData.includeHelpers || false,
    };

    if (formData.address?.trim()) cleanData.address = formData.address.trim();
    if (formData.city?.trim()) cleanData.city = formData.city.trim();
    if (formData.region?.trim()) cleanData.region = formData.region.trim();
    if (formData.country?.trim()) cleanData.country = formData.country.trim();
    if (formData.postalCode?.trim()) cleanData.postalCode = formData.postalCode.trim();
    
    if (formData.latitude) cleanData.latitude = formData.latitude;
    if (formData.longitude) cleanData.longitude = formData.longitude;

    console.log('Submitting provider data:', cleanData);
    createProviderMutation.mutate(cleanData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <div className="bg-green-600 text-white px-4 py-6 shadow-lg">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">Create Provider Profile</h1>
          <p className="text-green-100 text-sm">Set up your moving service profile</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Location Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-4 py-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location Information
            </h2>
          </div>

          <div className="p-4 space-y-4">
            {/* Location Status */}
            {(formData.address || formData.city) && (
              <div className="rounded-lg p-3 bg-gray-50">
                {isGeocodingLocation && (
                  <div className="flex items-center gap-2 text-blue-600 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying location...</span>
                  </div>
                )}
                {!isGeocodingLocation && locationVerified && formData.latitude && formData.longitude && (
                  <div className="flex items-start gap-2 text-green-600 text-sm">
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Location verified!</div>
                      <div className="text-xs text-gray-600 mt-1">
                        Lat: {formData.latitude.toFixed(4)}, Lng: {formData.longitude.toFixed(4)}
                      </div>
                    </div>
                  </div>
                )}
                {!isGeocodingLocation && !locationVerified && (formData.address || formData.city) && (
                  <div className="flex items-center gap-2 text-amber-600 text-sm">
                    <span>⚠️</span>
                    <span>Unable to verify location. Please check your address.</span>
                  </div>
                )}
              </div>
            )}

            {/* Address Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Street Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="e.g., 123 Main Street"
                className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
              />
            </div>

            {/* City Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="e.g., Johannesburg"
                required
                className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
              />
            </div>

            {/* Region Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Region / Province
              </label>
              <input
                type="text"
                name="region"
                value={formData.region}
                onChange={handleInputChange}
                placeholder="e.g., Gauteng"
                className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
              />
            </div>

            {/* Two Column Layout for Country and Postal */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Postal Code
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  placeholder="2000"
                  className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
                />
              </div>
            </div>

            {/* Include Helpers Checkbox */}
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="includeHelpers"
                  checked={formData.includeHelpers}
                  onChange={handleInputChange}
                  className="mt-1 w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <div>
                  <div className="font-semibold text-gray-800 text-sm">Include Helpers</div>
                  <div className="text-xs text-gray-600 mt-1">
                    Check this if you provide moving helpers with your service
                  </div>
                </div>
              </label>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800">
                💡 Your location coordinates are automatically determined from your address for accurate distance calculations.
              </p>
            </div>
          </div>
        </div>

        {/* Documents Section - Collapsible */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <button
            type="button"
            onClick={() => setShowDocuments(!showDocuments)}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 px-4 py-4 flex items-center justify-between text-white"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Business Documents</h2>
            </div>
            <ChevronDown className={`w-5 h-5 transition-transform ${showDocuments ? 'rotate-180' : ''}`} />
          </button>

          {showDocuments && (
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
                📄 Optional - You can upload these documents later from your profile
              </p>

              <FileUpload
                category="LICENSE"
                label="Business License"
                description="Upload your valid business operating license"
                onFileSelect={(file) => handleFileSelect("LICENSE", file)}
                onFileRemove={() => handleFileRemove("LICENSE")}
                selectedFile={files.find(f => f.category === "LICENSE")?.file}
              />

              <FileUpload
                category="INSURANCE"
                label="Insurance Certificate"
                description="Proof of liability insurance coverage"
                onFileSelect={(file) => handleFileSelect("INSURANCE", file)}
                onFileRemove={() => handleFileRemove("INSURANCE")}
                selectedFile={files.find(f => f.category === "INSURANCE")?.file}
              />

              <FileUpload
                category="PROFILE_PIC"
                label="Company Logo"
                description="Your company logo or profile picture"
                accept="image/*"
                onFileSelect={(file) => handleFileSelect("PROFILE_PIC", file)}
                onFileRemove={() => handleFileRemove("PROFILE_PIC")}
                selectedFile={files.find(f => f.category === "PROFILE_PIC")?.file}
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 -mx-4 px-4 py-4 shadow-lg space-y-3">
          <button
            type="submit"
            disabled={createProviderMutation.isPending || isGeocodingLocation}
            className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
          >
            {createProviderMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating Profile...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Create Profile
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}