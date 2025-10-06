"use client";

import RequireAuth from "@/components/RequiredAuth";
import { useAuth } from "@/providers/auth-provider/AuthProvider";

// /src/app/dashboard/page.tsx
export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <RequireAuth>
      <div>
        <h1>Dashboard</h1>
        <p>Welcome, {user?.name}</p>
        <button onClick={logout}>Logout</button>
      </div>
    </RequireAuth>
  );
}
