import React, { useState } from "react";
import { createProvider } from "../services/providerApi";
import { useAuth } from "../hooks/useAuth";

export default function AddProviderForm() {
  const [company, setCompany] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    if (!user?.id) {
      setError("User ID not found. Please log in.");
      setLoading(false);
      return;
    }
    try {
      await createProvider({ userId: user.id, company, bio });
      setSuccess("Provider created successfully!");
      setCompany("");
      setBio("");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to create provider");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="max-w-md mx-auto bg-white p-8 rounded shadow" onSubmit={handleSubmit}>
      <h2 className="text-xl font-semibold mb-6">Add New Provider</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {success && <div className="text-green-600 mb-4">{success}</div>}
      <div className="mb-4">
        <label className="block mb-2 font-medium">Company Name</label>
        <input
          type="text"
          className="w-full border p-2 rounded"
          value={company}
          onChange={e => setCompany(e.target.value)}
          required
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2 font-medium">Bio</label>
        <textarea
          className="w-full border p-2 rounded"
          value={bio}
          onChange={e => setBio(e.target.value)}
          required
        />
      </div>
      <button
        type="submit"
        className="bg-indigo-600 text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? "Creating..." : "Create Provider"}
      </button>
    </form>
  );
}
