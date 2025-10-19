import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import type { SignupData } from "../../context/AuthContext";
import { FcGoogle } from "react-icons/fc";
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
  const { signup, signupWithGoogle } = useAuth();
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

  // Document files state
  const [documents, setDocuments] = useState({
    ID_DOCUMENT: null as File | null,
    PROOF_OF_ADDRESS: null as File | null,
    VEHICLE_REGISTRATION: null as File | null,
    VEHICLE_LICENSE_DISK: null as File | null,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadingDocs, setUploadingDocs] = useState(false);

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

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
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
      "VEHICLE_REGISTRATION",
      "VEHICLE_LICENSE_DISK",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (activeTab === "CUSTOMER") {
        if (!validateStep1()) {
          setLoading(false);
          return;
        }

        const { confirmPassword, ...formWithoutConfirm } = form;

        const signupData: SignupData = {
          ...formWithoutConfirm,
          role: activeTab,
        };

        await signup(signupData);

        if (from) {
          navigate(from, { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      } else {
        // PROVIDER
        if (currentStep === 1) {
          handleNext();
          setLoading(false);
          return;
        }

        if (currentStep === 2) {
          handleNext();
          setLoading(false);
          return;
        }

        if (!validateStep3()) {
          setLoading(false);
          return;
        }

        // Remove confirmPassword before sending
        const { confirmPassword, ...formWithoutConfirm } = form;

        const signupData: SignupData = {
          ...formWithoutConfirm,
          role: activeTab,
          providerData: providerForm,
        };

        console.log("Provider signup data:", signupData);

        // Sign up the user first
        const response = await signup(signupData);

        // Get the provider ID and token from the response
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (storedUser && token) {
          const userData = JSON.parse(storedUser);

          // Upload documents if we have a provider ID
          if (userData.providerId) {
            setUploadingDocs(true);
            await uploadDocuments(userData.providerId, token);
            setUploadingDocs(false);

            toast.success(
              "Account created and documents uploaded successfully!"
            );
          } else {
            toast.success(
              "Account created! Please upload documents from your dashboard."
            );
          }

          navigate("/provider/pending", { replace: true });
        }
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.details ||
          "Signup failed. Please try again."
      );
      setLoading(false);
      setUploadingDocs(false);
    }
  };

  const uploadDocuments = async (providerId: string, token: string) => {
    const filesToUpload = Object.entries(documents).filter(
      ([_, file]) => file !== null
    );

    if (filesToUpload.length === 0) return;

    const uploadPromises = filesToUpload.map(async ([category, file]) => {
      const formData = new FormData();
      formData.append("file", file!);
      formData.append("category", category);

      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_API_URL || "https://9lwj8t-5173.csb.app"
          }/providers/${providerId}/files`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to upload ${category}`);
        }

        console.log(`✓ Uploaded ${category}`);
        return response;
      } catch (error) {
        console.error(`✗ Failed to upload ${category}:`, error);
        throw error;
      }
    });

    try {
      await Promise.all(uploadPromises);
    } catch (error) {
      toast.error(
        "Some documents failed to upload. Please upload them from your dashboard."
      );
      throw error;
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

  const totalSteps = activeTab === "PROVIDER" ? 3 : 1;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-lg overflow-hidden">
        {/* Tab Headers */}
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

        {/* Progress Bar for Provider */}
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

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Tab-specific messaging */}
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

          {/* Step 1: Account Details */}
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
                placeholder="Password (min. 6 characters)"
                className="w-full p-3 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                onChange={handleChange}
                value={form.password}
                disabled={loading}
                required
              />
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address <span className="text-red-500">*</span>
                </label>
                <input
                  name="address"
                  placeholder="123 Main Street"
                  className="w-full p-3 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  onChange={handleProviderChange}
                  value={providerForm.address}
                  disabled={loading}
                  required
                />
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

          {/* Step 3: Documents Upload */}
          {activeTab === "PROVIDER" && currentStep === 3 && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-xs text-yellow-800">
                  <strong>Note:</strong> All documents must be clear and valid.
                  Accepted formats: JPG, PNG, WEBP, PDF (max 5MB each)
                </p>
              </div>

              <DocumentUpload category="ID_DOCUMENT" label="ID Document" />

              <DocumentUpload
                category="PROOF_OF_ADDRESS"
                label="Proof of Address"
              />

              <DocumentUpload
                category="VEHICLE_REGISTRATION"
                label="Vehicle Registration"
              />

              <DocumentUpload
                category="VEHICLE_LICENSE_DISK"
                label="Valid License Disk"
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

          {/* OAuth signup - only show on step 1 */}
          {(activeTab === "CUSTOMER" ||
            (activeTab === "PROVIDER" && currentStep === 1)) && (
            <>
              <div className="my-4 text-center text-gray-500 text-sm">
                or sign up with
              </div>

              <div className="flex justify-center gap-3 mb-4">
                <button
                  type="button"
                  onClick={signupWithGoogle}
                  disabled={loading}
                  className="flex text-gray-700 items-center gap-2 border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FcGoogle size={20} /> <span>Google</span>
                </button>
              </div>
            </>
          )}

          <p className="text-center text-gray-600 text-sm mt-4">
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
