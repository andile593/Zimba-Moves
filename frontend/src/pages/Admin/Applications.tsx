import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Calendar,
  MapPin,
  Building2,
  CreditCard,
  Truck,
  Mail,
  Phone,
  Eye,
  Loader2
} from "lucide-react";
import api from "../../services/axios";

export default function AdminApplications() {
  const queryClient = useQueryClient();
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({
    status: "APPROVED",
    rejectionReason: "",
    adminNotes: ""
  });

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["pendingApplications"],
    queryFn: async () => {
      const res = await api.get("/admin/applications/pending");
      return res.data;
    }
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ id, data }: any) => {
      return api.post(`/admin/providers/${id}/review`, data);
    },
    onSuccess: () => {
      toast.success("Application reviewed successfully");
      queryClient.invalidateQueries({ queryKey: ["pendingApplications"] });
      setShowReviewModal(false);
      setSelectedApp(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Failed to review application");
    }
  });

  const scheduleInspectionMutation = useMutation({
    mutationFn: async ({ id, data }: any) => {
      return api.post(`/admin/providers/${id}/inspection`, data);
    },
    onSuccess: () => {
      toast.success("Inspection scheduled");
      queryClient.invalidateQueries({ queryKey: ["pendingApplications"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Failed to schedule inspection");
    }
  });

  const handleReview = (app: any) => {
    setSelectedApp(app);
    setShowReviewModal(true);
  };

  const submitReview = () => {
    if (!selectedApp) return;
    
    if (reviewData.status === "REJECTED" && !reviewData.rejectionReason) {
      toast.error("Please provide a rejection reason");
      return;
    }

    reviewMutation.mutate({
      id: selectedApp.id,
      data: reviewData
    });
  };

  const getDocumentStatus = (app: any, category: string) => {
    const doc = app.File?.find((f: any) => f.category === category);
    return doc ? doc.status : "MISSING";
  };

  const getDocumentStatusBadge = (status: string) => {
    const styles = {
      APPROVED: "bg-green-100 text-green-800",
      PENDING: "bg-yellow-100 text-yellow-800",
      REJECTED: "bg-red-100 text-red-800",
      MISSING: "bg-gray-100 text-gray-800"
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {status}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-12 h-12 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Provider Applications</h1>
          <p className="text-gray-600 mt-1">{applications.length} pending applications</p>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
          <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Pending Applications</h3>
          <p className="text-gray-600">All applications have been reviewed</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {applications.map((app: any) => (
            <div key={app.id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
              {/* Application Header */}
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 border-b">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      {app.user.firstName[0]}{app.user.lastName[0]}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">
                        {app.user.firstName} {app.user.lastName}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">{app.businessName || "Individual Provider"}</p>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {app.user.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {app.user.phone}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(app.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedApp(app);
                        document.getElementById(`app-${app.id}`)?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                    <button
                      onClick={() => handleReview(app)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      Review
                    </button>
                  </div>
                </div>
              </div>

              {/* Application Details */}
              <div id={`app-${app.id}`} className="p-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Business Info */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-green-600" />
                    Business Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Type:</span>
                      <span className="ml-2 font-medium">{app.businessType}</span>
                    </div>
                    {app.taxNumber && (
                      <div>
                        <span className="text-gray-600">Tax Number:</span>
                        <span className="ml-2 font-medium">{app.taxNumber}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-600">ID Number:</span>
                      <span className="ml-2 font-medium">{app.idNumber}</span>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-green-600" />
                    Location
                  </h4>
                  <div className="space-y-1 text-sm text-gray-700">
                    {app.address && <p>{app.address}</p>}
                    <p>
                      {app.city}{app.region && `, ${app.region}`}
                    </p>
                    <p>{app.postalCode} {app.country}</p>
                  </div>
                </div>

                {/* Banking */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-green-600" />
                    Banking Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Bank:</span>
                      <span className="ml-2 font-medium">{app.bankName}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Account Holder:</span>
                      <span className="ml-2 font-medium">{app.accountHolder}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Account No:</span>
                      <span className="ml-2 font-medium">***{app.accountNumber.slice(-4)}</span>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div className="lg:col-span-3">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-green-600" />
                    Submitted Documents
                  </h4>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      { label: "ID Document", category: "ID_DOCUMENT" },
                      { label: "Proof of Address", category: "PROOF_OF_ADDRESS" },
                      { label: "Vehicle Registration", category: "VEHICLE_REGISTRATION" },
                      { label: "License Disk", category: "VEHICLE_LICENSE_DISK" },
                      { label: "Business License", category: "LICENSE" },
                      { label: "Insurance", category: "INSURANCE" }
                    ].map((doc) => (
                      <div key={doc.category} className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">{doc.label}</p>
                        {getDocumentStatusBadge(getDocumentStatus(app, doc.category))}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Inspection Request */}
                {app.inspectionRequested && (
                  <div className="lg:col-span-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                      <Truck className="w-5 h-5" />
                      Vehicle Inspection Requested
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700">Address:</span>
                        <span className="ml-2 text-blue-900 font-medium">{app.inspectionAddress}</span>
                      </div>
                      {app.inspectionNotes && (
                        <div>
                          <span className="text-blue-700">Notes:</span>
                          <span className="ml-2 text-blue-900">{app.inspectionNotes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedApp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 rounded-t-2xl">
              <h2 className="text-xl font-bold">Review Application</h2>
              <p className="text-sm text-green-100">
                {selectedApp.user.firstName} {selectedApp.user.lastName}
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Decision */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Decision <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  <label className="flex-1 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="APPROVED"
                      checked={reviewData.status === "APPROVED"}
                      onChange={(e) => setReviewData({ ...reviewData, status: e.target.value })}
                      className="sr-only"
                    />
                    <div className={`border-2 rounded-xl p-4 text-center transition ${
                      reviewData.status === "APPROVED"
                        ? "border-green-600 bg-green-50"
                        : "border-gray-200 hover:border-green-300"
                    }`}>
                      <CheckCircle className={`w-8 h-8 mx-auto mb-2 ${
                        reviewData.status === "APPROVED" ? "text-green-600" : "text-gray-400"
                      }`} />
                      <p className={`font-semibold ${
                        reviewData.status === "APPROVED" ? "text-green-800" : "text-gray-600"
                      }`}>
                        Approve
                      </p>
                    </div>
                  </label>

                  <label className="flex-1 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="REJECTED"
                      checked={reviewData.status === "REJECTED"}
                      onChange={(e) => setReviewData({ ...reviewData, status: e.target.value })}
                      className="sr-only"
                    />
                    <div className={`border-2 rounded-xl p-4 text-center transition ${
                      reviewData.status === "REJECTED"
                        ? "border-red-600 bg-red-50"
                        : "border-gray-200 hover:border-red-300"
                    }`}>
                      <XCircle className={`w-8 h-8 mx-auto mb-2 ${
                        reviewData.status === "REJECTED" ? "text-red-600" : "text-gray-400"
                      }`} />
                      <p className={`font-semibold ${
                        reviewData.status === "REJECTED" ? "text-red-800" : "text-gray-600"
                      }`}>
                        Reject
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Rejection Reason */}
              {reviewData.status === "REJECTED" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Rejection Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={reviewData.rejectionReason}
                    onChange={(e) => setReviewData({ ...reviewData, rejectionReason: e.target.value })}
                    placeholder="Explain why the application is being rejected..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This will be sent to the applicant via email
                  </p>
                </div>
              )}

              {/* Admin Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Internal Notes (Optional)
                </label>
                <textarea
                  value={reviewData.adminNotes}
                  onChange={(e) => setReviewData({ ...reviewData, adminNotes: e.target.value })}
                  placeholder="Internal notes for reference..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  These notes are only visible to admins
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowReviewModal(false);
                    setReviewData({ status: "APPROVED", rejectionReason: "", adminNotes: "" });
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={submitReview}
                  disabled={reviewMutation.isPending}
                  className={`flex-1 px-6 py-3 text-white rounded-xl font-semibold transition shadow-lg disabled:opacity-50 ${
                    reviewData.status === "APPROVED"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {reviewMutation.isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    `${reviewData.status === "APPROVED" ? "Approve" : "Reject"} Application`
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}