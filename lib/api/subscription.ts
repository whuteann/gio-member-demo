import { api } from "./client";
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
