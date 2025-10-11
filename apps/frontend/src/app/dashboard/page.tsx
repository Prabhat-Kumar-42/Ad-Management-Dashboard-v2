"use client";

import RequireAuth from "@/components/RequiredAuth";
import { API } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider/AuthProvider";
import { useEffect, useState } from "react";

type MetaAccount = {
  id: number;
  providerAccountId: string;
  createdAt: string;
};

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [accounts, setAccounts] = useState<MetaAccount[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAccounts = async () => {
    try {
      const res = await API.get("/meta/accounts");
      setAccounts(res.data);
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleConnectMeta = async () => {
    try {
      const res = await API.get("/meta/auth/url");
      window.location.href = res.data.url;
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to get Meta OAuth URL");
    }
  };

  const handleDisconnectMeta = async () => {
    if (!confirm("Are you sure you want to disconnect your Meta account?")) return;
    setLoading(true);
    try {
      await API.delete("/meta/deauth");
      alert("Meta account disconnected successfully.");
      await fetchAccounts(); // refresh list
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to disconnect Meta account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-100 px-6 py-10">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-600 mb-6">Welcome, {user?.name}</p>

          <div className="flex flex-wrap items-center gap-4 mb-8">
            <button
              onClick={handleConnectMeta}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
            >
              Connect Meta Account
            </button>

            <button
              onClick={handleDisconnectMeta}
              disabled={loading || accounts.length === 0}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition disabled:opacity-50"
            >
              {loading ? "Disconnecting..." : "Disconnect Meta Account"}
            </button>

            <button
              onClick={logout}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition"
            >
              Logout
            </button>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Connected Meta Accounts</h2>

            {accounts.length === 0 ? (
              <p className="text-gray-500">No Meta accounts connected.</p>
            ) : (
              <ul className="space-y-4">
                {accounts.map((acc) => (
                  <li
                    key={acc.id}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm"
                  >
                    <p>
                      <span className="font-medium">Account ID:</span>{" "}
                      {acc.providerAccountId}
                    </p>
                    <p>
                      <span className="font-medium">Connected on:</span>{" "}
                      {new Date(acc.createdAt).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
