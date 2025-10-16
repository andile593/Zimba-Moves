import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileText, Upload, Trash2, CheckCircle, Clock, XCircle } from "lucide-react";
import FileUpload from "../../components/FileUpload/FileUpload";
import { useUploadProviderFile, useProviderFiles, useDeleteProviderFile } from "../../hooks/useFileUpload";
import type { FileCategory, FileStatus } from "../../types/enums";
import api from "../../services/axios";

export default function ProviderDocuments() {
  const [uploadingCategory, setUploadingCategory] = useState<FileCategory | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [providerId, setProviderId] = useState<string>("");

  // Get provider ID
  const { data: providerProfile } = useQuery({
    queryKey: ["myProvider"],
    queryFn: async () => {
      const res = await api.get("/providers/me/profile");
      setProviderId(res.data.id);
      return res.data;
    },
  });

  const { data: files, isLoading } = useProviderFiles(providerId);
  const uploadMutation = useUploadProviderFile();
  const deleteMutation = useDeleteProviderFile();

  const documentCategories = [
    {
      category: "LICENSE" as FileCategory,
      label: "Business License",
      description: "Upload your valid business operating license",
      required: true,
    },
    {
      category: "INSURANCE" as FileCategory,
      label: "Insurance Certificate",
      description: "Upload proof of liability insurance coverage",
      required: true,
    },
    {
      category: "PROFILE_PIC" as FileCategory,
      label: "Company Logo",
      description: "Upload your company logo or profile picture",
      required: false,
    },
    {
      category: "BRANDING" as FileCategory,
      label: "Vehicle Photos",
      description: "Upload photos of your vehicles",
      required: false,
    },
  ];

  const getStatusBadge = (status: FileStatus) => {
    const styles = {
      PENDING: "bg-yellow-100 text-yellow-800",
      APPROVED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
    };

    const icons = {
      PENDING: <Clock className="w-4 h-4" />,
      APPROVED: <CheckCircle className="w-4 h-4" />,
      REJECTED: <XCircle className="w-4 h-4" />,
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {icons[status]}
        {status}
      </span>
    );
  };

  const handleFileSelect = (category: FileCategory, file: File) => {
    setUploadingCategory(category);
    setSelectedFile(file);
  };

  const handleUpload = () => {
    if (!selectedFile || !uploadingCategory || !providerId) return;

    uploadMutation.mutate(
      { providerId, file: selectedFile, category: uploadingCategory },
      {
        onSuccess: () => {
          setSelectedFile(null);
          setUploadingCategory(null);
        },
      }
    );
  };

  const handleDelete = (fileId: string) => {
    if (window.confirm("Are you sure you want to delete this file?")) {
      deleteMutation.mutate({ providerId, fileId });
    }
  };

  const getFilesForCategory = (category: FileCategory) => {
    return files?.filter((f) => f.category === category) || [];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Documents & Files</h1>
          <p className="text-gray-600 mt-1">
            Upload and manage your business documents and vehicle photos
          </p>
        </div>

        {/* Upload Section */}
        {documentCategories.map((doc) => {
          const categoryFiles = getFilesForCategory(doc.category);
          const isUploading = uploadingCategory === doc.category;

          return (
            <div key={doc.category} className="mb-8 pb-8 border-b last:border-b-0">
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                {doc.label}
                {doc.required && <span className="text-red-500 ml-1">*</span>}
              </h3>
              <p className="text-sm text-gray-600 mb-4">{doc.description}</p>

              {/* Existing Files */}
              {categoryFiles.length > 0 && (
                <div className="mb-4 space-y-2">
                  {categoryFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <FileText className="w-5 h-5 text-gray-600" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {file.url.split("/").pop()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(file.createdAt!).toLocaleDateString()}
                          </p>
                        </div>
                        {getStatusBadge(file.status!)}
                      </div>
                      <button
                        onClick={() => handleDelete(file.id!)}
                        className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload New File */}
              {isUploading && selectedFile ? (
                <div className="space-y-3">
                  <FileUpload
                    category={doc.category}
                    label=""
                    description=""
                    onFileSelect={(file) => handleFileSelect(doc.category, file)}
                    onFileRemove={() => {
                      setSelectedFile(null);
                      setUploadingCategory(null);
                    }}
                    selectedFile={selectedFile}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpload}
                      disabled={uploadMutation.isPending}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                    >
                      {uploadMutation.isPending ? "Uploading..." : "Upload File"}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setUploadingCategory(null);
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setUploadingCategory(doc.category)}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-green-400 hover:text-green-600 transition"
                >
                  <Upload className="w-5 h-5" />
                  Upload {doc.label}
                </button>
              )}
            </div>
          );
        })}

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">
            Document Verification
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• All documents will be reviewed by our admin team</li>
            <li>• Approved documents will show a green badge</li>
            <li>• You may be contacted if additional information is needed</li>
            <li>• Keep your documents up to date to maintain active status</li>
          </ul>
        </div>
      </div>
    </div>
  );
}