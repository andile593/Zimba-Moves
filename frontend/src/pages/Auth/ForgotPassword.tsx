import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleBack = () => navigate(-1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send reset link");
      }

      toast.success("Password reset link sent! Check your email.");
       navigate("/login");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

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
          Forgot Password
        </h1>
        <p className="text-sm text-gray-600 text-center mb-6">
          Enter your email address and we’ll send you a password reset link.
        </p>

        <input
          type="email"
          placeholder="Email address"
          className="w-full p-3 text-gray-700 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-600"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
}
