// Gio<->Auren account linking — Flow A (this app initiates a link to an
// existing Gio/bracelet-website account). Mirrors bracelet-website's
// services/AurenLinkServices.ts exactly, direction reversed. See
// AUREN_GIO_ACCOUNT_LINKING_PLAN.md.
//
// check-phone/authenticate go straight to braceletBackend (plain fetch —
// this app has no session there, so client.ts's gio-backend-specific
// refresh-on-401 logic doesn't apply). issue-assertion/confirm go through
// the existing `api` wrapper, since those ARE calls to gio-backend and
// benefit from its token-refresh handling.
import { api, ApiError } from "./client";

const BRACELET_BACKEND_API_BASE_URL =
  process.env.NEXT_PUBLIC_BRACELET_BACKEND_API_BASE_URL ?? "http://localhost:8000/api/v1";

export interface CheckGioPhoneResponse {
  exists: boolean;
}

export interface AuthenticateGioResponse {
  verify_gio_token: string;
  display_name: string;
}

export interface IssueAurenAssertionResponse {
  verify_auren_token: string;
}

export interface ConfirmLinkResponse {
  linked: boolean;
}

export interface GioLinkStatusResponse {
  linked: boolean;
  bracelet_user_id?: string | null;
}

async function braceletFetch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BRACELET_BACKEND_API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let detail = res.statusText || `Request failed with ${res.status}`;
    try {
      const data = await res.json();
      if (typeof data?.detail === "string") detail = data.detail;
    } catch {
      // body wasn't JSON — fall back to statusText
    }
    throw new ApiError(res.status, detail);
  }
  return (await res.json()) as T;
}

// Step 1 — existence check only, no password yet.
export function checkGioPhone(phone_no: string) {
  return braceletFetch<CheckGioPhoneResponse>("/account-link/check-phone", { phone_no });
}

// Step 2 — validates the Gio password against braceletBackend directly.
// Never issues a Gio session token, only a short-lived verify_gio_token
// scoped to this linking flow.
export function authenticateGio(phone_no: string, password: string) {
  return braceletFetch<AuthenticateGioResponse>("/account-link/authenticate", {
    phone_no,
    password,
  });
}

// Step 3a — this app already has an Auren session, so gio-backend can
// assert this user's identity without asking for the Auren password again.
export function issueAurenAssertion(token: string) {
  return api.post<IssueAurenAssertionResponse>("/account-link/issue-assertion", {}, { token });
}

// Step 3b — writes the link on the Auren side. Takes no session itself —
// both ids come from the two signed tokens.
export function confirmAurenSide(verify_gio_token: string, verify_auren_token: string) {
  return api.post<ConfirmLinkResponse>("/account-link/confirm", {
    verify_gio_token,
    verify_auren_token,
  });
}

// Step 3c — writes the link on the Gio side, directly against
// braceletBackend. Also takes no session — same token-trust design.
export function confirmGioSide(verify_gio_token: string, verify_auren_token: string) {
  return braceletFetch<ConfirmLinkResponse>("/account-link/confirm", {
    verify_gio_token,
    verify_auren_token,
  });
}

export function getGioLinkStatus(token: string) {
  return api.get<GioLinkStatusResponse>("/account-link/status", { token });
}

// --- Cross-platform authenticated navigation ---------------------------
// Auren -> Gio: this app mints a handoff token (proof of the current
// Auren session), bracelet-website trades it for a real Gio session. See
// AUREN_GIO_ACCOUNT_LINKING_PLAN.md's cross-platform handoff section.

export interface HandoffResponse {
  sso_token: string;
}

export function requestGioHandoff(token: string) {
  return api.post<HandoffResponse>("/account-link/handoff", {}, { token });
}

// Gio -> Auren: the landing page at /auth/sso calls this with the token
// bracelet-website's handoff minted. Public — no session, the token itself
// is the proof. Returns a real Auren access/refresh token pair, same shape
// as a normal login.
export interface SsoExchangeResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export function exchangeSsoToken(sso_token: string) {
  return api.post<SsoExchangeResponse>("/account-link/sso-exchange", { sso_token });
}
