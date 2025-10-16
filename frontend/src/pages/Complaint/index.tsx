import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCreateComplaint } from "../../hooks/useComplaint";
import toast from "react-hot-toast";

type IssueTarget = "PROVIDER" | "HELPER" | "OTHER";
type ComplaintType = "BOOKING" | "GENERAL";

export default function ComplaintForm() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const bookingId = state?.bookingId ?? "";
  const providerName = state?.providerName ?? "";
  const vehiclePlate = state?.vehicleId ?? "";

  const [complaintType, setComplaintType] = useState<ComplaintType>(
    bookingId ? "BOOKING" : "GENERAL"
  );
  const [plateNumber, setPlateNumber] = useState(vehiclePlate || "");
  const [issueTarget, setIssueTarget] = useState<IssueTarget>("PROVIDER");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { mutateAsync: createComplaint } = useCreateComplaint();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (complaintType === "BOOKING" && !bookingId) {
      toast.error("Booking not found. Please file a general complaint instead.");
      return;
    }

    if (!description.trim()) {
      toast.error("Please describe your issue before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      if (complaintType === "BOOKING") {
        await createComplaint({
          bookingId,
          plateNumber: plateNumber || vehiclePlate,
          issueTarget,
          description,
          customerId: "", // inferred from backend token
        });
      } else {
        // For general complaint, no bookingId — backend can handle null or a separate endpoint
        await createComplaint({
          bookingId: null,
          plateNumber,
          issueTarget,
          description,
          customerId: "",
        });
      }

      toast.success("Complaint submitted successfully!");
      navigate(complaintType === "BOOKING" ? "/bookings" : "/");
    } catch (err) {
      console.error("Complaint failed:", err);
      toast.error("Failed to submit complaint. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg bg-white shadow-lg rounded-2xl p-6 sm:p-8 border border-green-100">
        <h1 className="text-2xl sm:text-3xl font-semibold text-green-700 text-center mb-6">
          {complaintType === "BOOKING" ? "Report an Issue" : "Submit a Complaint"}
        </h1>
        <p className="text-gray-600 text-center mb-8 text-sm sm:text-base">
          {complaintType === "BOOKING"
            ? "Please share details about your booking issue. We’ll review it promptly."
            : "Use this form to report general issues, feedback, or platform concerns."}
        </p>

        {/* Complaint Type Selector (only shown if not triggered from booking) */}
        {!bookingId && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Complaint Type
            </label>
            <select
              value={complaintType}
              onChange={(e) => setComplaintType(e.target.value as ComplaintType)}
              className="w-full text-gray-700 border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
            >
              <option value="GENERAL">General Issue</option>
              <option value="BOOKING">Booking-Related</option>
            </select>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Booking Summary (if applicable) */}
          {complaintType === "BOOKING" && bookingId && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
              <p className="text-gray-700">
                <span className="font-medium text-green-700">Booking with:</span>{" "}
                {providerName || "Unknown Provider"}
              </p>
              {plateNumber && (
                <p className="text-gray-600 mt-1">
                  Vehicle Plate: <span className="font-medium">{plateNumber}</span>
                </p>
              )}
            </div>
          )}

          {/* Plate Number (optional for general issues) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vehicle Plate (if applicable)
            </label>
            <input
              type="text"
              placeholder="e.g., TMF 457 GP"
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value)}
              className="w-full text-gray-700 border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
          </div>

          {/* Issue Target */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Who is this complaint about?
            </label>
            <select
              value={issueTarget}
              onChange={(e) => setIssueTarget(e.target.value as IssueTarget)}
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
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe your issue clearly..."
              className="w-full text-gray-700 border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-green-600 text-white font-medium py-2.5 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? "Submitting..." : "Submit Complaint"}
          </button>
        </form>

        {/* Back Button */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate(complaintType === "BOOKING" ? "/bookings" : "/")}
            className="text-green-700 text-sm hover:underline"
          >
            ← Back {complaintType === "BOOKING" ? "to Bookings" : "Home"}
          </button>
        </div>
      </div>
    </div>
  );
}
