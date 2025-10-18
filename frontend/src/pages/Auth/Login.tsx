import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { FcGoogle } from "react-icons/fc";

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Get the page user was trying to access
  const from = (location.state as any)?.from?.pathname || null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      
      // Get the stored user data after successful login
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        
        // Redirect based on role or the page they were trying to access
        if (from) {
          navigate(from, { replace: true });
        } else if (userData.role === "PROVIDER") {
          navigate("/provider", { replace: true });
        } else if (userData.role === "ADMIN") {
          navigate("/admin", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleLogin}
        className="bg-white w-full max-w-sm p-6 rounded-2xl shadow-md"
      >
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Welcome Back
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <input
          type="email"
          placeholder="Email address"
          className="w-full p-3 text-gray-500 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-green-600"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 text-gray-500 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-600"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="my-4 text-center text-gray-500 text-sm">or continue with</div>

        <div className="flex justify-center gap-3 mb-4">
          <button
            type="button"
            onClick={loginWithGoogle}
            disabled={loading}
            className="flex items-center text-gray-500 gap-2 border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FcGoogle size={20} /> <span>Google</span>
          </button>
        </div>

        <p className="text-center text-gray-600 text-sm">
          Not registered yet?{" "}
          <Link 
            to="/signup" 
            state={{ from: location.state?.from }} 
            className="text-green-600 font-semibold hover:underline"
          >
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}