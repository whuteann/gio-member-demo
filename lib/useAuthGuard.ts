import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAppSelector } from "@/store/hooks";

/**
 * The route guard. Reads the real backend session from Redux.
 *
 * There used to be a second one (lib/useAppGuard.ts) reading a parallel
 * localStorage "mock" session for pages not yet wired to gio-backend —
 * docs/dev_log_0001.md describes that split. Both it and the store behind
 * it are gone; this is the only guard now.
 */
export function useAuthGuard(options?: { requireOnboarding?: boolean }) {
  const requireOnboarding = options?.requireOnboarding ?? true;
  const router = useRouter();
  const token = useAppSelector((s) => s.auth.token);
  const user = useAppSelector((s) => s.auth.user);
  const subscription = useAppSelector((s) => s.auth.subscription);

  useEffect(() => {
    if (!token) {
      router.replace("/auth/login");
      return;
    }
    if (requireOnboarding && user && !user.onboarding_completed_at && router.pathname !== "/onboarding") {
      router.replace("/onboarding");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user?.onboarding_completed_at, requireOnboarding]);

  const settled = !!token && (!requireOnboarding || !!user?.onboarding_completed_at);
  return { settled, token, user, subscription };
}
