"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@repo/validators-and-types/validators/auth.validators";
import type { RegisterInput } from "@repo/validators-and-types/types/auth.types";
import { API } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider/AuthProvider";

export default function SignupPage() {
  const { login } = useAuth();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    try {
      const res = await API.post("/auth/register", data);
      login(res.data.token, res.data.user); // auto-login after signup
    } catch (err: any) {
      alert(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Signup</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Name"
          {...register("name")}
          className="border p-2 rounded"
        />
        {errors.name && <p className="text-red-500">{errors.name.message}</p>}

        <input
          type="email"
          placeholder="Email"
          {...register("email")}
          className="border p-2 rounded"
        />
        {errors.email && <p className="text-red-500">{errors.email.message}</p>}

        <input
          type="password"
          placeholder="Password"
          {...register("password")}
          className="border p-2 rounded"
        />
        {errors.password && <p className="text-red-500">{errors.password.message}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
        >
          {isSubmitting ? "Registering..." : "Signup"}
        </button>
      </form>
    </div>
  );
}
