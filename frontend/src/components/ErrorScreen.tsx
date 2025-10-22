import { FileText } from "lucide-react";


export default function ErrorScreen({ navigate }: { navigate: any }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 py-8 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <FileText className="w-16 h-16 text-red-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Provider</h2>
          <p className="text-gray-600 mb-6">
            We couldn't load the provider information. Please try again.
          </p>
          <button
            onClick={() => navigate("/search")}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl transition"
          >
            Back to Search
          </button>
        </div>
      </div>
    </div>
  );
}
