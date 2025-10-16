import { Link } from "react-router-dom";

export default function ProviderCard({ provider }: { provider: any }) {
  return (
    <div className="border rounded-xl p-4 shadow hover:shadow-lg transition">
      <h3 className="text-lg font-semibold text-indigo-700 mb-1">
        {provider.company || "Independent Provider"}
      </h3>
      <p className="text-sm text-gray-600 mb-3">
        {provider.bio || "Reliable moving services at competitive rates."}
      </p>
      <Link
        to={`/provider/${provider.id}`}
        className="text-indigo-600 font-medium hover:underline"
      >
        View Details →
      </Link>
    </div>
  );
}
