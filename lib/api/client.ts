// Thin fetch wrapper for gio-backend. Field names match the backend's
// snake_case JSON verbatim (no camelCase conversion) so the shapes in
// lib/api/types.ts can be copy-checked against the FastAPI schemas directly.

import Router from "next/router";
import { store, type RootState } from "@/store/store";
import { clearCredentials, setTokens } from "@/store/authSlice";
import type { TokenResponse } from "./types";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8010/api/v1";

export class ApiError extends Error {
  status: number;
  constructor(status: number, detail: string) {
    super(detail);
    this.status = status;
  }
}

interface RequestOptions {
  token?: string | null;
  params?: Record<string, string | number | undefined>;
}

// Paths that must never trigger a refresh attempt on their own 401 — trying
// to "refresh" a failed /auth/refresh call would recurse forever, and a
// failed login/register is a credentials problem, not an expired session.
const NO_REFRESH_PATHS = new Set(["/auth/login", "/auth/register", "/auth/refresh"]);

// Several requests can 401 at once (e.g. a page's Promise.all after the
// access token expires) — de-duped so they trigger one /auth/refresh call,
// not one per failed request.
let refreshInFlight: Promise<TokenResponse> | null = null;

async function refreshTokens(refreshToken: string): Promise<TokenResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  if (!res.ok) throw new ApiError(res.status, "Session expired");
  return (await res.json()) as TokenResponse;
}

function logOutAndRedirect() {
  store.dispatch(clearCredentials());
  Router.push("/auth/login");
}

async function request<T>(
  method: string,
  path: string,
  body: unknown,
  options: RequestOptions = {},
  isRetry = false
): Promise<T> {
  const url = new URL(`${API_BASE_URL}${path}`);
  if (options.params) {
    for (const [key, value] of Object.entries(options.params)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (options.token) headers.Authorization = `Bearer ${options.token}`;

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let detail = res.statusText || `Request failed with ${res.status}`;
    try {
      const data = await res.json();
      if (typeof data?.detail === "string") detail = data.detail;
    } catch {
      // body wasn't JSON — fall back to statusText
    }

    if (res.status === 401 && !isRetry && !NO_REFRESH_PATHS.has(path)) {
      const refreshToken = (store.getState() as RootState).auth.refreshToken;
      if (refreshToken) {
        try {
          refreshInFlight ??= refreshTokens(refreshToken).finally(() => {
            refreshInFlight = null;
          });
          const tokens = await refreshInFlight;
          store.dispatch(setTokens({ token: tokens.access_token, refreshToken: tokens.refresh_token }));
          return request<T>(method, path, body, { ...options, token: tokens.access_token }, true);
        } catch {
          // refresh token itself is invalid/expired — fall through to logout
        }
      }
      logOutAndRedirect();
      // The session is gone and the app is already navigating to
      // /auth/login — no caller has ever handled a 401 specially (that was
      // the original bug), so rejecting here would just surface the same
      // crash a moment after the redirect already fixed it. A promise that
      // never settles is a deliberate no-op: the component making this call
      // is about to unmount anyway.
      return new Promise<T>(() => {});
    }

    throw new ApiError(res.status, detail);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) => request<T>("GET", path, undefined, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>("POST", path, body, options),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>("PATCH", path, body, options),
};
