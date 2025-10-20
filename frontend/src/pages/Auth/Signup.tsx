import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import type { SignupData } from "../../types/user";
import { passwordRules } from "@/components/PasswordRules/passwordRules";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import {
  Truck,
  User,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Upload,
  X,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";

export default function Signup() {
  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || null;

  const [activeTab, setActiveTab] = useState<"CUSTOMER" | "PROVIDER">(
    "CUSTOMER"
  );
  const [currentStep, setCurrentStep] = useState(1);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [providerForm, setProviderForm] = useState({
    idNumber: "",
    address: "",
    city: "",
    region: "",
    postalCode: "",
    country: "South Africa",
    includeHelpers: false,
  });

  const [documents, setDocuments] = useState({
    ID_DOCUMENT: null as File | null,
    PROOF_OF_ADDRESS: null as File | null,
    VEHICLE_REGISTRATION_CERT: null as File | null,
    DRIVERS_LICENSE: null as File | null,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadingDocs, setUploadingDocs] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleProviderChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setProviderForm({
      ...providerForm,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleFileSelect = (category: keyof typeof documents, file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];
    if (!validTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, WEBP, and PDF files are allowed");
      return;
    }
    setDocuments((prev) => ({ ...prev, [category]: file }));
    toast.success(`${file.name} selected`);
  };

  const handleFileRemove = (category: keyof typeof documents) => {
    setDocuments((prev) => ({ ...prev, [category]: null }));
  };

  const validateStep1 = () => {
    const { firstName, lastName, email, phone, password, confirmPassword } =
      form;
    if (!firstName || !lastName || !email || !phone || !password) {
      setError("Please fill in all required fields");
      return false;
    }

    const failedRule = passwordRules.find((rule) => !rule.test(password));
    if (failedRule) {
      setError(`Password requirement not met: ${failedRule.label}`);
      return false;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const { idNumber, address, city } = providerForm;
    if (!idNumber || !address || !city) {
      setError("Please fill in all required demographic fields");
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    const requiredDocs = [
      "ID_DOCUMENT",
      "PROOF_OF_ADDRESS",
      "VEHICLE_REGISTRATION_CERT",
      "DRIVERS_LICENSE",
    ] as const;
    const missingDocs = requiredDocs.filter((doc) => !documents[doc]);
    if (missingDocs.length > 0) {
      setError("Please upload all required documents");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setError("");
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setError("");
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    setError("");
    setCurrentStep((prev) => prev - 1);
  };

  const uploadDocuments = async (providerId: string, token: string) => {
    const filesToUpload = Object.entries(documents).filter(
      ([_, file]) => file !== null
    );

    console.log("=== STARTING DOCUMENT UPLOAD ===");
    console.log("Provider ID:", providerId);
    console.log("Token exists:", !!token);
    console.log("Files to upload:", filesToUpload.length);

    if (filesToUpload.length === 0) {
      console.log("No files to upload");
      return;
    }

    const uploadPromises = filesToUpload.map(async ([category, file]) => {
      const formData = new FormData();
      formData.append("file", file!);
      formData.append("category", category);

      console.log(`\n--- Uploading ${category} ---`);
      console.log("File name:", file!.name);
      console.log("File size:", file!.size);
      console.log("File type:", file!.type);
      console.log(
        "URL:",
        `${import.meta.env.VITE_API_URL}/providers/${providerId}/files`
      );

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/providers/${providerId}/files`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              // Don't set Content-Type - let browser set it with boundary
            },
            body: formData,
          }
        );

        console.log(`Response status for ${category}:`, response.status);

        const responseData = await response.json();
        console.log(`Response data for ${category}:`, responseData);

        if (!response.ok) {
          console.error(`Failed to upload ${category}:`, responseData);
          throw new Error(
            `Failed to upload ${category}: ${
              responseData.error || "Unknown error"
            }`
          );
        }

        console.log(`✓ Successfully uploaded ${category}`);
        return responseData;
      } catch (error) {
        console.error(`Exception uploading ${category}:`, error);
        throw error;
      }
    });

    try {
      const results = await Promise.all(uploadPromises);
      console.log("=== ALL DOCUMENTS UPLOADED SUCCESSFULLY ===");
      console.log("Results:", results);
      return results;
    } catch (error) {
      console.error("=== DOCUMENT UPLOAD FAILED ===");
      console.error("Error:", error);
      toast.error(
        "Some documents failed to upload. Upload them from your dashboard."
      );
      throw new Error("Document upload failed");
    }
  };

  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse
  ) => {
    if (!credentialResponse.credential) {
      toast.error("Google signup failed. Please try again.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await loginWithGoogle(credentialResponse.credential);
      toast.success("Successfully signed up with Google!");
      navigate(from || "/", { replace: true });
    } catch (err: any) {
      setError(err.message || "Google signup failed. Please try again.");
      toast.error(err.message || "Google signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error("Google signup was cancelled or failed");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate current step before submitting
      if (activeTab === "PROVIDER" && currentStep === 3) {
        if (!validateStep3()) {
          setLoading(false);
          return;
        }
      }

      const { confirmPassword, ...formWithoutConfirm } = form;
      const signupData: SignupData = {
        ...formWithoutConfirm,
        role: activeTab,
        ...(activeTab === "PROVIDER" ? { providerData: providerForm } : {}),
      };

      const createdUser = await signup(signupData);

      if (activeTab === "PROVIDER") {
        const token = localStorage.getItem("token");

        // Use createdUser.providerId instead of createdUser.Provider?.id
        if (createdUser.providerId && token) {
          setUploadingDocs(true);

          try {
            await uploadDocuments(createdUser.providerId, token);
            setUploadingDocs(false);
            toast.success(
              "Account created and documents uploaded successfully!"
            );
          } catch (uploadError) {
            console.error("Document upload error:", uploadError);
            setUploadingDocs(false);
            toast.success(
              "Account created! Upload documents from dashboard later."
            );
          }
        } else {
          console.warn("Missing data for upload:", {
            hasProviderId: !!createdUser.providerId,
            hasToken: !!token,
          });
          toast.success(
            "Account created! Upload documents from dashboard later."
          );
        }

        navigate("/provider/pending", { replace: true });
      } else {
        toast.success("Account created successfully!");
        navigate(from || "/", { replace: true });
      }
    } catch (err: any) {
      console.error("Signup error:", err);

      const errorMessage = err?.message || "Signup failed. Please try again.";

      setError(errorMessage);

      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setUploadingDocs(false);
    }
  };

  const DocumentUpload = ({
    category,
    label,
  }: {
    category: keyof typeof documents;
    label: string;
  }) => {
    const file = documents[category];
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-green-400 transition">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-800 text-sm">
            {label}
            <span className="text-red-500 ml-1">*</span>
          </h3>
          {file && (
            <button
              type="button"
              onClick={() => handleFileRemove(category)}
              className="p-1 hover:bg-red-100 rounded-lg transition"
            >
              <X className="w-4 h-4 text-red-600" />
            </button>
          )}
        </div>
        {file ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-3">
            <FileText className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-green-800 truncate">
                {file.name}
              </p>
              <p className="text-xs text-green-600">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          </div>
        ) : (
          <label className="cursor-pointer flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition border border-gray-200">
            <Upload className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              Choose File
            </span>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => {
                const selectedFile = e.target.files?.[0];
                if (selectedFile) handleFileSelect(category, selectedFile);
              }}
              className="hidden"
            />
          </label>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-lg overflow-hidden">
        <div className="flex border-b">
          <button
            type="button"
            onClick={() => {
              setActiveTab("CUSTOMER");
              setCurrentStep(1);
              setError("");
            }}
            className={`flex-1 py-4 px-6 text-center font-semibold transition-all ${
              activeTab === "CUSTOMER"
                ? "bg-green-600 text-white"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            <User className="inline-block w-5 h-5 mr-2 mb-1" />
            Customer
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("PROVIDER");
              setCurrentStep(1);
              setError("");
            }}
            className={`flex-1 py-4 px-6 text-center font-semibold transition-all ${
              activeTab === "PROVIDER"
                ? "bg-green-600 text-white"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Truck className="inline-block w-5 h-5 mr-2 mb-1" />
            Provider
          </button>
        </div>

        {activeTab === "PROVIDER" && (
          <div className="bg-gray-50 px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              {[
                { num: 1, label: "Account" },
                { num: 2, label: "Demographic" },
                { num: 3, label: "Documents" },
              ].map((step, idx) => (
                <div key={step.num} className="flex items-center flex-1">
                  <div className="flex items-center gap-2 flex-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        currentStep >= step.num
                          ? "bg-green-600 text-white"
                          : "bg-gray-300 text-gray-600"
                      }`}
                    >
                      {currentStep > step.num ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        step.num
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                      {step.label}
                    </span>
                  </div>
                  {idx < 2 && (
                    <div
                      className={`h-1 flex-1 mx-2 ${
                        currentStep > step.num ? "bg-green-600" : "bg-gray-300"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6 text-center">
            {activeTab === "CUSTOMER" ? (
              <>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  Book Your Move
                </h1>
                <p className="text-sm text-gray-600">
                  Create an account to find reliable moving services
                </p>
              </>
            ) : currentStep === 1 ? (
              <>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  Create Your Account
                </h1>
                <p className="text-sm text-gray-600">
                  Step 1: Basic account information
                </p>
              </>
            ) : currentStep === 2 ? (
              <>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  Demographic Information
                </h1>
                <p className="text-sm text-gray-600">
                  Step 2: Tell us about your moving service
                </p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  Upload Documents
                </h1>
                <p className="text-sm text-gray-600">
                  Step 3: Required documents for verification
                </p>
              </>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          {(activeTab === "CUSTOMER" ||
            (activeTab === "PROVIDER" && currentStep === 1)) && (
            <div className="space-y-4">
              <div className="flex gap-3">
                <input
                  name="firstName"
                  placeholder="First name"
                  className="w-1/2 p-3 border text-gray-700 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  onChange={handleChange}
                  value={form.firstName}
                  disabled={loading}
                  required
                />
                <input
                  name="lastName"
                  placeholder="Last name"
                  className="w-1/2 p-3 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  onChange={handleChange}
                  value={form.lastName}
                  disabled={loading}
                  required
                />
              </div>
              <input
                name="email"
                type="email"
                placeholder="Email"
                className="w-full p-3 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                onChange={handleChange}
                value={form.email}
                disabled={loading}
                required
              />
              <input
                name="phone"
                placeholder="Phone number"
                className="w-full p-3 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                onChange={handleChange}
                value={form.phone}
                disabled={loading}
                required
              />
              <input
                name="password"
                type="password"
                placeholder="Password"
                className="w-full p-3 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                onChange={handleChange}
                onFocus={() => setPasswordTouched(true)}
                value={form.password}
                disabled={loading}
                required
              />
              {passwordTouched && (
                <ul className="pl-3 text-xs text-gray-500 mb-3">
                  {passwordRules.map((rule) => (
                    <li
                      key={rule.label}
                      className={
                        rule.test(form.password) ? "text-green-600" : ""
                      }
                    >
                      {rule.label}
                    </li>
                  ))}
                </ul>
              )}
              <input
                name="confirmPassword"
                type="password"
                placeholder="Confirm password"
                className="w-full p-3 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                onChange={handleChange}
                value={form.confirmPassword}
                disabled={loading}
                required
              />

              {activeTab === "CUSTOMER" ? (
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating account..." : "Sign up as Customer"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={loading}
                  className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Continue to Demographic Details
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
            </div>
          )}

          {activeTab === "PROVIDER" && currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID Number <span className="text-red-500">*</span>
                </label>
                <input
                  name="idNumber"
                  placeholder="8001015009087"
                  className="w-full p-3 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  onChange={handleProviderChange}
                  value={providerForm.idNumber}
                  disabled={loading}
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-start-1 col-end-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="address"
                    placeholder="23 Main Street"
                    className="w-full p-3 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                    onChange={handleProviderChange}
                    value={providerForm.address}
                    disabled={loading}
                    required
                  />
                </div>
                <div className="col-start-3 col-end-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Postal Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="postalCode"
                    placeholder="4520"
                    className="w-full p-3 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                    onChange={handleProviderChange}
                    value={providerForm.postalCode}
                    disabled={loading}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="city"
                    placeholder="Johannesburg"
                    className="w-full p-3 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                    onChange={handleProviderChange}
                    value={providerForm.city}
                    disabled={loading}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Province
                  </label>
                  <input
                    name="region"
                    placeholder="Gauteng"
                    className="w-full p-3 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                    onChange={handleProviderChange}
                    value={providerForm.region}
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="includeHelpers"
                    checked={providerForm.includeHelpers}
                    onChange={handleProviderChange}
                    className="mt-1 w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <div>
                    <div className="font-semibold text-gray-800 text-sm">
                      Include Helpers
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      Check this if you provide moving helpers with your service
                    </div>
                  </div>
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 border-2 border-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Continue to Documents
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {activeTab === "PROVIDER" && currentStep === 3 && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-xs text-yellow-800">
                  <strong>Note:</strong> All documents must be clear and valid.
                  Accepted formats: JPG, PNG, WEBP, PDF (max 2MB each)
                </p>
              </div>
              <DocumentUpload category="ID_DOCUMENT" label="ID Document" />
              <DocumentUpload
                category="PROOF_OF_ADDRESS"
                label="Proof of Address"
              />
              <DocumentUpload
                category="VEHICLE_REGISTRATION_CERT"
                label="Vehicle Registration Certificate"
              />
              <DocumentUpload
                category="DRIVERS_LICENSE"
                label="Valid Drivers License"
              />
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  <strong>Reminder:</strong> Your application will be reviewed
                  within 2-3 business days. You'll receive an email notification
                  once approved.
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 border-2 border-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || uploadingDocs}
                  className="flex-1 bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading || uploadingDocs ? (
                    <>
                      {uploadingDocs
                        ? "Uploading Documents..."
                        : "Submitting..."}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Submit Application
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {(activeTab === "CUSTOMER" ||
            (activeTab === "PROVIDER" && currentStep === 1)) && (
            <>
              <div className="my-4 flex items-center gap-4">
                <div className="flex-1 h-px bg-gray-300"></div>
                <span className="text-sm text-gray-500">or</span>
                <div className="flex-1 h-px bg-gray-300"></div>
              </div>

              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="outline"
                  size="medium"
                  text="signup_with"
                  shape="circle"
                  width="100%"
                />
              </div>
            </>
          )}

          <p className="text-center text-gray-600 text-sm mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              state={{ from: location.state?.from }}
              className="text-green-600 font-semibold hover:underline"
            >
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
