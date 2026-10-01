import { api, API_BASE_URL, ApiError } from "./client";
import type { ApiSubscription, CheckoutResponse, SubscriptionPaymentOut } from "./types";

export function getSubscription(token: string) {
  return api.get<ApiSubscription>("/subscription", { token });
}

export function checkoutSubscription(token: string, billingCycle: "MONTHLY" | "YEARLY") {
  return api.post<CheckoutResponse>("/subscription/checkout", { billing_cycle: billingCycle }, { token });
}

export function listSubscriptionPayments(token: string) {
  return api.get<SubscriptionPaymentOut[]>("/subscription/payments", { token });
}

export function cancelSubscription(token: string) {
  return api.post<ApiSubscription>("/subscription/cancel", undefined, { token });
}

export function reactivateSubscription(token: string) {
  return api.post<ApiSubscription>("/subscription/reactivate", undefined, { token });
}

export function startTrial(token: string) {
  return api.post<ApiSubscription>("/subscription/start-trial", undefined, { token });
}

// GET /subscription/payments/{id}/invoice returns a raw PDF, not JSON — it
// needs a real fetch() with an auth header, which api.get() can't do (it
// always calls res.json()). The tab is opened synchronously on the click
// that triggers this, before the await, so browsers don't treat it as a
// blocked popup; once the PDF blob is ready we just redirect that tab to it.
export async function openInvoicePdf(token: string, paymentId: string, tab: Window | null) {
  try {
    const res = await fetch(`${API_BASE_URL}/subscription/payments/${paymentId}/invoice`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new ApiError(res.status, "Failed to load invoice");
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    if (tab) tab.location.href = blobUrl;
  } catch (err) {
    tab?.close();
    throw err;
  }
}
