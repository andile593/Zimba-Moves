import { useQuery } from "@tanstack/react-query";
import { Search, MapPin, Truck } from "lucide-react";
import { useState } from "react";
import api from "../../services/axios";

export default function AdminProviders() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: providers = [], isLoading } = useQuery({
    queryKey: ["adminProviders"],
    queryFn: async () => {
      const res = await api.get("/providers");
      return res.data;
    },
  });

  const filteredProviders = providers.filter((p: any) =>
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
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Providers</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search providers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredProviders.map((p: any) => (
          <div
            key={p.id}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-green-500 transition"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Truck className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">{p.company || "Unnamed Provider"}</h2>
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                  <span>{p.user?.email}</span>
                  {p.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {p.city}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Vehicles</p>
                <p className="font-semibold text-gray-900">{p.vehicles?.length || 0}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Earnings</p>
                <p className="font-semibold text-green-600">R{p.earnings?.toFixed(2) || "0.00"}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}