import { useState, useRef } from "react";
import { Upload, X, FileText, Image as ImageIcon, CheckCircle, AlertCircle } from "lucide-react";
import type { FileCategory } from "../../types/enums";

interface FileUploadProps {
  category: FileCategory;
  label: string;
  description: string;
  accept?: string;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  selectedFile?: File | null;
  error?: string;
  required?: boolean;
}

export default function FileUpload({
  category,
  label,
  description,
  accept = "image/*,.pdf,.doc,.docx",
  onFileSelect,
  onFileRemove,
  selectedFile,
  error,
  required = false,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    // Validate file type
    const validTypes = accept.split(",").map(t => t.trim());
    const isValid = validTypes.some(type => {
      if (type === "image/*") return file.type.startsWith("image/");
      if (type.startsWith(".")) return file.name.toLowerCase().endsWith(type);
      return file.type === type;
    });

    if (!isValid) {
      alert("Invalid file type. Please upload an image or document.");
      return;
    }

    onFileSelect(file);
  };

  const getFileIcon = () => {
    if (!selectedFile) return <Upload className="w-8 h-8 text-gray-400" />;
    
    if (selectedFile.type.startsWith("image/")) {
      return <ImageIcon className="w-8 h-8 text-green-600" />;
    }
    return <FileText className="w-8 h-8 text-blue-600" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <p className="text-xs text-gray-500 mb-2">{description}</p>

      {!selectedFile ? (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition ${
            dragActive
              ? "border-green-500 bg-green-50"
              : error
              ? "border-red-300 bg-red-50"
              : "border-gray-300 hover:border-green-400"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept={accept}
            onChange={handleChange}
          />

          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              {getFileIcon()}
            </div>
            
            <p className="text-sm text-gray-600 mb-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="text-green-600 font-medium hover:text-green-700"
              >
                Click to upload
              </button>{" "}
              or drag and drop
            </p>
            
            <p className="text-xs text-gray-500">
              Images (PNG, JPG, WEBP) or Documents (PDF, DOC) up to 5MB
            </p>
          </div>
        </div>
      ) : (
        <div className="border-2 border-green-200 bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
              {getFileIcon()}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {selectedFile.name}
                </p>
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
              </div>
              <p className="text-xs text-gray-500">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
            
            <button
              type="button"
              onClick={onFileRemove}
              className="p-2 hover:bg-red-100 rounded-lg transition text-red-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 mt-2 text-red-600">
          <AlertCircle className="w-4 h-4" />
          <p className="text-xs">{error}</p>
        </div>
      )}
    </div>
  );
}
