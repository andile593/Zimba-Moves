import { FileText } from "lucide-react";

export default function MissingProvider({ navigate }: { navigate: any }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 py-8 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Provider Not Found</h2>
          <p className="text-gray-600 mb-6">No provider ID was provided.</p>
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