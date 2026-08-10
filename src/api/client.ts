/**
 * LilTreats API client.
 * All requests go to /api/* which Vite proxies to the Express server on :4000.
 * The JWT token is read from authStore and attached automatically.
 */

function getToken(): string | null {
  try {
    const raw = localStorage.getItem("liltreats-auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { token?: string } };
    return parsed?.state?.token ?? null;
  } catch {
    return null;
  }
}

interface ApiOptions extends RequestInit {
  auth?: boolean; // default true — attach JWT if present
}

export async function apiRequest<T = unknown>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const { auth = true, ...rest } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(rest.headers as Record<string, string> | undefined),
  };

  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`/api${path}`, { ...rest, headers });

  if (!res.ok) {
    let message = `API error ${res.status}`;
    try {
      const body = await res.json() as { error?: string };
      if (body.error) message = body.error;
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string, options?: ApiOptions) =>
    apiRequest<T>(path, { method: "GET", ...options }),

  post: <T>(path: string, body: unknown, options?: ApiOptions) =>
    apiRequest<T>(path, { method: "POST", body: JSON.stringify(body), ...options }),

  patch: <T>(path: string, body: unknown, options?: ApiOptions) =>
    apiRequest<T>(path, { method: "PATCH", body: JSON.stringify(body), ...options }),

  put: <T>(path: string, body: unknown, options?: ApiOptions) =>
    apiRequest<T>(path, { method: "PUT", body: JSON.stringify(body), ...options }),

  del: <T>(path: string, options?: ApiOptions) =>
    apiRequest<T>(path, { method: "DELETE", ...options }),
};
