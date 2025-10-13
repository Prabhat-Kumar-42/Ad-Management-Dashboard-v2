"use client";

import { API } from "@/lib/api";

// /src/app/dashboard/campaigns/components/CampaignList.tsx
type Props = {
  campaigns: {
    id: number;
    name: string;
    objective: string;
    status: string;
    budget: number;
    createdAt: string;
  }[];
  refresh: () => void;
};

export const CampaignList = ({ campaigns, refresh }: Props) => {
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this campaign?")) return;
    try {
      await API.delete(`/meta/campaigns/${id}`);
      alert("Campaign deleted successfully!");
      refresh();
    } catch (err: any) {
      console.error(err);
      alert("Failed to delete campaign");
    }
  };

  if (campaigns.length === 0) {
    return <p className="text-gray-500">No campaigns found.</p>;
  }

  return (
    <table className="w-full border border-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="p-3 text-left border-b">Name</th>
          <th className="p-3 text-left border-b">Objective</th>
          <th className="p-3 text-left border-b">Budget</th>
          <th className="p-3 text-left border-b">Status</th>
          <th className="p-3 text-left border-b">Created</th>
          <th className="p-3 text-left border-b"></th>
        </tr>
      </thead>
      <tbody>
        {campaigns.map((c) => (
          <tr key={c.id} className="border-b hover:bg-gray-50">
            <td className="p-3">{c.name}</td>
            <td className="p-3">{c.objective}</td>
            <td className="p-3">${c.budget}</td>
            <td className="p-3">
              <span
                className={`px-2 py-1 rounded text-sm ${
                  c.status === "ACTIVE"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {c.status}
              </span>
            </td>
            <td className="p-3">
              {new Date(c.createdAt).toLocaleDateString()}
            </td>
            <td className="p-3 text-right">
              <button
                onClick={() => handleDelete(c.id)}
                className="text-red-600 hover:underline"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
