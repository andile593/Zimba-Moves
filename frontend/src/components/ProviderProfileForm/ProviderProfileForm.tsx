import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  MapPin,
  FileText,
  CheckCircle,
  Loader2,
  AlertCircle,
  Building2,
  CreditCard,
  Truck,
  User,
} from "lucide-react";
import FileUpload from "../FileUpload/FileUpload";
import { uploadProviderFile } from "../../services/providerFileUploadApi";
import { geocodeAddress } from "../../services/geocodingService";
import api from "../../services/axios";
import type { FileCategory } from "../../types";

interface ApplicationFormData {
  // Personal
  idNumber: string;
  
  // Business
  businessName: string;
  businessType: string;
  taxNumber: string;
  
  // Banking
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  
  // Location
  address: string;
  city: string;
  region: string;
  country: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
  
  // Inspection
  inspectionRequested: boolean;
  inspectionAddress: string;
  inspectionNotes: string;
  
  // Service
  includeHelpers: boolean;
}

interface DocumentFile {
  category: FileCategory;
  file: File | null;
  required: boolean;
}

export default function ProviderApplicationForm() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [locationVerified, setLocationVerified] = useState(false);
  const [isGeocodingLocation, setIsGeocodingLocation] = useState(false);

  const [formData, setFormData] = useState<ApplicationFormData>({
    idNumber: "",
    businessName: "",
    businessType: "SOLE_PROPRIETOR",
    taxNumber: "",
    bankName: "",
    accountNumber: "",
    accountHolder: "",
    address: "",
    city: "",
    region: "",
    country: "South Africa",
    postalCode: "",
    inspectionRequested: false,
    inspectionAddress: "",
    inspectionNotes: "",
    includeHelpers: false
  });

  const [documents, setDocuments] = useState<DocumentFile[]>([
    { category: "ID_DOCUMENT", file: null, required: true },
    { category: "PROOF_OF_ADDRESS", file: null, required: true },
    { category: "VEHICLE_REGISTRATION", file: null, required: true },
    { category: "VEHICLE_LICENSE_DISK", file: null, required: true },
    { category: "LICENSE", file: null, required: false },
    { category: "INSURANCE", file: null, required: false }
  ]);

  const submitMutation = useMutation({
    mutationFn: async (data: ApplicationFormData) => {
      return api.post("/providers/application", data);
    },
    onSuccess: async (response) => {
      const provider = response.data.provider;
      
      // Upload documents
      const filesToUpload = documents.filter(d => d.file !== null);
      
      if (filesToUpload.length > 0) {
        try {
          await Promise.all(
            filesToUpload.map(d =>
              uploadProviderFile(provider.id, d.file!, d.category)
            )
          );
        } catch (err) {
          console.error("Document upload error:", err);
        }
      }

      toast.success("Application submitted! We'll review it within 2-3 business days.");
      navigate("/provider");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Failed to submit application");
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleFileSelect = (category: string, file: File) => {
    setDocuments(prev =>
      prev.map(d => (d.category === category ? { ...d, file } : d))
    );
  };

  const handleFileRemove = (category: string) => {
    setDocuments(prev =>
      prev.map(d => (d.category === category ? { ...d, file: null } : d))
    );
  };

  const handleGeocodeLocation = async () => {
    if (!formData.address || !formData.city) {
      setLocationVerified(false);
      return;
    }

    setIsGeocodingLocation(true);
    try {
      const result = await geocodeAddress(
        formData.address,
        formData.city,
        formData.region,
        formData.country
      );

      if (result) {
        setFormData(prev => ({
          ...prev,
          latitude: result.latitude,
          longitude: result.longitude
        }));
        setLocationVerified(true);
      } else {
        // Set a default/approximate location if geocoding fails
        setLocationVerified(false);
        toast("Location verification optional - you can still proceed", {
          icon: "ℹ️"
        });
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      setLocationVerified(false);
      toast("Location verification failed - you can still proceed", {
        icon: "ℹ️"
      });
    } finally {
      setIsGeocodingLocation(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required documents
    const missingDocs = documents.filter(d => d.required && !d.file);
    if (missingDocs.length > 0) {
      toast.error("Please upload all required documents");
      return;
    }

    // Location verification is now optional - just warn if not verified
    if ((formData.address || formData.city) && !formData.latitude) {
      console.warn("Location not verified, but proceeding anyway");
    }

    submitMutation.mutate(formData);
  };

  const steps = [
    { number: 1, title: "Personal Info", icon: User },
    { number: 2, title: "Business Details", icon: Building2 },
    { number: 3, title: "Location", icon: MapPin },
    { number: 4, title: "Banking", icon: CreditCard },
    { number: 5, title: "Documents", icon: FileText },
    { number: 6, title: "Inspection", icon: Truck }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pb-24">
      {/* Header */}
      <div className="bg-green-600 text-white px-4 py-6 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">Provider Application</h1>
          <p className="text-green-100 text-sm">Complete all steps to submit your application</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between overflow-x-auto">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              
              return (
                <div key={step.number} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
                      isCompleted ? "bg-green-600 text-white" :
                      isActive ? "bg-green-600 text-white" :
                      "bg-gray-200 text-gray-500"
                    }`}>
                      {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <span className={`text-xs mt-1 font-medium ${isActive ? "text-green-600" : "text-gray-500"}`}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-1 mx-2 ${isCompleted ? "bg-green-600" : "bg-gray-200"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-4 py-6">
        {/* Step 1: Personal Info */}
        {currentStep === 1 && (
          <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <User className="w-6 h-6 text-green-600" />
              Personal Information
            </h2>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ID Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleInputChange}
                placeholder="8001015009087"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
              />
              <p className="text-xs text-gray-500 mt-1">
                Your South African ID number for verification purposes
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Business Details */}
        {currentStep === 2 && (
          <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-green-600" />
              Business Information
            </h2>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Business Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                placeholder="Your Business Name"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Business Type <span className="text-red-500">*</span>
              </label>
              <select
                name="businessType"
                value={formData.businessType}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
              >
                <option value="SOLE_PROPRIETOR">Sole Proprietor</option>
                <option value="COMPANY">Company (Pty Ltd)</option>
                <option value="PARTNERSHIP">Partnership</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tax Number (Optional)
              </label>
              <input
                type="text"
                name="taxNumber"
                value={formData.taxNumber}
                onChange={handleInputChange}
                placeholder="VAT/Income Tax Number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
              />
            </div>
          </div>
        )}

        {/* Step 3: Location */}
        {currentStep === 3 && (
          <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-green-600" />
              Location Information
            </h2>

            {(isGeocodingLocation || locationVerified || (formData.address && formData.city && !locationVerified)) && (
              <div className={`rounded-lg p-3 flex items-start gap-2 ${
                isGeocodingLocation ? "bg-blue-50 border border-blue-200" :
                locationVerified ? "bg-green-50 border border-green-200" :
                "bg-yellow-50 border border-yellow-200"
              }`}>
                {isGeocodingLocation ? (
                  <>
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-blue-800">Verifying location...</span>
                  </>
                ) : locationVerified ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="text-sm text-green-800 font-medium">Location verified successfully</span>
                      {formData.latitude && formData.longitude && (
                        <p className="text-xs text-green-700 mt-0.5">
                          Coordinates: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="text-sm text-yellow-800 font-medium">Location verification optional</span>
                      <p className="text-xs text-yellow-700 mt-0.5">
                        You can proceed without location verification. This can be updated later in your profile.
                      </p>
                      <button
                        type="button"
                        onClick={handleGeocodeLocation}
                        className="mt-2 text-xs text-yellow-800 underline hover:text-yellow-900"
                      >
                        Try verifying again
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800">
                💡 <strong>Tip:</strong> Accurate location helps customers find you easily. The system will attempt to verify your address automatically as you type.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Street Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                onBlur={handleGeocodeLocation}
                placeholder="123 Main Street"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  onBlur={handleGeocodeLocation}
                  placeholder="Johannesburg"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Province
                </label>
                <input
                  type="text"
                  name="region"
                  value={formData.region}
                  onChange={handleInputChange}
                  placeholder="Gauteng"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                />
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
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
          </div>
        )}

        {/* Step 4: Banking */}
        {currentStep === 4 && (
          <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-green-600" />
              Banking Information
            </h2>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800">
                Your banking details are required for receiving payments from bookings
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Bank Name <span className="text-red-500">*</span>
              </label>
              <select
                name="bankName"
                value={formData.bankName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
              >
                <option value="">Select Bank</option>
                <option value="ABSA">ABSA</option>
                <option value="FNB">FNB</option>
                <option value="Standard Bank">Standard Bank</option>
                <option value="Nedbank">Nedbank</option>
                <option value="Capitec">Capitec</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Account Holder Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="accountHolder"
                value={formData.accountHolder}
                onChange={handleInputChange}
                placeholder="Full name as per bank account"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Account Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleInputChange}
                placeholder="Bank account number"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
              />
            </div>
          </div>
        )}

        {/* Step 5: Documents */}
        {currentStep === 5 && (
          <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FileText className="w-6 h-6 text-green-600" />
              Required Documents
            </h2>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-800">
                All documents must be clear, valid, and legible. Accepted formats: JPG, PNG, PDF (max 5MB)
              </p>
            </div>

            <FileUpload
              category="ID_DOCUMENT"
              label="ID Document"
              description="Upload a clear copy of your South African ID"
              accept="image/*,.pdf"
              required={true}
              selectedFile={documents.find(d => d.category === "ID_DOCUMENT")?.file}
              onFileSelect={(file) => handleFileSelect("ID_DOCUMENT", file)}
              onFileRemove={() => handleFileRemove("ID_DOCUMENT")}
            />

            <FileUpload
              category="PROOF_OF_ADDRESS"
              label="Proof of Address"
              description="Recent utility bill or bank statement (not older than 3 months)"
              accept="image/*,.pdf"
              required={true}
              selectedFile={documents.find(d => d.category === "PROOF_OF_ADDRESS")?.file}
              onFileSelect={(file) => handleFileSelect("PROOF_OF_ADDRESS", file)}
              onFileRemove={() => handleFileRemove("PROOF_OF_ADDRESS")}
            />

            <FileUpload
              category="VEHICLE_REGISTRATION"
              label="Vehicle Registration (License Disk)"
              description="Upload your vehicle registration certificate"
              accept="image/*,.pdf"
              required={true}
              selectedFile={documents.find(d => d.category === "VEHICLE_REGISTRATION")?.file}
              onFileSelect={(file) => handleFileSelect("VEHICLE_REGISTRATION", file)}
              onFileRemove={() => handleFileRemove("VEHICLE_REGISTRATION")}
            />

            <FileUpload
              category="VEHICLE_LICENSE_DISK"
              label="Valid License Disk"
              description="Photo of current vehicle license disk"
              accept="image/*"
              required={true}
              selectedFile={documents.find(d => d.category === "VEHICLE_LICENSE_DISK")?.file}
              onFileSelect={(file) => handleFileSelect("VEHICLE_LICENSE_DISK", file)}
              onFileRemove={() => handleFileRemove("VEHICLE_LICENSE_DISK")}
            />

            <div className="pt-4 border-t">
              <h3 className="font-semibold text-gray-800 mb-3">Optional Documents</h3>
              
              <FileUpload
                category="LICENSE"
                label="Business License (Optional)"
                description="If you have a registered business"
                accept="image/*,.pdf"
                required={false}
                selectedFile={documents.find(d => d.category === "LICENSE")?.file}
                onFileSelect={(file) => handleFileSelect("LICENSE", file)}
                onFileRemove={() => handleFileRemove("LICENSE")}
              />

              <FileUpload
                category="INSURANCE"
                label="Insurance Certificate (Optional)"
                description="Vehicle or goods-in-transit insurance"
                accept="image/*,.pdf"
                required={false}
                selectedFile={documents.find(d => d.category === "INSURANCE")?.file}
                onFileSelect={(file) => handleFileSelect("INSURANCE", file)}
                onFileRemove={() => handleFileRemove("INSURANCE")}
              />
            </div>
          </div>
        )}

        {/* Step 6: Inspection Request */}
        {currentStep === 6 && (
          <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Truck className="w-6 h-6 text-green-600" />
              Vehicle Inspection
            </h2>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Why do we inspect vehicles?</h3>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Verify vehicle condition and cleanliness</li>
                <li>• Confirm vehicle specifications match your listing</li>
                <li>• Ensure safety standards are met</li>
                <li>• Check license disk validity</li>
              </ul>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="inspectionRequested"
                  checked={formData.inspectionRequested}
                  onChange={handleInputChange}
                  className="mt-1 w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <div>
                  <div className="font-semibold text-gray-800">Request Vehicle Inspection</div>
                  <div className="text-xs text-gray-600 mt-1">
                    We'll schedule an inspection at your preferred location
                  </div>
                </div>
              </label>
            </div>

            {formData.inspectionRequested && (
              <div className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Inspection Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="inspectionAddress"
                    value={formData.inspectionAddress}
                    onChange={handleInputChange}
                    placeholder="Where should we inspect your vehicle?"
                    required={formData.inspectionRequested}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    name="inspectionNotes"
                    value={formData.inspectionNotes}
                    onChange={handleInputChange}
                    placeholder="Any specific instructions or preferred times?"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                  />
                </div>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs text-yellow-800">
                <strong>Note:</strong> Inspection is typically completed within 5-7 business days after approval. We'll contact you to schedule a convenient time.
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="sticky bottom-0 bg-white border-t shadow-lg p-4 -mx-4 mt-6">
          <div className="flex gap-3 max-w-4xl mx-auto">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
              >
                Back
              </button>
            )}
            
            {currentStep < 6 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition shadow-lg"
              >
                Continue
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitMutation.isPending}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Submit Application
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}