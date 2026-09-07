import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAppState } from "@/context/AppStateContext";

/**
 * Redirects to /auth/login when there's no session, and to /onboarding when
 * the session exists but onboarding hasn't been completed yet. Pages should
 * treat `settled === false` as "still deciding where to send the user".
 */
export function useAppGuard(options?: { requireOnboarding?: boolean }) {
  const requireOnboarding = options?.requireOnboarding ?? true;
  const { ready, user, data } = useAppState();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/auth/login");
      return;
    }
    if (requireOnboarding && !user.onboardingCompletedAt && router.pathname !== "/onboarding") {
      router.replace("/onboarding");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, user?.id, user?.onboardingCompletedAt]);

  const settled = ready && !!user && (!requireOnboarding || !!user.onboardingCompletedAt);

  return { settled, user, data };
}
