import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Mail } from "lucide-react";
// import { useCreateSupportRequest } from "../../hooks/useSupport";

export default function ContactSupport() {
  const navigate = useNavigate();

  // State
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // const { mutateAsync: createSupportRequest } = useCreateSupportRequest();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim()) {
      toast.error("Please provide a subject for your inquiry.");
      return;
    }

    if (message.trim().length < 10) {
      toast.error("Please provide more details (at least 10 characters).");
      return;
    }

    setSubmitting(true);
    try {
      const inquiryData = {
        subject: subject.trim(),
        message: message.trim(),
      };

      // await createSupportRequest(inquiryData);
      console.log("📤 Submitting general inquiry:", inquiryData);

      toast.success("Your inquiry has been sent! We'll get back to you soon.");
      setSubject("");
      setMessage("");
      navigate("/");
    } catch (err: any) {
      console.error("❌ Inquiry submission failed:", err);
      const errorMessage =
        err.response?.data?.details ||
        err.response?.data?.error ||
        err.message ||
        "Failed to send your inquiry. Please try again later.";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 px-4 py-10">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </button>

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-blue-100">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 sm:px-8 py-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Contact Support
            </h1>
            <p className="text-blue-50 text-sm sm:text-base">
              Have a question or need assistance? We’re here to help.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {/* Subject */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Account issue, pricing question..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full text-gray-700 border-2 border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                placeholder="Please describe your question or concern in detail..."
                className="w-full text-gray-700 border-2 border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition resize-none"
                required
                minLength={10}
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-500">
                  Minimum 10 characters required
                </p>
                <p
                  className={`text-xs ${
                    message.length >= 10 ? "text-green-600" : "text-gray-400"
                  }`}
                >
                  {message.length} characters
                </p>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 flex gap-3">
              <Mail className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-green-800 font-medium mb-1">
                  Need urgent help?
                </p>
                <p className="text-xs text-green-700 leading-relaxed">
                  For time-sensitive issues, call our 24/7 hotline or use the
                  in-app chat to reach a live support agent immediately.
                </p>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !subject.trim() || message.length < 10}
                className="flex-1 bg-green-600 text-white font-semibold py-3 rounded-xl hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {submitting ? "Sending..." : "Send Message"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
