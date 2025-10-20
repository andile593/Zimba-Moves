import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleBack = () => navigate("/login");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, password }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to reset password");
      }

      toast.success("Password reset successful!");
      navigate("/login");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-4">
            Invalid or missing reset token.
          </p>
          <button
            onClick={() => navigate("/forgot-password")}
            className="text-green-600 font-semibold hover:underline"
          >
            Request a new link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
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
          Reset Password
        </h1>
        <p className="text-sm text-gray-600 text-center mb-6">
          Enter your new password below.
        </p>

        <input
          type="password"
          placeholder="New password"
          className="w-full p-3 text-gray-700 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-green-600"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Confirm new password"
          className="w-full p-3 text-gray-700 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-600"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}
