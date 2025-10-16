import { useQuery } from "@tanstack/react-query";
import { Search, AlertCircle } from "lucide-react";
import { useState } from "react";
import api from "../../services/axios";

export default function AdminComplaints() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: complaints = [], isLoading } = useQuery({
    queryKey: ["adminComplaints"],
    queryFn: async () => (await api.get("/admin/complaints")).data,
  });

  const filteredComplaints = complaints.filter((c: any) =>
    c.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.plateNumber?.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h1 className="text-2xl font-bold text-gray-900">All Complaints</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search complaints..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredComplaints.map((c: any) => (
          <div key={c.id} className="bg-white p-5 rounded-lg border border-gray-200 hover:border-red-300 transition">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Complaint #{c.id.slice(0, 8)}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Booking: {c.bookingId?.slice(0, 8)}... | Plate: {c.plateNumber}
                  </p>
                </div>
              </div>
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                c.status === "RESOLVED" ? "bg-green-100 text-green-700" :
                c.status === "UNDER_REVIEW" ? "bg-yellow-100 text-yellow-700" :
                c.status === "REJECTED" ? "bg-red-100 text-red-700" :
                "bg-gray-100 text-gray-700"
              }`}>
                {c.status}
              </span>
            </div>

            <p className="text-gray-700 mb-3">{c.description}</p>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Target:</span>{" "}
                <span className="capitalize">{c.issueTarget?.toLowerCase()}</span>
              </div>
              <div className="text-sm text-gray-500">
                Reported by: {c.customer?.email}
              </div>
              <div className="text-xs text-gray-400">
                {new Date(c.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredComplaints.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No complaints found matching your search
        </div>
      )}
    </div>
  );
}