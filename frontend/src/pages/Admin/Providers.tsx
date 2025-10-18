import { useQuery } from "@tanstack/react-query";
import { Search, MapPin, Truck } from "lucide-react";
import { useState } from "react";
import api from "../../services/axios";

export default function AdminProviders() {
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: providers = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["adminProviders"],
    queryFn: async () => {
      const res = await api.get("/providers");
      return res.data;
    },
  });

  if (error) {
    return (
      <div className="p-6 bg-red-100 text-red-700 rounded">
        Failed to load providers: {error.message || "Server error"}
      </div>
    );
  }

  const filteredProviders = providers.filter(
    (p: any) =>
      p.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      {/* Header + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Providers
        </h1>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Providers Grid */}
      <div className="grid gap-4">
        {filteredProviders.map((p: any) => (
          <div
            key={p.id}
            className="bg-white rounded-2xl shadow-md p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center border border-gray-200 hover:shadow-lg transition"
          >
            {/* Left Section */}
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Truck className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-gray-900 truncate">
                  {p.company || "Unnamed Provider"}
                </h2>
                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mt-1">
                  <span className="truncate">{p.user?.email}</span>
                  {p.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {p.city}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex gap-4 mt-4 sm:mt-0 sm:flex-col sm:items-end w-full sm:w-auto">
              <div className="flex justify-between sm:flex-col gap-2 sm:gap-1 w-full sm:w-auto">
                <p className="text-xs text-gray-500 sm:text-sm">Vehicles</p>
                <p className="font-semibold text-gray-900">
                  {p.vehicles?.length || 0}
                </p>
              </div>
              <div className="flex justify-between sm:flex-col gap-2 sm:gap-1 w-full sm:w-auto">
                <p className="text-xs text-gray-500 sm:text-sm">Earnings</p>
                <p className="font-semibold text-green-600">
                  R{p.earnings?.toFixed(2) || "0.00"}
                </p>
              </div>
            </div>
          </div>
        ))}

        {filteredProviders.length === 0 && (
          <div className="text-center text-gray-500 p-6">
            No providers match your search.
          </div>
        )}
      </div>
    </div>
  );
}
