import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, AlertCircle } from "lucide-react";

// Import from your actual auth service - adjust the path as needed
import { authService } from "../../services/complaintApi";

type IssueTarget = "PROVIDER" | "HELPER" | "OTHER";

// Custom hook for authentication
const useAuth = () => {
  const [isAuthenticated] = useState(authService.isAuthenticated());
  const user = authService.getCurrentUser();
  
  return {
    isAuthenticated,
    user
  };
};

export default function ComplaintForm() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const bookingId = state?.bookingId ?? "";
  const providerName = state?.providerName ?? "";
  const vehiclePlate = state?.vehicleId ?? "";

  const [plateNumber, setPlateNumber] = useState(vehiclePlate || "");
  const [issueTarget, setIssueTarget] = useState<IssueTarget>("PROVIDER");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user is authenticated
    if (!isAuthenticated) {
      toast.error("Please log in to submit a complaint.");
      navigate("/login", { 
        state: { 
          from: "/complaint", 
          returnState: state 
        } 
      });
      return;
    }

    if (!description.trim()) {
      toast.error("Please describe your issue.");
      return;
    }

    if (description.length < 10) {
      toast.error("Description must be at least 10 characters long.");
      return;
    }

    setSubmitting(true);

    try {
      const to = "complaints@detravellers.co.za";
      const subject = encodeURIComponent("New Complaint Submission");

      const bodyLines = [
        bookingId && `Booking ID: ${bookingId}`,
        providerName && `Provider Name: ${providerName}`,
        plateNumber && `Vehicle Plate: ${plateNumber}`,
        `Issue Target: ${issueTarget}`,
        "",
        `Message:\n${description}`,
      ].filter(Boolean);

      const body = encodeURIComponent(bodyLines.join("\n"));

      // ✅ This triggers the default mail app
      window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
      
      toast.success("Opening email client to submit your complaint...");
      
    } catch (error) {
      console.error("Error preparing email:", error);
      toast.error("Failed to prepare complaint email. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // If no booking ID, show error state
  if (!bookingId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8 border border-red-200">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Booking Required
            </h2>
            <p className="text-gray-600 mb-6">
              To file a complaint, please access this form from your bookings page.
            </p>
            <button
              onClick={() => navigate("/bookings")}
              className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition"
            >
              Go to My Bookings
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If user is not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8 border border-red-200">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Authentication Required
            </h2>
            <p className="text-gray-600 mb-6">
              You need to be logged in to submit a complaint.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate("/login", { 
                  state: { 
                    from: "/complaint", 
                    returnState: state 
                  } 
                })}
                className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition"
              >
                Log In
              </button>
              <button
                onClick={() => navigate("/bookings")}
                className="w-full bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-300 transition"
              >
                Back to Bookings
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 px-4 py-10">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate("/bookings")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Bookings</span>
        </button>

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-green-100">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 sm:px-8 py-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Report an Issue
            </h1>
            <p className="text-green-50 text-sm sm:text-base">
              We take complaints seriously and will review your issue promptly
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {/* Booking Summary */}
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
              <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                Booking Details
              </h3>
              <div className="space-y-1 text-sm">
                <p className="text-gray-700">
                  <span className="font-medium">Provider:</span>{" "}
                  {providerName || "Unknown Provider"}
                </p>
                {vehiclePlate && (
                  <p className="text-gray-700">
                    <span className="font-medium">Vehicle:</span> {vehiclePlate}
                  </p>
                )}
                <p className="text-gray-600 text-xs mt-2">
                  Booking ID: {bookingId}
                </p>
              </div>
            </div>

            {/* Vehicle Plate (optional) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Vehicle Plate Number
                <span className="text-gray-500 font-normal ml-1">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g., TMF 457 GP"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                className="w-full text-gray-700 border-2 border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
              />
              <p className="text-xs text-gray-500 mt-1">
                Include if the issue involves a specific vehicle
              </p>
            </div>

            {/* Issue Target */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Who is this complaint about? <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(["PROVIDER", "HELPER", "OTHER"] as IssueTarget[]).map((target) => (
                  <button
                    key={target}
                    type="button"
                    onClick={() => setIssueTarget(target)}
                    className={`px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                      issueTarget === target
                        ? "bg-green-600 text-white shadow-lg scale-105"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {target.charAt(0) + target.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                placeholder="Please describe your issue in detail. Include dates, times, and any relevant information..."
                className="w-full text-gray-700 border-2 border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition resize-none"
                required
                minLength={10}
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-500">
                  Minimum 10 characters required
                </p>
                <p className={`text-xs ${description.length >= 10 ? 'text-green-600' : 'text-gray-400'}`}>
                  {description.length} characters
                </p>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-800 font-medium mb-1">
                  What happens next?
                </p>
                <p className="text-xs text-blue-700 leading-relaxed">
                  Our team will review your complaint within 24-48 hours. You'll receive updates via email and can track the status in your bookings section.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate("/bookings")}
                className="flex-1 bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !description.trim() || description.length < 10}
                className="flex-1 bg-green-600 text-white font-semibold py-3 rounded-xl hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {submitting ? "Opening Email..." : "Submit Complaint"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}