import { api } from "./client";
import type { MeResponse, TokenResponse } from "./types";

export function register(params: { email: string; password: string; display_name: string; language: string }) {
  return api.post<TokenResponse>("/auth/register", params);
}

export function login(params: { email: string; password: string }) {
  return api.post<TokenResponse>("/auth/login", params);
}

export function refreshAccessToken(refreshToken: string) {
  return api.post<TokenResponse>("/auth/refresh", { refresh_token: refreshToken });
}

export function getMe(token: string) {
  return api.get<MeResponse>("/me", { token });
}

export function updateMe(token: string, params: { display_name?: string; preferred_language?: string; timezone?: string }) {
  return api.patch<MeResponse["user"]>("/me", params, { token });
}

export function changePassword(token: string, newPassword: string) {
  return api.patch<void>("/me/password", { new_password: newPassword }, { token });
}
