import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { Clock, Mail, Phone, CheckCircle } from "lucide-react";

export default function PendingApproval() {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="w-10 h-10 text-yellow-600" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-4">
            Application Under Review
          </h1>

          <p className="text-center text-gray-600 text-lg mb-8">
            Thank you for applying to become a provider with Zimba Moves!
          </p>

          {/* Status Box */}
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-700" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 mb-2">Current Status: Pending</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Our team is currently reviewing your application and verifying your documents. 
                  This process typically takes 2-5 business days.
                </p>
              </div>
            </div>
          </div>

          {/* What Happens Next */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">What happens next?</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-800">Document Verification</h3>
                  <p className="text-gray-600 text-sm">
                    We'll verify your ID, address, and vehicle documentation
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-800">Background Check</h3>
                  <p className="text-gray-600 text-sm">
                    Standard safety and security screening process
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-800">Approval Notification</h3>
                  <p className="text-gray-600 text-sm">
                    You'll receive an email once your application is approved
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-gray-800 mb-3">Need Help?</h3>
            <p className="text-gray-600 text-sm mb-4">
              If you have any questions about your application, feel free to reach out:
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Mail className="w-4 h-4 text-green-600" />
                <a href="mailto:support@zimbamoves.com" className="hover:text-green-600">
                  support@zimbamoves.com
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Phone className="w-4 h-4 text-green-600" />
                <a href="tel:+27123456789" className="hover:text-green-600">
                  +27 12 345 6789
                </a>
              </div>
            </div>
          </div>

          {/* User Info */}
          {auth?.user && (
            <div className="text-center text-sm text-gray-500 mb-6">
              Application submitted for: <span className="font-medium text-gray-700">{auth.user.email}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/")}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Return to Home
            </button>
            <button
              onClick={() => navigate("/contact")}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Contact Support
            </button>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            We'll send updates to your email address. Please check your spam folder if you don't see our messages.
          </p>
        </div>
      </div>
    </div>
  );
}