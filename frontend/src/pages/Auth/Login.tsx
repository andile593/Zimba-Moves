import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { ArrowLeft } from "lucide-react";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import toast from "react-hot-toast";

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
      console.log(storedUser);

      if (storedUser) {
        const userData = JSON.parse(storedUser);

        toast.success("Successfully logged in!");

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
      console.error("Login error:", err);

      // Extract the error message
      const errorMessage = err?.message || "Login failed. Please try again.";

      // Set the error state for display in the UI
      setError(errorMessage);

      // Show toast notification
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse
  ) => {
    if (!credentialResponse.credential) {
      toast.error("Google login failed. Please try again.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await loginWithGoogle(credentialResponse.credential);

      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        const userData = JSON.parse(storedUser);

        toast.success("Successfully logged in with Google!");

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
      console.error("Google login error:", err);

      // Extract the error message
      const errorMessage =
        err?.message || "Google login failed. Please try again.";

      // Set the error state for display in the UI
      setError(errorMessage);

      // Show toast notification
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error("Google login was cancelled or failed");
  };

  const handleBack = () => {
    navigate(-1); // Go to previous page
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleLogin}
        className="bg-white w-full max-w-sm p-6 rounded-2xl shadow-md relative"
      >
        <button
          type="button"
          onClick={handleBack}
          className="absolute top-6 left-4 p-2 hover:bg-gray-100 rounded-lg transition flex items-center gap-1 text-gray-600 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <h1 className="text-2xl font-bold mb-2 text-center text-gray-800">
          Welcome Back
        </h1>

        <p className="text-sm text-gray-600 text-center mb-6">
          Sign in to your account to continue
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <input
          type="email"
          placeholder="Email address"
          className="w-full p-3 text-gray-700 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-green-600"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 text-gray-700 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-600"
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
        <div className="text-center mt-2 mb-5">
          <Link
            to="/forgot-password"
            className="text-sm text-green-600 font-medium"
          >
            Forgot password?
          </Link>
        </div>

        <div className="my-4 flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="text-sm text-gray-500">or</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        <div className="flex justify-center mb-3">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap
            theme="outline"
            size="large"
            text="signin"
            shape="circle"
            width="100%"
          />
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
