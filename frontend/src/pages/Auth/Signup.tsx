import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";

export default function Signup() {
  const { signup, signupWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the page user was trying to access
  const from = (location.state as any)?.from?.pathname || null;

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    role: "CUSTOMER",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signup(form);
      
      // Get the stored user data after successful signup & auto-login
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        
        // Redirect based on role or the page they were trying to access
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-sm p-6 rounded-2xl shadow-md"
      >
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Create Account
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3 mb-3">
          <input
            name="firstName"
            placeholder="First name"
            className="w-1/2 p-3 border text-gray-500 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
            onChange={handleChange}
            disabled={loading}
            required
          />
          <input
            name="lastName"
            placeholder="Last name"
            className="w-1/2 p-3 text-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
            onChange={handleChange}
            disabled={loading}
            required
          />
        </div>

        <input
          name="email"
          type="email"
          placeholder="Email"
          className="w-full p-3 text-gray-500 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-green-600"
          onChange={handleChange}
          disabled={loading}
          required
        />
        <input
          name="phone"
          placeholder="Phone number"
          className="w-full p-3 text-gray-500 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-green-600"
          onChange={handleChange}
          disabled={loading}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          className="w-full p-3 text-gray-500 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-green-600"
          onChange={handleChange}
          disabled={loading}
          required
        />
        <select
          name="role"
          className="w-full p-3 text-gray-500 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-600"
          onChange={handleChange}
          value={form.role}
          disabled={loading}
        >
          <option value="CUSTOMER">Customer</option>
          <option value="PROVIDER">Provider</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creating account..." : "Register"}
        </button>

        <div className="my-4 text-center text-gray-500 text-sm">or sign up with</div>

        <div className="flex justify-center gap-3 mb-4">
          <button
            type="button"
            onClick={signupWithGoogle}
            disabled={loading}
            className="flex text-gray-500 items-center gap-2 border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
  );
}