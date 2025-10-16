import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { searchProviders } from "../../services/providerApi";
import ProviderCard from "../../components/ProviderCard";

export default function SearchResults() {
  const [params] = useSearchParams();
  const filters = Object.fromEntries(params.entries());

  const { data: providers = [], isLoading } = useQuery({
    queryKey: ["searchProviders", filters],
    queryFn: () => searchProviders(filters),
  });

  return (
    <div className="max-w-6xl mx-auto p-8 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6">Search Results</h1>

      {isLoading ? (
        <p>Loading providers...</p>
      ) : providers.length === 0 ? (
        <p>No providers found.</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {providers.map((p: any) => (
            <ProviderCard key={p.id} provider={p} />
          ))}
        </div>
      )}
    </div>
  );
}