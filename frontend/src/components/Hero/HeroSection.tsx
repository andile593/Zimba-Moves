import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin } from "lucide-react";

export default function HeroSection() {
  const navigate = useNavigate();
  const [address, setAddress] = useState("");
  const [isGeocoding, setIsGeocoding] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address.trim()) {
      return;
    }

    setIsGeocoding(true);

    try {
      // Geocode the address to get coordinates
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        // Navigate to search results with coordinates
        navigate(`/search?address=${encodeURIComponent(address)}&lat=${lat}&lng=${lon}`);
      } else {
        // If geocoding fails, just search with the address string
        navigate(`/search?address=${encodeURIComponent(address)}`);
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      // Fallback: search with just the address
      navigate(`/search?address=${encodeURIComponent(address)}`);
    } finally {
      setIsGeocoding(false);
    }
  };

  return (
    <section className="bg-white px-4 py-12 sm:py-20 md:py-28 text-center">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-gray-800 mb-3 sm:mb-4">
          Find <span className="text-green-700">Movers.</span> Book{" "}
          <span className="text-green-700">Helpers.</span>
          <br className="hidden sm:block" />
          Stress-Free.
        </h1>

        <p className="text-gray-500 text-sm sm:text-base mb-6 sm:mb-8 px-4">
          Enter your address to find verified movers near you
        </p>

        {/* Search Form */}
        <form 
          onSubmit={handleSearch}
          className="w-full max-w-2xl mx-auto"
        >
          {/* Search Input */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Enter your street address or suburb..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-3 sm:py-3.5 pl-11 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 bg-gray-50 text-gray-700 placeholder-gray-400 text-sm sm:text-base"
                required
                disabled={isGeocoding}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <MapPin className="w-5 h-5" />
              </div>
            </div>
            
            <button 
              type="submit"
              disabled={isGeocoding}
              className="bg-green-700 hover:bg-green-800 text-white font-semibold px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg shadow-md transition flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{isGeocoding ? "Searching..." : "Search"}</span>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}