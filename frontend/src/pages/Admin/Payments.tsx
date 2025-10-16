import { useQuery } from "@tanstack/react-query";
import { Search, DollarSign } from "lucide-react";
import { useState } from "react";
import api from "../../services/axios";

export default function AdminPayments() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["adminPayments"],
    queryFn: async () => (await api.get("/admin/bookings")).data,
  });

  const payments = bookings.map((b: any) => ({
    id: b.id,
    bookingId: b.id,
    amount: typeof b.pricing === 'object' ? b.pricing.total : b.pricing,
    status: b.paymentStatus,
    customer: b.customer,
    provider: b.provider,
    dateTime: b.dateTime,
  }));

  const filteredPayments = payments.filter((p: any) =>
    p.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.provider?.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = payments
    .filter((p: any) => p.status === "PAID")
    .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Revenue Card */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-sm p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm">Total Revenue</p>
            <p className="text-4xl font-bold mt-2">R{totalRevenue.toFixed(2)}</p>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <DollarSign className="w-8 h-8" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">All Payments</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Provider
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPayments.map((p: any) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono text-gray-600">
                      {p.bookingId.slice(0, 8)}...
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {p.customer?.firstName} {p.customer?.lastName}
                    </div>
                    <div className="text-xs text-gray-500">{p.customer?.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{p.provider?.company || "N/A"}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      R{p.amount?.toFixed(2) || "0.00"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      p.status === "PAID" ? "bg-green-100 text-green-700" :
                      p.status === "FAILED" ? "bg-red-100 text-red-700" :
                      p.status === "REFUNDED" ? "bg-purple-100 text-purple-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(p.dateTime).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPayments.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No payments found matching your search
          </div>
        )}
      </div>
    </div>
  );
}