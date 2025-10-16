import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "../../services/axios";
import { useNavigate } from "react-router-dom";

interface QuoteData {
  pickup: string;
  dropoff: string;
  moveType: string;
  helpersRequired: number;
}

export default function QuotePage() {
  const [form, setForm] = useState<QuoteData>({
    pickup: "",
    dropoff: "",
    moveType: "APARTMENT",
    helpersRequired: 0,
  });

  const navigate = useNavigate();

  const quoteMutation = useMutation({
    mutationFn: async (data: QuoteData) => {
      const res = await api.post("/quotes", data);
      return res.data;
    },
    onMutate: () => toast.loading("Calculating estimate..."),
    onSuccess: (quote) => {
      toast.dismiss();
      toast.success("Estimate ready!");
      navigate("/checkout", { state: { quote } });
    },
    onError: (err: any) => {
      toast.dismiss();
      toast.error("Failed to get estimate. Try again.");
      console.error(err);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    quoteMutation.mutate(form);
  };

  return (
    <div className="max-w-xl mx-auto mt-12 p-6 bg-white shadow-lg rounded-2xl">
      <h1 className="text-2xl font-semibold mb-4 text-gray-800">Get a Quote</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="pickup"
          placeholder="Pickup Address"
          value={form.pickup}
          onChange={handleChange}
          className="w-full border rounded-lg p-2"
        />
        <input
          name="dropoff"
          placeholder="Dropoff Address"
          value={form.dropoff}
          onChange={handleChange}
          className="w-full border rounded-lg p-2"
        />
        <select
          name="moveType"
          value={form.moveType}
          onChange={handleChange}
          className="w-full border rounded-lg p-2"
        >
          <option value="APARTMENT">Apartment</option>
          <option value="OFFICE">Office</option>
          <option value="SINGLE_ITEM">Single Item</option>
        </select>
        <input
          type="number"
          name="helpersRequired"
          placeholder="Helpers Needed"
          value={form.helpersRequired}
          onChange={handleChange}
          className="w-full border rounded-lg p-2"
        />
        <button
          type="submit"
          disabled={quoteMutation.isPending}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          {quoteMutation.isPending ? "Calculating..." : "Get Quote"}
        </button>
      </form>
    </div>
  );
}
