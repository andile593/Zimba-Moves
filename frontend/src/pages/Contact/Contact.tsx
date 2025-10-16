import { useSearchParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";
import api from "../../services/axios";

export default function ContactForm() {
  const [params] = useSearchParams();
  const bookingId = params.get("bookingId");
  const plate = params.get("plate");
  const navigate = useNavigate();

  const [description, setDescription] = useState("");
  const [issueTarget, setIssueTarget] = useState("PROVIDER");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error("Please describe your issue.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/complaints", {
        bookingId,
        plateNumber: plate,
        issueTarget,
        description,
      });
      toast.success("Your message has been received. We’ll reach out soon!");
      navigate("/bookings");
    } catch {
      toast.error("Failed to send your message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg bg-white shadow-md rounded-2xl p-6 sm:p-8 border border-green-100">
        <h1 className="text-2xl sm:text-3xl font-semibold text-green-700 text-center mb-4">
          Contact Us
        </h1>
        <p className="text-gray-600 text-center mb-6 text-sm sm:text-base">
          Have an issue with a booking or provider? Send us a message and our
          support team will help you as soon as possible.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Booking ID (if available) */}
          {bookingId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Booking ID
              </label>
              <input
                type="text"
                value={bookingId}
                readOnly
                className="w-full border border-gray-300 bg-gray-100 text-gray-700 rounded-lg p-2.5 text-sm cursor-not-allowed"
              />
            </div>
          )}

          {/* Vehicle Plate (if available) */}
          {plate && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Plate
              </label>
              <input
                type="text"
                value={plate}
                readOnly
                className="w-full border border-gray-300 bg-gray-100 text-gray-700 rounded-lg p-2.5 text-sm cursor-not-allowed"
              />
            </div>
          )}

          {/* Issue Target */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Who is your message about?
            </label>
            <select
              value={issueTarget}
              onChange={(e) => setIssueTarget(e.target.value)}
              className="w-full text-gray-700 border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
            >
              {["PROVIDER", "HELPER", "OTHER"].map((target) => (
                <option key={target} value={target}>
                  {target.charAt(0) + target.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message / Description
            </label>
            <textarea
              placeholder="Describe your issue or question..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-gray-700 border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
              rows={4}
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? "Sending..." : "Send Message"}
          </button>
        </form>

        {/* Back Button */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate("/")}
            className="text-green-700 text-sm hover:underline"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
