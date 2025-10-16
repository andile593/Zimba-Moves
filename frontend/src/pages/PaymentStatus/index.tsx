import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/axios";

interface PaymentVerificationResponse {
  status: string;
  message: string;
  data: {
    reference: string;
    amount: number;
    status: "success" | "failed" | "pending";
    paidAt?: string;
  };
}

export default function PaymentStatusPage() {
  const { id } = useParams(); // /payments/:id/verify
  const [searchParams] = useSearchParams(); // paystack might append ?reference=xyz
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState<"success" | "failed" | "pending" | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const ref = searchParams.get("reference");

        if (!ref) {
          toast.error("Invalid payment reference");
          navigate("/bookings");
          return;
        }

        const { data } = await api.get<PaymentVerificationResponse>(
          `/payments/${ref}/verify`
        );

        // ... rest of verification logic
      } catch (err: any) {
        console.error(err);
        toast.error("Payment verification failed.");
        setVerified("failed");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  const handleGoBack = () => navigate("/bookings");

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      {loading ? (
        <div className="flex items-center gap-3 text-gray-700">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Verifying payment...</span>
        </div>
      ) : (
        <>
          {verified === "success" && (
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h1 className="text-2xl font-semibold text-gray-800">Payment Successful</h1>
              <p className="mt-2 text-gray-600">
                Your booking has been confirmed. You’ll receive an email shortly.
              </p>
              <button
                onClick={handleGoBack}
                className="mt-6 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
              >
                Go to Bookings
              </button>
            </div>
          )}

          {verified === "failed" && (
            <div className="text-center">
              <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h1 className="text-2xl font-semibold text-gray-800">Payment Failed</h1>
              <p className="mt-2 text-gray-600">
                Unfortunately, your transaction didn’t go through.
              </p>
              <button
                onClick={handleGoBack}
                className="mt-6 bg-gray-700 text-white px-6 py-2 rounded-lg hover:bg-gray-800"
              >
                Try Again
              </button>
            </div>
          )}

          {verified === "pending" && (
            <div className="text-center">
              <Loader2 className="w-16 h-16 text-yellow-500 animate-spin mx-auto mb-4" />
              <h1 className="text-2xl font-semibold text-gray-800">Payment Pending</h1>
              <p className="mt-2 text-gray-600">
                Your payment is still being processed. Please check back soon.
              </p>
              <button
                onClick={handleGoBack}
                className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Back to Bookings
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
