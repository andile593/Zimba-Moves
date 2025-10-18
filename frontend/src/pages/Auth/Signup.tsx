import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { FcGoogle } from "react-icons/fc";
import { Truck, User, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";

export default function Signup() {
  const { signup, signupWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || null;

  const [activeTab, setActiveTab] = useState<"CUSTOMER" | "PROVIDER">("CUSTOMER");
  const [currentStep, setCurrentStep] = useState(1);
  
  // Step 1: Basic account info
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  // Step 2: Provider business info (only for PROVIDER role)
  const [providerForm, setProviderForm] = useState({
    businessName: "",
    businessType: "SOLE_PROPRIETOR",
    idNumber: "",
    taxNumber: "",
    address: "",
    city: "",
    region: "",
    postalCode: "",
    country: "South Africa",
    includeHelpers: false
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleProviderChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setProviderForm({
      ...providerForm,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };

  const validateStep1 = () => {
    const { firstName, lastName, email, phone, password, confirmPassword } = form;
    
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
    const { businessName, idNumber, address, city } = providerForm;
    
    if (!businessName || !idNumber || !address || !city) {
      setError("Please fill in all required business fields");
      return false;
    }
    
    return true;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setError("");
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    setError("");
    setCurrentStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // If CUSTOMER, submit directly
      if (activeTab === "CUSTOMER") {
        if (!validateStep1()) {
          setLoading(false);
          return;
        }
        await signup({ ...form, role: activeTab });
      } else {
        // If PROVIDER, validate both steps
        if (currentStep === 1) {
          handleNext();
          setLoading(false);
          return;
        }
        
        if (!validateStep2()) {
          setLoading(false);
          return;
        }

        // Submit with provider data
        await signup({ 
          ...form, 
          role: activeTab,
          providerData: providerForm 
        });
      }
      
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        
        if (from) {
          navigate(from, { replace: true });
        } else if (userData.role === "PROVIDER") {
          // Redirect to pending page for providers
          navigate("/provider/pending", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  currentStep >= 1 ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {currentStep > 1 ? <CheckCircle className="w-5 h-5" /> : '1'}
                </div>
                <span className="text-sm font-medium text-gray-700">Account</span>
              </div>
              
              <div className={`flex-1 h-1 mx-3 ${currentStep >= 2 ? 'bg-green-600' : 'bg-gray-300'}`} />
              
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  currentStep >= 2 ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  2
                </div>
                <span className="text-sm font-medium text-gray-700">Business</span>
              </div>
            </div>
          </div>
        )}

        {/* Form Content */}
        <div className="p-6">
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
            ) : (
              <>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  Business Information
                </h1>
                <p className="text-sm text-gray-600">
                  Step 2: Tell us about your moving business
                </p>
              </>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Account Details (for both CUSTOMER and PROVIDER) */}
          {(activeTab === "CUSTOMER" || (activeTab === "PROVIDER" && currentStep === 1)) && (
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
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating account..." : "Sign up as Customer"}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={loading}
                  className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Continue to Business Details
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
            </div>
          )}

          {/* Step 2: Provider Business Details (only for PROVIDER) */}
          {activeTab === "PROVIDER" && currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="businessName"
                  placeholder="ABC Movers"
                  className="w-full p-3 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  onChange={handleProviderChange}
                  value={providerForm.businessName}
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="businessType"
                  className="w-full p-3 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  onChange={handleProviderChange}
                  value={providerForm.businessType}
                  disabled={loading}
                >
                  <option value="SOLE_PROPRIETOR">Sole Proprietor</option>
                  <option value="COMPANY">Company (Pty Ltd)</option>
                  <option value="PARTNERSHIP">Partnership</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

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
                    <div className="font-semibold text-gray-800 text-sm">Include Helpers</div>
                    <div className="text-xs text-gray-600 mt-1">
                      Check this if you provide moving helpers with your service
                    </div>
                  </div>
                </label>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  <strong>Note:</strong> Your application will be reviewed by our admin team within 2-3 business days. 
                  You'll receive an email notification once approved.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleBack}
                  className="flex-1 border-2 border-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? "Submitting..." : (
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
          {(activeTab === "CUSTOMER" || (activeTab === "PROVIDER" && currentStep === 1)) && (
            <>
              <div className="my-4 text-center text-gray-500 text-sm">or sign up with</div>

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
        </div>
      </div>
    </div>
  );
}