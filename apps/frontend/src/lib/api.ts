"use client";
import axios from "axios";

// /src/lib/api.ts
const rawBase = process.env.API_BASE_URL || "http://localhost:4000";
let base = rawBase.replace(/\/$/, ""); // strip trailing slash

if (!base.endsWith("/api")) {
  base = base + "/api";
}

// Create instance with base URL
export const API = axios.create({
  baseURL: base,
});

// Add interceptor to attach token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (typeof window !== "undefined") {
        window.location.href = "/login?reason=expired";
      }
    }
    return Promise.reject(error);
  }
);
