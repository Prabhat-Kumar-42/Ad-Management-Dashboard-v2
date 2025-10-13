"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { API } from "@/lib/api";
import RequireAuth from "@/components/RequiredAuth";

// /src/app/dashboard/campaigns/[id]/page.tsx
type Campaign = {
  id: number;
  name: string;
  objective: string;
  status: string;
  budget: number;
  createdAt: string;
  updatedAt?: string;
  metaCampaignId?: string;
};

export default function CampaignDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCampaign = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/meta/campaigns/${id}`);
      setCampaign(res.data);
    } catch (err: any) {
      console.error(err);
      alert("Failed to load campaign details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchCampaign();
  }, [id]);

  if (loading || !campaign) {
    return (
      <RequireAuth>
        <div className="min-h-screen flex items-center justify-center text-gray-500">
          {loading ? "Loading campaign..." : "Campaign not found"}
        </div>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-100 px-6 py-10">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-8">
          <button
            onClick={() => router.push("/dashboard/campaigns")}
            className="text-blue-600 hover:underline mb-4"
          >
            ← Back to Campaigns
          </button>

          <h1 className="text-3xl font-bold mb-6">{campaign.name}</h1>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-sm text-gray-500">Objective</p>
              <p className="text-lg">{campaign.objective}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <span
                className={`px-2 py-1 rounded text-sm ${
                  campaign.status === "ACTIVE"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {campaign.status}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Budget</p>
              <p className="text-lg">${campaign.budget}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Created</p>
              <p className="text-lg">
                {new Date(campaign.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {campaign.metaCampaignId && (
            <div className="mb-8">
              <p className="text-sm text-gray-500">Meta Campaign ID</p>
              <p className="font-mono bg-gray-50 border p-2 rounded">
                {campaign.metaCampaignId}
              </p>
            </div>
          )}

          <hr className="my-8" />

          {/* --- Placeholder for upcoming stages --- */}
          <div className="space-y-4">
            <section>
              <h2 className="text-xl font-semibold mb-2">Ad Sets</h2>
              <p className="text-gray-500">
                Will display campaign’s Ad Sets (Stage 4)
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">Creatives</h2>
              <p className="text-gray-500">
                Will display campaign creatives (Stage 5)
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">Performance Metrics</h2>
              <p className="text-gray-500">
                Will display analytics from Meta (Stage 6)
              </p>
            </section>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
