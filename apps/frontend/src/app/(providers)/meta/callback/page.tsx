"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { API } from "@/lib/api";

// /src/app/(providers)/meta/callback/page.tsx
export default function MetaCallbackPage() {
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const code = params.get("code");
    if (!code) return;

    const connect = async () => {
      try {
        await API.get(`/meta/callback?code=${code}`);
        alert("Meta account connected successfully!");
      } catch (err: any) {
        console.error(err);
        alert("Failed to connect Meta account");
      } finally {
        router.push("/dashboard");
      }
    };

    connect();
  }, [params, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-600">Connecting your Meta account...</p>
    </div>
  );
}
