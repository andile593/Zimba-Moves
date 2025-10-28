// frontend/src/components/Banking/BankDetails.tsx
import { Building2, CreditCard, Shield, User, CheckCircle } from "lucide-react";
import { Provider } from "@/types";

interface BankingDetailsProps {
  profile: Provider;
  formData: Partial<Provider>;
  isEditing: boolean;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}

export default function BankingDetails({
  profile,
  formData,
  isEditing,
  onChange,
}: BankingDetailsProps) {
  // Check if provider has payment cards configured
  const hasPaymentCards =
    profile.paymentCards && profile.paymentCards.length > 0;
  const defaultCard = profile.paymentCards?.find((card) => card.isDefault);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
          <Building2 className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            Banking Details Overview
          </h3>
          <p className="text-sm text-gray-600">
            {hasPaymentCards
              ? "Your payment account information"
              : "Add a bank account above to receive payouts"}
          </p>
        </div>
      </div>

      {/* Show Payment Card Info if Available */}
      {hasPaymentCards && defaultCard ? (
        <div className="mb-6">
          <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-5">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-bold text-gray-900 text-lg">
                    Active Payout Account
                  </h4>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-200 px-2 py-1 rounded-full">
                    <CheckCircle className="w-3 h-3" />
                    Verified
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                  <div className="bg-white/60 rounded-lg p-3">
                    <p className="text-xs text-gray-600 font-medium mb-1">
                      Account Name
                    </p>
                    <p className="font-bold text-gray-900">
                      {defaultCard.accountName}
                    </p>
                  </div>

                  <div className="bg-white/60 rounded-lg p-3">
                    <p className="text-xs text-gray-600 font-medium mb-1">
                      Bank
                    </p>
                    <p className="font-bold text-gray-900">
                      {defaultCard.bankName}
                    </p>
                  </div>

                  <div className="bg-white/60 rounded-lg p-3">
                    <p className="text-xs text-gray-600 font-medium mb-1">
                      Account Number
                    </p>
                    <p className="font-bold text-gray-900 font-mono">
                      •••• {defaultCard.accountNumber.slice(-4)}
                    </p>
                  </div>

                  <div className="bg-white/60 rounded-lg p-3">
                    <p className="text-xs text-gray-600 font-medium mb-1">
                      Status
                    </p>
                    <p className="font-bold text-green-700">
                      Active & Receiving Payouts
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-sm text-green-800">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">
                    Earnings from completed bookings will be sent to this
                    account
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Show other cards count if any */}
          {profile.paymentCards && profile.paymentCards.length > 1 && (
            <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              <span className="font-medium">
                +{profile.paymentCards.length - 1} other bank account
                {profile.paymentCards.length - 1 > 1 ? "s" : ""} on file
              </span>
              <span className="ml-2 text-gray-500">
                (manage in Bank Accounts section above)
              </span>
            </div>
          )}
        </div>
      ) : (
        /* Fallback to legacy banking details if no payment cards */
        <div className="mb-6">
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-yellow-900 mb-1">
                  No Active Payout Account
                </p>
                <p className="text-xs text-yellow-800">
                  Please add a bank account in the "Bank Accounts" section above
                  to receive automatic payouts.
                </p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Bank Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Bank Name (Legacy)
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName || ""}
                  onChange={onChange}
                  placeholder="e.g., FNB, Standard Bank"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              ) : (
                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
                  <Building2 className="w-5 h-5 text-gray-400" />
                  <p className="text-gray-800">
                    {profile.bankName || "Not provided"}
                  </p>
                </div>
              )}
            </div>

            {/* Account Holder */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Account Holder Name (Legacy)
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="accountHolder"
                  value={formData.accountHolder || ""}
                  onChange={onChange}
                  placeholder="Full name on account"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              ) : (
                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
                  <User className="w-5 h-5 text-gray-400" />
                  <p className="text-gray-800">
                    {profile.accountHolder || "Not provided"}
                  </p>
                </div>
              )}
            </div>

            {/* Account Number */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Account Number (Legacy)
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber || ""}
                  onChange={onChange}
                  placeholder="Enter your bank account number"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono"
                />
              ) : (
                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
                  <CreditCard className="w-5 h-5 text-gray-400" />
                  <p className="text-gray-800 font-mono">
                    {profile.accountNumber
                      ? `****${profile.accountNumber.slice(-4)}`
                      : "Not provided"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Security Notice */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-900 mb-1">
              Your banking information is secure
            </p>
            <p className="text-xs text-blue-700">
              All banking details are encrypted and only used for processing
              payments. We never share your information with third parties.
              {hasPaymentCards &&
                " Your account has been verified with our payment provider."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
