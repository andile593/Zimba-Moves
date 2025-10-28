import { CheckCircle, CreditCard, Plus, Shield, Trash2 } from "lucide-react";
import { Provider } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import api from "@/services/axios";
import toast from "react-hot-toast";

interface CardData {
  accountNumber: string;
  accountName: string;
  bankCode: string;
}

interface Bank {
  name: string;
  code: string;
}

interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
  };
  message: string;
}

export default function PaymentCardsSection({
  profile,
  showAddCard,
  setShowAddCard,
}: {
  profile: Provider;
  showAddCard: boolean;
  setShowAddCard: (show: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [cardData, setCardData] = useState<CardData>({
    accountNumber: "",
    accountName: "",
    bankCode: "",
  });

  const banks: Bank[] = [
    { name: "First National Bank", code: "632005" },
    { name: "Standard Bank", code: "051001" },
    { name: "ABSA Bank", code: "632005" },
    { name: "Nedbank", code: "198765" },
    { name: "Capitec Bank", code: "470010" },
    { name: "Investec Bank", code: "580105" },
    { name: "African Bank", code: "430000" },
  ];

  const addCardMutation = useMutation({
    mutationFn: async (data: CardData) => {
      return api.post(`/providers/${profile.id}/payment-cards`, data);
    },
    onSuccess: () => {
      toast.success("Bank account added successfully!");
      queryClient.invalidateQueries({ queryKey: ["providerProfile"] });
      setShowAddCard(false);
      setCardData({ accountNumber: "", accountName: "", bankCode: "" });
    },
    onError: (err: ApiError) => {
      toast.error(err.response?.data?.error || "Failed to add bank account");
    },
  });

  const deleteCardMutation = useMutation({
    mutationFn: async (cardId: string) => {
      return api.delete(`/providers/${profile.id}/payment-cards/${cardId}`);
    },
    onSuccess: () => {
      toast.success("Bank account removed successfully!");
      queryClient.invalidateQueries({ queryKey: ["providerProfile"] });
    },
    onError: (err: ApiError) => {
      toast.error(err.response?.data?.error || "Failed to remove bank account");
    },
  });

  const setDefaultCardMutation = useMutation({
    mutationFn: async (cardId: string) => {
      return api.put(
        `/providers/${profile.id}/payment-cards/${cardId}/default`
      );
    },
    onSuccess: () => {
      toast.success("Default account updated!");
      queryClient.invalidateQueries({ queryKey: ["providerProfile"] });
    },
    onError: (err: ApiError) => {
      toast.error(err.response?.data?.error || "Failed to set default account");
    },
  });

  const handleAddCard = async () => {
    if (
      !cardData.accountNumber ||
      !cardData.accountName ||
      !cardData.bankCode
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsAdding(true);
    try {
      await addCardMutation.mutateAsync(cardData);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteCard = (cardId: string) => {
    if (window.confirm("Are you sure you want to remove this bank account?")) {
      deleteCardMutation.mutate(cardId);
    }
  };

  const handleSetDefault = (cardId: string) => {
    setDefaultCardMutation.mutate(cardId);
  };

  const paymentCards = profile.paymentCards || [];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Bank Accounts</h3>
            <p className="text-sm text-gray-600">Manage your payout accounts</p>
          </div>
        </div>
        {!showAddCard && (
          <button
            onClick={() => setShowAddCard(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl hover:from-green-700 hover:to-green-600 transition-all font-semibold"
          >
            <Plus className="w-4 h-4" />
            Add Account
          </button>
        )}
      </div>

      {showAddCard && (
        <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-6 mb-6">
          <h4 className="font-bold text-gray-900 mb-4">Add New Bank Account</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Account Name
              </label>
              <input
                type="text"
                value={cardData.accountName}
                onChange={(e) =>
                  setCardData({ ...cardData, accountName: e.target.value })
                }
                placeholder="Full name on account"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Bank Name
              </label>
              <select
                value={cardData.bankCode}
                onChange={(e) =>
                  setCardData({ ...cardData, bankCode: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Select your bank</option>
                {banks.map((bank) => (
                  <option key={bank.code} value={bank.code}>
                    {bank.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Account Number
              </label>
              <input
                type="text"
                value={cardData.accountNumber}
                onChange={(e) =>
                  setCardData({ ...cardData, accountNumber: e.target.value })
                }
                placeholder="Enter your account number"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddCard}
                disabled={isAdding}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl hover:from-green-700 hover:to-green-600 transition-all font-semibold disabled:opacity-50"
              >
                {isAdding ? "Adding..." : "Add Account"}
              </button>
              <button
                onClick={() => {
                  setShowAddCard(false);
                  setCardData({
                    accountNumber: "",
                    accountName: "",
                    bankCode: "",
                  });
                }}
                className="px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {paymentCards.length > 0 ? (
        <div className="space-y-3">
          {paymentCards.map((card) => (
            <div
              key={card.id}
              className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">
                      {card.accountName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {card.bankName} •••• {card.accountNumber.slice(-4)}
                    </p>
                    {card.isDefault && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full mt-1">
                        <CheckCircle className="w-3 h-3" />
                        Default Account
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!card.isDefault && (
                    <button
                      onClick={() => handleSetDefault(card.id)}
                      disabled={setDefaultCardMutation.isPending}
                      className="px-3 py-2 text-sm text-green-700 hover:bg-green-50 rounded-lg transition-all font-medium"
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteCard(card.id)}
                    disabled={deleteCardMutation.isPending || card.isDefault}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    title={
                      card.isDefault
                        ? "Cannot delete default account"
                        : "Delete account"
                    }
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No bank accounts added yet</p>
          <p className="text-sm mt-1">Add a bank account to receive payouts</p>
        </div>
      )}

      <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-900 mb-1">
              Automatic Payouts
            </p>
            <p className="text-xs text-blue-700">
              Earnings from completed bookings will be automatically transferred
              to your default bank account within 3-5 business days.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
