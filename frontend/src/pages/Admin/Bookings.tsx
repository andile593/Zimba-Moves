import { useQuery } from "@tanstack/react-query";
import { Search, MapPin, Calendar, Filter } from "lucide-react";
import { useState } from "react";
import api from "../../services/axios";

export default function AdminBookings() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showFilters, setShowFilters] = useState(false);

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["adminBookings"],
    queryFn: async () => (await api.get("/admin/bookings")).data,
  });

  const filteredBookings = bookings.filter((b: any) => {
    const matchesSearch =
      b.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.provider?.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.pickup?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || b.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Badge utility
  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      COMPLETED: "bg-green-100 text-green-700",
      CONFIRMED: "bg-blue-100 text-blue-700",
      CANCELLED: "bg-red-100 text-red-700",
      PENDING: "bg-yellow-100 text-yellow-700",
    };
    return map[status] || "bg-gray-100 text-gray-700";
  };

  const getPaymentBadge = (paymentStatus: string) => {
    const map: Record<string, string> = {
      PAID: "bg-green-100 text-green-700",
      FAILED: "bg-red-100 text-red-700",
      REFUNDED: "bg-purple-100 text-purple-700",
      PENDING: "bg-yellow-100 text-yellow-700",
    };
    return map[paymentStatus] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="space-y-6">
      {/* Header + Search */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            All Bookings
          </h1>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="sm:hidden flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        <div
          className={`${
            showFilters ? "block" : "hidden"
          } sm:flex flex-col sm:flex-row gap-3`}
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Empty state */}
      {filteredBookings.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 px-6 sm:px-12 text-center bg-gray-50 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <Calendar className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">
            No Bookings Found
          </h3>
          <p className="text-sm sm:text-base text-gray-500 max-w-xs">
            Looks like there are no bookings matching your filters. New bookings
            will appear here.
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("ALL");
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Mobile Cards */}
      <div className="block lg:hidden space-y-4">
        {filteredBookings.map((b: any) => (
          <div
            key={b.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3 hover:shadow-md transition"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-900">
                  {b.customer?.firstName} {b.customer?.lastName}
                </h3>
                <p className="text-xs text-gray-500">{b.customer?.email}</p>
              </div>
              <div className="flex flex-col gap-1 items-end">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(
                    b.status
                  )}`}
                >
                  {b.status}
                </span>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentBadge(
                    b.paymentStatus
                  )}`}
                >
                  {b.paymentStatus}
                </span>
              </div>
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                {new Date(b.dateTime).toLocaleDateString()}
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <div>{b.pickup}</div>
                  <div className="text-xs">→ {b.dropoff}</div>
                </div>
              </div>
              <div>
                Provider:{" "}
                <span className="font-medium">
                  {b.provider?.company || "N/A"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Provider
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Route
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredBookings.map((b: any) => (
              <tr key={b.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {b.customer?.firstName} {b.customer?.lastName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {b.customer?.email}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {b.provider?.company || "N/A"}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-gray-900">{b.pickup}</div>
                      <div className="text-gray-500 text-xs">→ {b.dropoff}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(b.dateTime).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(
                      b.status
                    )}`}
                  >
                    {b.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentBadge(
                      b.paymentStatus
                    )}`}
                  >
                    {b.paymentStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredBookings.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No bookings found matching your filters
          </div>
        )}
      </div>
    </div>
  );
}
