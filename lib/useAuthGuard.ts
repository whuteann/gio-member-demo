import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAppSelector } from "@/store/hooks";

/**
 * Route guard for backend-wired pages — parallels lib/useAppGuard.ts (the
 * original mock/local-session guard, still used by pages that aren't wired
 * to gio-backend yet) but reads the real session from Redux instead of the
 * localStorage mock. See docs/dev_log_0001.md for which pages use which.
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
