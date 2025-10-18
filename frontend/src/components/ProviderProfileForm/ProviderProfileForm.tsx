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
  X
} from "lucide-react";
import api from "../../services/axios";
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
  category: FileCategory;
  file: File | null;
  required: boolean;
}

export default function ProviderApplicationForm() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadingDocs, setUploadingDocs] = useState(false);
  

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

  const [documents, setDocuments] = useState({
    ID_DOCUMENT: { file: null as File | null, required: true },
    PROOF_OF_ADDRESS: { file: null as File | null, required: true },
    VEHICLE_REGISTRATION: { file: null as File | null, required: true },
    VEHICLE_LICENSE_DISK: { file: null as File | null, required: true },
    LICENSE: { file: null as File | null, required: false },
    INSURANCE: { file: null as File | null, required: false }
  });

  const submitMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // Step 1: Create application
      console.log("Creating application...");
      const appRes = await api.post("/providers/application", data);
      const provider = appRes.data.provider;
      console.log("Application created:", provider.id);

      // Step 2: Upload documents
      const filesToUpload = Object.entries(documents).filter(
        ([_, doc]) => doc.file !== null
      );

      if (filesToUpload.length > 0) {
        setUploadingDocs(true);
        console.log(`Uploading ${filesToUpload.length} documents...`);

        const uploadResults = await Promise.allSettled(
          filesToUpload.map(async ([category, doc]) => {
            const formData = new FormData();
            formData.append("file", doc.file!);
            formData.append("category", category);

            try {
              const response = await api.post(
                `/providers/${provider.id}/files`,
                formData,
                {
                  headers: { "Content-Type": "multipart/form-data" },
                }
              );
              console.log(`✓ Uploaded ${category}`);
              return response;
            } catch (error) {
              console.error(`✗ Failed to upload ${category}:`, error);
              throw error;
            }
          })
        );

        // Check for failed uploads
        const failedUploads = uploadResults.filter(
          (result) => result.status === "rejected"
        );

        if (failedUploads.length > 0) {
          console.warn(`${failedUploads.length} documents failed to upload`);
          toast.error(
            `Application created but ${failedUploads.length} document(s) failed to upload. Please upload them from your dashboard.`,
            { duration: 6000 }
          );
        } else {
          console.log("All documents uploaded successfully");
        }

        setUploadingDocs(false);
      }

      return appRes;
    },
    onSuccess: () => {
      toast.success("Application submitted! We'll review it within 2-3 business days.", {
        duration: 5000
      });
      navigate("/provider");
    },
    onError: (err: any) => {
      console.error("Application submission error:", err);
      toast.error(err.response?.data?.error || "Failed to submit application");
      setUploadingDocs(false);
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, and PDF files are allowed");
      return;
    }

    setDocuments(prev => ({
      ...prev,
      [category]: { ...prev[category], file }
    }));
    toast.success(`${file.name} selected`);
  };

  const handleFileRemove = (category: keyof typeof documents) => {
    setDocuments(prev => ({
      ...prev,
      [category]: { ...prev[category], file: null }
    }));
  };

 

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.idNumber) {
          toast.error("Please enter your ID number");
          return false;
        }
        return true;
      case 2:
        if (!formData.address || !formData.city) {
          toast.error("Please enter your address and city");
          return false;
        }
        return true;
      case 3:
        if (!formData.bankName || !formData.accountHolder || !formData.accountNumber) {
          toast.error("Please complete banking information");
          return false;
        }
        return true;
      case 4:
        const requiredDocs = Object.entries(documents).filter(
          ([_, doc]) => doc.required
        );
        const missingDocs = requiredDocs.filter(([_, doc]) => !doc.file);
        if (missingDocs.length > 0) {
          toast.error("Please upload all required documents");
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
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(6)) {
      return;
    }

    // Show confirmation with document count
    const docCount = Object.values(documents).filter(d => d.file !== null).length;
    if (!window.confirm(
      `Ready to submit?\n\n` +
      `• Application with ${docCount} document(s)\n` +
      `• Documents will be uploaded after application is created\n\n` +
      `Click OK to proceed.`
    )) {
      return;
    }

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
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-green-400 transition">
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
              className="p-1 hover:bg-red-100 rounded-lg transition"
            >
              <X className="w-4 h-4 text-red-600" />
            </button>
          )}
        </div>

        {doc.file ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-green-800 truncate">
                {doc.file.name}
              </p>
              <p className="text-xs text-green-600">
                {(doc.file.size / 1024).toFixed(1)} KB
              </p>
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
            />
          </label>
        )}
      </div>
    );
  };

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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Your South African ID number for verification
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
              <p className="text-xs text-yellow-800">
                All documents must be clear and valid. Accepted: JPG, PNG, PDF (max 5MB each)
              </p>
            </div>

            <DocumentUpload
              category="ID_DOCUMENT"
              label="ID Document"
              description="Clear copy of your SA ID"
              required={true}
            />

            <DocumentUpload
              category="PROOF_OF_ADDRESS"
              label="Proof of Address"
              description="Recent utility bill or bank statement"
              required={true}
            />

            <DocumentUpload
              category="VEHICLE_REGISTRATION"
              label="Vehicle Registration"
              description="Vehicle registration certificate"
              required={true}
            />

            <DocumentUpload
              category="VEHICLE_LICENSE_DISK"
              label="Valid License Disk"
              description="Photo of current license disk"
              required={true}
            />

                 
            {/* Document Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Document Summary</h4>
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-800">
                  {Object.values(documents).filter(d => d.file !== null).length} of{" "}
                  {Object.values(documents).length} documents selected
                </span>
                <span className="text-blue-700 font-medium">
                  {Object.values(documents).filter(d => d.required && d.file !== null).length}/
                  {Object.values(documents).filter(d => d.required).length} required
                </span>
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
                disabled={submitMutation.isPending || uploadingDocs}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition disabled:opacity-50"
              >
                Back
              </button>
            )}
            
            {currentStep < 6 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition shadow-lg"
              >
                Continue
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitMutation.isPending || uploadingDocs}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitMutation.isPending || uploadingDocs ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {uploadingDocs ? "Uploading Documents..." : "Submitting..."}
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