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
  Loader2,
  User,
  Shield,
  AlertCircle,
  Download,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles
} from "lucide-react";
import api from "../../services/axios";

export default function AdminApplications() {
  const queryClient = useQueryClient();
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [expandedApps, setExpandedApps] = useState<Set<string>>(new Set());
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
      setReviewData({ status: "APPROVED", rejectionReason: "", adminNotes: "" });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Failed to review application");
    }
  });

  const toggleExpand = (appId: string) => {
    setExpandedApps(prev => {
      const next = new Set(prev);
      if (next.has(appId)) {
        next.delete(appId);
      } else {
        next.add(appId);
      }
      return next;
    });
  };

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
    reviewMutation.mutate({ id: selectedApp.id, data: reviewData });
  };

  const getDocumentStatus = (app: any, category: string) => {
    const doc = app.files?.find((f: any) => f.category === category);
    return doc ? doc.status : "MISSING";
  };

  const getDocumentUrl = (app: any, category: string) => {
    const doc = app.files?.find((f: any) => f.category === category);
    return doc?.url || null;
  };

  const getDocumentStatusBadge = (status: string) => {
    const config = {
      APPROVED: { bg: "bg-emerald-500", text: "text-white", icon: CheckCircle },
      PENDING: { bg: "bg-amber-500", text: "text-white", icon: Clock },
      REJECTED: { bg: "bg-rose-500", text: "text-white", icon: XCircle },
      MISSING: { bg: "bg-slate-300", text: "text-slate-700", icon: AlertCircle }
    };
    const style = config[status as keyof typeof config];
    const Icon = style.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text} shadow-sm`}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    );
  };

  const getCompletionPercentage = (app: any) => {
    const requiredDocs = ["ID_DOCUMENT", "PROOF_OF_ADDRESS", "VEHICLE_REGISTRATION", "VEHICLE_LICENSE_DISK"];
    const submitted = requiredDocs.filter(cat => getDocumentStatus(app, cat) !== "MISSING").length;
    return Math.round((submitted / requiredDocs.length) * 100);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="relative">
          <Loader2 className="w-16 h-16 animate-spin text-green-600" />
          <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-green-200 animate-pulse" />
        </div>
        <p className="mt-4 text-slate-600 font-medium">Loading applications...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Floating Header */}
      <div className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-600/20">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                  Applications
                  <Sparkles className="w-5 h-5 text-amber-500" />
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
                    <Clock className="w-3 h-3" />
                    {applications.length}
                  </span>
                  <span className="text-xs text-slate-600">pending review</span>
                </div>
              </div>
            </div>

            {applications.length > 0 && (
              <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition font-medium">
                <Download className="w-4 h-4" />
                Export
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-4">
        {applications.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">All Caught Up! 🎉</h3>
            <p className="text-slate-600 max-w-md mx-auto text-lg">
              No pending applications at the moment. New submissions will appear here.
            </p>
          </div>
        ) : (
          applications.map((app: any) => {
            const completion = getCompletionPercentage(app);
            const allDocsApproved = app.files?.every((f: any) => f.status === "APPROVED");
            const isExpanded = expandedApps.has(app.id);
            
            return (
              <div key={app.id} className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-200">
                {/* Card Header - Always Visible */}
                <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4 sm:p-6">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg">
                        {app.user.firstName[0]}{app.user.lastName[0]}
                      </div>
                      {allDocsApproved && (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                          <Shield className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1">
                        {app.user.firstName} {app.user.lastName}
                      </h3>
                      <p className="text-sm text-slate-600 font-medium mb-3">
                        Individual Provider
                      </p>
                      
                      {/* Contact Pills */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-full text-xs font-medium text-slate-700 shadow-sm">
                          <Mail className="w-3 h-3 text-green-600" />
                          {app.user.email.split('@')[0]}@...
                        </span>
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-full text-xs font-medium text-slate-700 shadow-sm">
                          <Phone className="w-3 h-3 text-green-600" />
                          {app.user.phone}
                        </span>
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-full text-xs font-medium text-slate-700 shadow-sm">
                          <Calendar className="w-3 h-3 text-green-600" />
                          {new Date(app.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-slate-700">Completion</span>
                          <span className="text-xs font-bold text-green-700">{completion}%</span>
                        </div>
                        <div className="relative w-full h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                          <div 
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-full transition-all duration-700 ease-out shadow-sm"
                            style={{ width: `${completion}%` }}
                          />
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => toggleExpand(app.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold transition shadow-sm"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          {isExpanded ? "Less" : "Details"}
                        </button>
                        <button
                          onClick={() => handleReview(app)}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold transition shadow-lg shadow-green-600/30"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Review
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expandable Details */}
                {isExpanded && (
                  <div className="p-4 sm:p-6 space-y-6 animate-fadeIn">
                    {/* Info Cards */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      {/* Personal Info */}
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200">
                        <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                          <User className="w-5 h-5 text-blue-600" />
                          Personal Information
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Full Name</span>
                            <span className="font-semibold text-slate-900">
                              {app.user.firstName} {app.user.lastName}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">ID Number</span>
                            <span className="font-semibold text-slate-900">{app.idNumber || "N/A"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Phone</span>
                            <span className="font-semibold text-slate-900">{app.user.phone}</span>
                          </div>
                        </div>
                      </div>

                      {/* Location */}
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-200">
                        <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-purple-600" />
                          Location
                        </h4>
                        <div className="space-y-1 text-sm">
                          {app.address && <p className="font-semibold text-slate-900">{app.address}</p>}
                          <p className="font-medium text-slate-700">
                            {app.city}{app.region && `, ${app.region}`}
                          </p>
                          <p className="text-slate-600">{app.postalCode} {app.country}</p>
                        </div>
                      </div>

                      {/* Banking */}
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-200 sm:col-span-2">
                        <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-green-600" />
                          Banking Details
                        </h4>
                        <div className="grid sm:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-slate-600 block mb-1">Bank</span>
                            <span className="font-semibold text-slate-900">{app.bankName || "N/A"}</span>
                          </div>
                          <div>
                            <span className="text-slate-600 block mb-1">Account Holder</span>
                            <span className="font-semibold text-slate-900">{app.accountHolder || "N/A"}</span>
                          </div>
                          <div>
                            <span className="text-slate-600 block mb-1">Account Number</span>
                            <span className="font-semibold text-slate-900">
                              {app.accountNumber ? `***${app.accountNumber.slice(-4)}` : "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Documents */}
                    <div className="bg-slate-50 rounded-2xl p-4 sm:p-6 border border-slate-200">
                      <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-slate-700" />
                        Documents
                      </h4>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                          { label: "ID Document", category: "ID_DOCUMENT" },
                          { label: "Proof of Address", category: "PROOF_OF_ADDRESS" },
                          { label: "Vehicle Reg", category: "VEHICLE_REGISTRATION" },
                          { label: "License Disk", category: "VEHICLE_LICENSE_DISK" },
                          { label: "Business License", category: "LICENSE" },
                          { label: "Insurance", category: "INSURANCE" }
                        ].map((doc) => {
                          const status = getDocumentStatus(app, doc.category);
                          const url = getDocumentUrl(app, doc.category);
                          
                          return (
                            <div key={doc.category} className="bg-white rounded-xl p-3 border border-slate-200 hover:border-green-300 hover:shadow-md transition group">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-bold text-slate-900">{doc.label}</p>
                                {url && (
                                  <a
                                    href={`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/${url.replace(/\\/g, '/')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                )}
                              </div>
                              {getDocumentStatusBadge(status)}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Inspection */}
                    {app.inspectionRequested && (
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 sm:p-6 border-2 border-blue-300">
                        <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                          <Truck className="w-5 h-5" />
                          Inspection Requested
                        </h4>
                        <div className="grid sm:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-blue-700 font-semibold">Address:</span>
                            <p className="text-blue-900 font-bold mt-1">{app.inspectionAddress}</p>
                          </div>
                          {app.inspectionNotes && (
                            <div>
                              <span className="text-blue-700 font-semibold">Notes:</span>
                              <p className="text-blue-900 mt-1">{app.inspectionNotes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedApp && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white px-6 py-6 rounded-t-3xl">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <User className="w-7 h-7" />
                Review Application
              </h2>
              <p className="text-green-100 mt-2 flex items-center gap-2">
                {selectedApp.user.firstName} {selectedApp.user.lastName}
                <span className="text-green-300">•</span>
                <span className="text-sm">{selectedApp.user.email}</span>
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Decision */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-4">
                  Decision <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="cursor-pointer group">
                    <input
                      type="radio"
                      name="status"
                      value="APPROVED"
                      checked={reviewData.status === "APPROVED"}
                      onChange={(e) => setReviewData({ ...reviewData, status: e.target.value })}
                      className="sr-only"
                    />
                    <div className={`border-3 rounded-2xl p-6 text-center transition-all ${
                      reviewData.status === "APPROVED"
                        ? "border-green-600 bg-green-50 shadow-xl shadow-green-600/20 scale-105"
                        : "border-slate-200 hover:border-green-300 hover:shadow-lg"
                    }`}>
                      <CheckCircle className={`w-12 h-12 mx-auto mb-3 ${
                        reviewData.status === "APPROVED" ? "text-green-600" : "text-slate-400"
                      }`} />
                      <p className={`font-bold text-xl mb-1 ${
                        reviewData.status === "APPROVED" ? "text-green-800" : "text-slate-600"
                      }`}>
                        Approve
                      </p>
                      <p className="text-xs text-slate-500">Grant platform access</p>
                    </div>
                  </label>

                  <label className="cursor-pointer group">
                    <input
                      type="radio"
                      name="status"
                      value="REJECTED"
                      checked={reviewData.status === "REJECTED"}
                      onChange={(e) => setReviewData({ ...reviewData, status: e.target.value })}
                      className="sr-only"
                    />
                    <div className={`border-3 rounded-2xl p-6 text-center transition-all ${
                      reviewData.status === "REJECTED"
                        ? "border-rose-600 bg-rose-50 shadow-xl shadow-rose-600/20 scale-105"
                        : "border-slate-200 hover:border-rose-300 hover:shadow-lg"
                    }`}>
                      <XCircle className={`w-12 h-12 mx-auto mb-3 ${
                        reviewData.status === "REJECTED" ? "text-rose-600" : "text-slate-400"
                      }`} />
                      <p className={`font-bold text-xl mb-1 ${
                        reviewData.status === "REJECTED" ? "text-rose-800" : "text-slate-600"
                      }`}>
                        Reject
                      </p>
                      <p className="text-xs text-slate-500">Deny application</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Rejection Reason */}
              {reviewData.status === "REJECTED" && (
                <div className="bg-rose-50 rounded-2xl p-5 border-2 border-rose-300 animate-fadeIn">
                  <label className="block text-sm font-bold text-slate-900 mb-3">
                    Rejection Reason <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    value={reviewData.rejectionReason}
                    onChange={(e) => setReviewData({ ...reviewData, rejectionReason: e.target.value })}
                    placeholder="Provide a clear explanation..."
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-rose-300 rounded-xl focus:ring-4 focus:ring-rose-500/20 focus:border-rose-500 resize-none"
                  />
                  <p className="text-xs text-slate-600 mt-2 flex items-center gap-2">
                    <Mail className="w-3 h-3" />
                    Will be sent to applicant via email
                  </p>
                </div>
              )}

              {/* Admin Notes */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-3">
                  Internal Notes (Optional)
                </label>
                <textarea
                  value={reviewData.adminNotes}
                  onChange={(e) => setReviewData({ ...reviewData, adminNotes: e.target.value })}
                  placeholder="Add notes for records..."
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 resize-none"
                />
                <p className="text-xs text-slate-500 mt-2 flex items-center gap-2">
                  <Shield className="w-3 h-3" />
                  Only visible to admins
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t-2">
                <button
                  onClick={() => {
                    setShowReviewModal(false);
                    setReviewData({ status: "APPROVED", rejectionReason: "", adminNotes: "" });
                  }}
                  className="flex-1 px-6 py-4 border-2 border-slate-300 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={submitReview}
                  disabled={reviewMutation.isPending}
                  className={`flex-1 px-6 py-4 text-white rounded-2xl font-bold transition shadow-xl disabled:opacity-50 ${
                    reviewData.status === "APPROVED"
                      ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-green-600/30"
                      : "bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 shadow-rose-600/30"
                  }`}
                >
                  {reviewMutation.isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      {reviewData.status === "APPROVED" ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                      {reviewData.status === "APPROVED" ? "Approve" : "Reject"}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}