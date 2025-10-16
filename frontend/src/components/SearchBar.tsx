import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function SearchBar() {
  const navigate = useNavigate();
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [moveType, setMoveType] = useState("APARTMENT");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?pickup=${pickup}&dropoff=${dropoff}&moveType=${moveType}`);
  };

  return (
    <form onSubmit={handleSearch} className="flex flex-wrap gap-3 justify-center">
      <input
        placeholder="Pickup location"
        value={pickup}
        onChange={(e) => setPickup(e.target.value)}
        className="border p-2 rounded w-60"
      />
      <input
        placeholder="Dropoff location"
        value={dropoff}
        onChange={(e) => setDropoff(e.target.value)}
        className="border p-2 rounded w-60"
      />
      <select
        value={moveType}
        onChange={(e) => setMoveType(e.target.value)}
        className="border p-2 rounded"
      >
        <option value="APARTMENT">Apartment Move</option>
        <option value="OFFICE">Office Move</option>
        <option value="SINGLE_ITEM">Single Item</option>
      </select>
      <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
        Search
      </button>
    </form>
  );
}
