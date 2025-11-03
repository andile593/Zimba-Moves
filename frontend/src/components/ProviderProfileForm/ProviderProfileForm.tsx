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
  CreditCard,
  User,
  Upload,
  X,
  Home,
  Building2
} from "lucide-react";
import api from "../../services/axios";
import { uploadProviderFile } from "../../services/providerFileUploadApi";
import type { FileCategory } from "../../types";

interface ApplicationFormData {
  idNumber: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  address: string;
  city: string;
  region: string;
  country: string;
  postalCode: string;
  latitude?: number;  
  longitude?: number; 
  includeHelpers: boolean;
}

interface DocumentFile {
  file: File | null;
  required: boolean;
  uploaded?: boolean;
  cloudinaryUrl?: string;
}

export default function ProviderApplicationForm() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
    category: string;
  } | null>(null);

  const [formData, setFormData] = useState<ApplicationFormData>({
    idNumber: "",
    bankName: "",
    accountNumber: "",
    accountHolder: "",
    address: "",
    city: "",
    region: "",
    country: "South Africa",
    postalCode: "",
    latitude: undefined,  
    longitude: undefined,
    includeHelpers: false
  });

  const [documents, setDocuments] = useState<Record<string, DocumentFile>>({
    ID_DOCUMENT: { file: null, required: true, uploaded: false },
    PROOF_OF_ADDRESS: { file: null, required: true, uploaded: false },
    VEHICLE_REGISTRATION_CERT: { file: null, required: true, uploaded: false },
    DRIVERS_LICENSE: { file: null, required: true, uploaded: false }
  });

  const submitMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      try {
        // Step 1: Create application
        console.log("📝 Creating provider application...");
        const appRes = await api.post("/providers/application", data);
        const provider = appRes.data.provider;
        console.log("✓ Application created with ID:", provider.id);

        // Step 2: Upload documents to Cloudinary
        const filesToUpload = Object.entries(documents).filter(
          ([_, doc]) => doc.file !== null
        );

        if (filesToUpload.length > 0) {
          console.log(`📤 Uploading ${filesToUpload.length} documents to Cloudinary...`);
          
          const uploadResults = await Promise.allSettled(
            filesToUpload.map(async ([category, doc], index) => {
              setUploadProgress({
                current: index + 1,
                total: filesToUpload.length,
                category: category
              });

              try {
                console.log(`  → Uploading ${category}...`);
                const uploadedFile = await uploadProviderFile(
                  provider.id,
                  doc.file!,
                  category as FileCategory
                );
                
                console.log(`  ✓ ${category} uploaded to Cloudinary:`, uploadedFile.url);
                
                // Update document state with Cloudinary URL
                setDocuments(prev => ({
                  ...prev,
                  [category]: { 
                    ...prev[category], 
                    uploaded: true, 
                    cloudinaryUrl: uploadedFile.url 
                  }
                }));

                return { category, success: true, url: uploadedFile.url };
              } catch (error: any) {
                console.error(`  ✗ Failed to upload ${category}:`, error);
                return { 
                  category, 
                  success: false, 
                  error: error.response?.data?.error || error.message 
                };
              }
            })
          );

          // Clear progress indicator
          setUploadProgress(null);

          // Check results
          const successful = uploadResults.filter(
            (result) => result.status === "fulfilled" && result.value.success
          ).length;

          const failed = uploadResults.filter(
            (result) => result.status === "rejected" || 
            (result.status === "fulfilled" && !result.value.success)
          );

          console.log(`\n📊 Upload Summary:`);
          console.log(`  ✓ Successful: ${successful}/${filesToUpload.length}`);
          console.log(`  ✗ Failed: ${failed.length}/${filesToUpload.length}`);

          if (failed.length > 0) {
            const failedCategories = failed.map(result => 
              result.status === "fulfilled" ? result.value.category : "Unknown"
            ).join(", ");

            toast.error(
              `Application created but ${failed.length} document(s) failed to upload: ${failedCategories}. You can upload them later from your dashboard.`,
              { duration: 8000 }
            );
          } else {
            console.log("✓ All documents uploaded successfully to Cloudinary");
          }
        }

        return appRes;
      } catch (error) {
        console.error("❌ Application submission error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success(
        "🎉 Application submitted successfully! We'll review it within 2-3 business days.",
        { duration: 5000 }
      );
      
      // Small delay to show success message before navigation
      setTimeout(() => {
        navigate("/provider/dashboard");
      }, 1500);
    },
    onError: (err: any) => {
      console.error("Application submission error:", err);
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message || 
                          "Failed to submit application. Please try again.";
      toast.error(errorMessage, { duration: 5000 });
    }
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleFileSelect = (category: keyof typeof documents, file: File) => {
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    // Validate file type
    const validTypes = [
      "image/jpeg", 
      "image/jpg", 
      "image/png", 
      "image/webp",
      "application/pdf"
    ];
    
    if (!validTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, WEBP, and PDF files are allowed");
      return;
    }

    setDocuments(prev => ({
      ...prev,
      [category]: { 
        ...prev[category], 
        file,
        uploaded: false,
        cloudinaryUrl: undefined
      }
    }));
    
    toast.success(`✓ ${file.name} selected`, { duration: 2000 });
  };

  const handleFileRemove = (category: keyof typeof documents) => {
    setDocuments(prev => ({
      ...prev,
      [category]: { 
        ...prev[category], 
        file: null,
        uploaded: false,
        cloudinaryUrl: undefined
      }
    }));
    toast.success("File removed", { duration: 2000 });
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.idNumber || formData.idNumber.length !== 13) {
          toast.error("Please enter a valid 13-digit SA ID number");
          return false;
        }
        return true;
        
      case 2:
        if (!formData.address || !formData.city) {
          toast.error("Please enter your complete address");
          return false;
        }
        if (!formData.region) {
          toast.error("Please select your province");
          return false;
        }
        return true;
        
      case 3:
        if (!formData.bankName || !formData.accountHolder || !formData.accountNumber) {
          toast.error("Please complete all banking information");
          return false;
        }
        if (formData.accountNumber.length < 8) {
          toast.error("Please enter a valid account number");
          return false;
        }
        return true;
        
      case 4:
        const requiredDocs = Object.entries(documents).filter(
          ([_, doc]) => doc.required
        );
        const missingDocs = requiredDocs.filter(([_, doc]) => !doc.file);
        
        if (missingDocs.length > 0) {
          const missingNames = missingDocs.map(([cat]) => 
            cat.replace(/_/g, " ").toLowerCase()
          ).join(", ");
          toast.error(`Missing required documents: ${missingNames}`);
          return false;
        }
        return true;
        
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(currentStep)) {
      return;
    }

    // Show confirmation
    const docCount = Object.values(documents).filter(d => d.file !== null).length;
    const requiredCount = Object.values(documents).filter(d => d.required && d.file !== null).length;
    
    const confirmed = window.confirm(
      `Ready to submit your provider application?\n\n` +
      `✓ Personal & banking information completed\n` +
      `✓ ${requiredCount} required documents attached\n` +
      `${docCount > requiredCount ? `✓ ${docCount - requiredCount} additional documents attached\n` : ''}` +
      `\nDocuments will be uploaded to secure cloud storage.\n\n` +
      `Click OK to proceed.`
    );

    if (!confirmed) return;

    submitMutation.mutate(formData);
  };

  const steps = [
    { number: 1, title: "Personal", icon: User },
    { number: 2, title: "Location", icon: MapPin },
    { number: 3, title: "Banking", icon: CreditCard },
    { number: 4, title: "Documents", icon: FileText },
  ];

  const DocumentUpload = ({ 
    category, 
    label, 
    description, 
    required 
  }: { 
    category: keyof typeof documents; 
    label: string; 
    description: string; 
    required: boolean;
  }) => {
    const doc = documents[category];
    
    return (
      <div className={`border-2 border-dashed rounded-xl p-4 transition ${
        doc.file ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-green-400'
      }`}>
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-gray-800 text-sm">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </h3>
            <p className="text-xs text-gray-600 mt-1">{description}</p>
          </div>
          {doc.file && (
            <button
              type="button"
              onClick={() => handleFileRemove(category)}
              className="p-1.5 hover:bg-red-100 rounded-lg transition"
              disabled={submitMutation.isPending}
            >
              <X className="w-4 h-4 text-red-600" />
            </button>
          )}
        </div>

        {doc.file ? (
          <div className="bg-white border-2 border-green-300 rounded-lg p-3">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-green-800 truncate">
                  {doc.file.name}
                </p>
                <p className="text-xs text-green-600">
                  {(doc.file.size / 1024).toFixed(1)} KB
                  {doc.uploaded && doc.cloudinaryUrl && (
                    <span className="ml-2">• Uploaded ✓</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <label className="cursor-pointer flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition border border-gray-200">
            <Upload className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Choose File</span>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(category, file);
              }}
              className="hidden"
              disabled={submitMutation.isPending}
            />
          </label>
        )}
      </div>
    );
  };

  const isLoading = submitMutation.isPending;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-6 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">Provider Application</h1>
          <p className="text-green-100 text-sm">Complete all steps to become a verified provider</p>
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

      {/* Upload Progress Overlay */}
      {uploadProgress && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Uploading Documents to Cloud
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {uploadProgress.category.replace(/_/g, " ")}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-500">
                {uploadProgress.current} of {uploadProgress.total} documents
              </p>
            </div>
          </div>
        </div>
      )}

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
                South African ID Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleInputChange}
                placeholder="8001015009087"
                maxLength={13}
                required
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">
                Your 13-digit SA ID number for identity verification
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Location */}
        {currentStep === 2 && (
          <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-green-600" />
              Business Location
            </h2>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Street Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="123 Main Street"
                required
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
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
                  placeholder="Johannesburg"
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Province <span className="text-red-500">*</span>
                </label>
                <select
                  name="region"
                  value={formData.region}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="">Select Province</option>
                  <option value="Gauteng">Gauteng</option>
                  <option value="Western Cape">Western Cape</option>
                  <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                  <option value="Eastern Cape">Eastern Cape</option>
                  <option value="Free State">Free State</option>
                  <option value="Limpopo">Limpopo</option>
                  <option value="Mpumalanga">Mpumalanga</option>
                  <option value="North West">North West</option>
                  <option value="Northern Cape">Northern Cape</option>
                </select>
              </div>
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
                maxLength={4}
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>
          </div>
        )}

        {/* Step 3: Banking */}
        {currentStep === 3 && (
          <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-green-600" />
              Banking Information
            </h2>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800">
                This information is used for payment processing. All data is encrypted and secure.
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
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="">Select Bank</option>
                <option value="ABSA">ABSA</option>
                <option value="Capitec">Capitec</option>
                <option value="FNB">FNB</option>
                <option value="Nedbank">Nedbank</option>
                <option value="Standard Bank">Standard Bank</option>
                <option value="TymeBank">TymeBank</option>
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
                placeholder="John Doe"
                required
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
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
                placeholder="1234567890"
                required
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">
                Your bank account number for receiving payments
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Documents */}
        {currentStep === 4 && (
          <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FileText className="w-6 h-6 text-green-600" />
              Required Documents
            </h2>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-yellow-800">
                <p className="font-semibold mb-1">Document Requirements:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Clear, readable images or scanned documents</li>
                  <li>Accepted formats: JPG, PNG, WEBP, PDF</li>
                  <li>Maximum file size: 5MB per document</li>
                  <li>All documents will be securely stored in the cloud</li>
                </ul>
              </div>
            </div>

            <DocumentUpload
              category="ID_DOCUMENT"
              label="South African ID Document"
              description="Clear copy of your ID book or smart card (both sides)"
              required={true}
            />

            <DocumentUpload
              category="PROOF_OF_ADDRESS"
              label="Proof of Residence"
              description="Utility bill, bank statement, or municipal account (not older than 3 months)"
              required={true}
            />

            <DocumentUpload
              category="VEHICLE_REGISTRATION_CERT"
              label="Vehicle Registration Certificate"
              description="Official vehicle registration document showing ownership"
              required={true}
            />

            <DocumentUpload
              category="DRIVERS_LICENSE"
              label="Valid Driver's License"
              description="Both sides of your professional or valid driver's license"
              required={true}
            />

            {/* Document Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4">
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Document Summary
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-800">Total Documents Selected:</span>
                  <span className="font-bold text-blue-900">
                    {Object.values(documents).filter(d => d.file !== null).length} /{" "}
                    {Object.values(documents).length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-800">Required Documents:</span>
                  <span className="font-bold text-blue-900">
                    {Object.values(documents).filter(d => d.required && d.file !== null).length} /{" "}
                    {Object.values(documents).filter(d => d.required).length}
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <div className="flex items-center gap-2 text-xs text-blue-700">
                    <AlertCircle className="w-4 h-4" />
                    <span>Documents will be uploaded to secure cloud storage after submission</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="sticky bottom-0 bg-white border-t shadow-lg p-4 -mx-4 mt-6">
          <div className="flex gap-3 max-w-4xl mx-auto">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev - 1)}
                disabled={isLoading}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition disabled:opacity-50"
              >
                Back
              </button>
            )}
            
            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition shadow-lg disabled:opacity-50"
              >
                Continue
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {uploadProgress 
                      ? `Uploading ${uploadProgress.current}/${uploadProgress.total}...` 
                      : "Submitting..."}
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