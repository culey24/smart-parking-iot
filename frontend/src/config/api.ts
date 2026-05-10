export const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export const TOKEN_KEY = "sp_token";

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  const authHeader: Record<string, string> = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
      ...options?.headers,
    },
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string; message?: string }).message ?? (err as { error?: string }).error ?? res.statusText);
  }
  return res.json() as Promise<T>;
}
