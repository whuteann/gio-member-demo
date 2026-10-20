import { api } from "./client";
import type { MeResponse, TokenResponse } from "./types";

export function register(params: { phone_number: string; password: string; display_name: string; language: string; email: string }) {
  return api.post<TokenResponse>("/auth/register", params);
}

export function login(params: { phone_number: string; password: string }) {
  return api.post<TokenResponse>("/auth/login", params);
}

export function refreshAccessToken(refreshToken: string) {
  return api.post<TokenResponse>("/auth/refresh", { refresh_token: refreshToken });
}

export function getMe(token: string) {
  return api.get<MeResponse>("/me", { token });
}

export function updateMe(token: string, params: { display_name?: string; preferred_language?: string; timezone?: string; email?: string }) {
  return api.patch<MeResponse["user"]>("/me", params, { token });
}

export function changePassword(token: string, newPassword: string) {
  return api.patch<void>("/me/password", { new_password: newPassword }, { token });
}

// --- Forgot-password flow (see PASSWORD_RESET_PLAN.md) --------------------
// The emailed code is the only credential; there is no reset token. Keep it
// in component state for the life of the flow — never localStorage.

/** Always resolves 200 with the same message, whether or not an account
 *  exists for the address. Never branch on the response to tell the user
 *  anything about the account. */
export function forgotPassword(params: { email: string }) {
  return api.post<{ detail: string }>("/auth/forgot-password", params);
}

/** Throws ApiError(400) for a wrong, expired or already-used code — all
 *  indistinguishable, by design. */
export function verifyResetOtp(params: { email: string; otp: string }) {
  return api.post<{ valid: boolean }>("/auth/verify-reset-otp", params);
}

export function resetPassword(params: { email: string; otp: string; new_password: string }) {
  return api.post<void>("/auth/reset-password", params);
}
