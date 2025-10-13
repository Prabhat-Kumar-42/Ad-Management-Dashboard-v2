"use client";

import { useState, useEffect } from "react";
import { API } from "@/lib/api";
import RequireAuth from "@/components/RequiredAuth";
import { CampaignList } from "./components/CampaignList";
import { CampaignForm } from "./components/CampaignForm";

// /src/app/dashboard/campaigns/page.tsx
type Campaign = {
  id: number;
  name: string;
  objective: string;
  status: string;
  budget: number;
  createdAt: string;
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await API.get("meta/campaigns");
      setCampaigns(res.data);
    } catch (err: any) {
      console.error(err);
      alert("Failed to fetch campaigns");
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setLoading(true);
    try {
      await API.get("meta/campaigns/sync");
      await fetchCampaigns();
      alert("Campaigns synced with Meta successfully!");
    } catch (err: any) {
      console.error(err);
      alert("Failed to sync campaigns");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-100 px-6 py-10">
        <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Campaigns</h1>
            <div className="flex gap-3">
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                + New Campaign
              </button>
              <button
                onClick={handleSync}
                disabled={loading}
                className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 transition disabled:opacity-50"
              >
                {loading ? "Syncing..." : "Sync from Meta"}
              </button>
            </div>
          </div>

          {loading ? (
            <p className="text-gray-500">Loading campaigns...</p>
          ) : (
            <CampaignList campaigns={campaigns} refresh={fetchCampaigns} />
          )}
        </div>

        {showForm && (
          <CampaignForm
            onClose={() => setShowForm(false)}
            onCreated={fetchCampaigns}
          />
        )}
      </div>
    </RequireAuth>
  );
}
