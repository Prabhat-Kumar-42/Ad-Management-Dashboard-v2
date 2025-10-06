"use client";

import { Suspense } from "react";
import LoginForm from "./components/LoginForm";

// /src/app/login/page.tsx
export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
