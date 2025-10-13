"use client";

import { useState } from "react";
import { API } from "@/lib/api";

// /src/app/dashboard/campaigns/components/CampaignForm.tsx
type Props = {
  onClose: () => void;
  onCreated: () => void;
};

export const CampaignForm = ({ onClose, onCreated }: Props) => {
  const [form, setForm] = useState({
    name: "",
    objective: "",
    budget: "",
    status: "ACTIVE",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("meta/campaigns", {
        ...form,
        budget: parseFloat(form.budget),
      });
      alert("Campaign created successfully!");
      onCreated();
      onClose();
    } catch (err: any) {
      console.error(err);
      alert("Failed to create campaign");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Create Campaign</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Campaign Name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />

          <input
            type="text"
            name="objective"
            placeholder="Objective"
            value={form.objective}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />

          <input
            type="number"
            name="budget"
            placeholder="Budget"
            value={form.budget}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="ACTIVE">Active</option>
            <option value="PAUSED">Paused</option>
          </select>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
