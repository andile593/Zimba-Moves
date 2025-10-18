import { useNavigate } from "react-router-dom";
import { Clock, Mail, FileText, CheckCircle } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export default function PendingApproval() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-yellow-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <Clock className="w-10 h-10 text-yellow-600 animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-3">
            Application Under Review
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            Thank you for your interest in joining our platform, {user?.firstName}!
          </p>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
            <h2 className="font-semibold text-blue-900 mb-3 flex items-center justify-center gap-2">
              <FileText className="w-5 h-5" />
              What's Next?
            </h2>
            <div className="text-left space-y-3 text-sm text-blue-800">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p>Our admin team is currently reviewing your application</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p>This process typically takes 2-3 business days</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p>You'll receive an email notification once your application is approved</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p>We may contact you if additional information or documents are needed</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <h3 className="font-semibold text-green-900 mb-1">Check Your Email</h3>
                <p className="text-sm text-green-800">
                  We've sent a confirmation email to <strong>{user?.email}</strong>. 
                  Please check your inbox for further instructions.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/")}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
            >
              Back to Home
            </button>
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition"
            >
              Logout
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-6">
            Have questions? Contact us at <a href="mailto:support@movers.com" className="text-green-600 hover:underline">support@movers.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}
     