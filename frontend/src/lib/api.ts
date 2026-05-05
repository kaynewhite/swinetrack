import { useAuth } from "@clerk/clerk-react";

const BASE = "/api";

async function request(path: string, options: RequestInit = {}, token?: string | null) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
}

export function useApi() {
  const { getToken } = useAuth();
  const get = async (path: string) => {
    const token = await getToken();
    return request(path, { method: "GET" }, token);
  };
  const post = async (path: string, body: unknown) => {
    const token = await getToken();
    return request(path, { method: "POST", body: JSON.stringify(body) }, token);
  };
  const patch = async (path: string, body: unknown) => {
    const token = await getToken();
    return request(path, { method: "PATCH", body: JSON.stringify(body) }, token);
  };
  const del = async (path: string) => {
    const token = await getToken();
    return request(path, { method: "DELETE" }, token);
  };
  return { get, post, patch, del };
}
