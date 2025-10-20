import { useState } from "react";
import {
  FileText,
  Download,
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCw,
} from "lucide-react";

interface FilePreviewProps {
  file: {
    url: string;
    name: string;
  } | null;
  onClose: () => void;
}

export default function EnhancedFilePreviewModal({
  file,
  onClose,
}: FilePreviewProps) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  if (!file) return null;

  const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";
  const fullUrl = `${
    import.meta.env.VITE_API_URL || "http://localhost:4000"
  }/${file.url.replace(/\\/g, "/")}`;

  const isImage = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"].includes(
    fileExtension
  );
  const isPDF = fileExtension === "pdf";
  const isDoc = ["doc", "docx"].includes(fileExtension);
  const isExcel = ["xls", "xlsx", "csv"].includes(fileExtension);
  const isText = ["txt", "json", "xml", "md"].includes(fileExtension);

  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = fullUrl;
    link.download = file.name;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-7xl max-h-[95vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <FileText className="w-6 h-6 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-lg">Document Preview</h3>
              <p className="text-sm text-slate-300 truncate">{file.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {isImage && (
              <>
                <button
                  onClick={() => setZoom(Math.max(50, zoom - 25))}
                  className="p-2 hover:bg-slate-700 rounded-lg transition"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-5 h-5" />
                </button>
                <span className="text-sm font-semibold min-w-[60px] text-center">
                  {zoom}%
                </span>
                <button
                  onClick={() => setZoom(Math.min(200, zoom + 25))}
                  className="p-2 hover:bg-slate-700 rounded-lg transition"
                  title="Zoom In"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
                <div className="w-px h-6 bg-slate-600 mx-2" />
                <button
                  onClick={handleRotate}
                  className="p-2 hover:bg-slate-700 rounded-lg transition"
                  title="Rotate"
                >
                  <RotateCw className="w-5 h-5" />
                </button>
                <div className="w-px h-6 bg-slate-600 mx-2" />
              </>
            )}
            <button
              onClick={handleDownload}
              className="p-2 hover:bg-slate-700 rounded-lg transition"
              title="Download"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-red-600 rounded-lg transition"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-slate-100 p-4">
          <div className="flex items-center justify-center min-h-full">
            {/* Image Preview */}
            {isImage && (
              <div className="relative">
                <img
                  src={fullUrl}
                  alt={file.name}
                  className="max-w-full h-auto rounded-lg shadow-2xl transition-all duration-200"
                  style={{
                    transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                    transformOrigin: "center",
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23ddd' width='400' height='300'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3EImage Failed to Load%3C/text%3E%3C/svg%3E";
                  }}
                />
              </div>
            )}

            {/* PDF Preview */}
            {isPDF && (
              <iframe
                src={fullUrl}
                className="w-full h-[80vh] rounded-lg shadow-xl bg-white"
                title="PDF Preview"
              />
            )}

            {/* Word Document */}
            {isDoc && (
              <div className="bg-white rounded-2xl p-8 shadow-xl max-w-3xl w-full">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <FileText className="w-10 h-10 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      Word Document
                    </h3>
                    <p className="text-slate-600 mb-1">{file.name}</p>
                    <p className="text-sm text-slate-500">
                      Preview not available for Word documents
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                    <a
                      href={fullUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition shadow-lg"
                    >
                      <Maximize2 className="w-5 h-5" />
                      Open in New Tab
                    </a>
                    <button
                      onClick={handleDownload}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition shadow-lg"
                    >
                      <Download className="w-5 h-5" />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Excel/CSV */}
            {isExcel && (
              <div className="bg-white rounded-2xl p-8 shadow-xl max-w-3xl w-full">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <FileText className="w-10 h-10 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      Excel Spreadsheet
                    </h3>
                    <p className="text-slate-600 mb-1">{file.name}</p>
                    <p className="text-sm text-slate-500">
                      Preview not available for Excel files
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                    <a
                      href={fullUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition shadow-lg"
                    >
                      <Maximize2 className="w-5 h-5" />
                      Open in New Tab
                    </a>
                    <button
                      onClick={handleDownload}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition shadow-lg"
                    >
                      <Download className="w-5 h-5" />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Text Files */}
            {isText && (
              <div className="bg-white rounded-2xl p-8 shadow-xl max-w-4xl w-full">
                <iframe
                  src={fullUrl}
                  className="w-full h-[70vh] border-2 border-slate-200 rounded-lg"
                  title="Text Preview"
                />
              </div>
            )}

            {/* Unknown File Type */}
            {!isImage && !isPDF && !isDoc && !isExcel && !isText && (
              <div className="bg-white rounded-2xl p-8 shadow-xl max-w-3xl w-full">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                    <FileText className="w-10 h-10 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      File Preview Unavailable
                    </h3>
                    <p className="text-slate-600 mb-1">{file.name}</p>
                    <p className="text-sm text-slate-500">
                      This file type cannot be previewed in the browser
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                    <a
                      href={fullUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-xl font-semibold transition shadow-lg"
                    >
                      <Maximize2 className="w-5 h-5" />
                      Open in New Tab
                    </a>
                    <button
                      onClick={handleDownload}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition shadow-lg"
                    >
                      <Download className="w-5 h-5" />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

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
