import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { FcGoogle } from "react-icons/fc";
import { Truck, User } from "lucide-react";

export default function Signup() {
  const { signup, signupWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || null;

  const [activeTab, setActiveTab] = useState<"CUSTOMER" | "PROVIDER">("CUSTOMER");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signup({ ...form, role: activeTab });
      
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        
        if (from) {
          navigate(from, { replace: true });
        } else if (userData.role === "PROVIDER") {
          navigate("/provider/dashboard", { replace: true });
        } else if (userData.role === "ADMIN") {
          navigate("/admin/dashboard", { replace: true });
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
      <div className="bg-white w-full max-w-md rounded-2xl shadow-lg overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b">
          <button
            type="button"
            onClick={() => setActiveTab("CUSTOMER")}
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
            onClick={() => setActiveTab("PROVIDER")}
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
            ) : (
              <>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  Grow Your Business
                </h1>
                <p className="text-sm text-gray-600">
                  Join our platform and connect with customers
                </p>
              </>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 mb-3">
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
            className="w-full p-3 text-gray-700 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-green-600"
            onChange={handleChange}
            value={form.email}
            disabled={loading}
            required
          />
          <input
            name="phone"
            placeholder="Phone number"
            className="w-full p-3 text-gray-700 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-green-600"
            onChange={handleChange}
            value={form.phone}
            disabled={loading}
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password (min. 6 characters)"
            className="w-full p-3 text-gray-700 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-600"
            onChange={handleChange}
            value={form.password}
            disabled={loading}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account..." : `Sign up as ${activeTab === "CUSTOMER" ? "Customer" : "Provider"}`}
          </button>

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

          <p className="text-center text-gray-600 text-sm">
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