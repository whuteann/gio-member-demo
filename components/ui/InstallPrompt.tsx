import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

// Chrome/Edge/Android only — no such event exists in any other engine,
// and the standard DOM lib doesn't type it.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "auren-install-dismissed";

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari's own (non-standard) flag — not covered by the media query above.
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window);
}

/**
 * A dashboard widget that offers to put Auren on the user's home screen —
 * see docs note in gio-member-app for the platform split this is built on:
 * Chrome/Edge/Android can create the shortcut directly (beforeinstallprompt);
 * iOS Safari has no such API and only ever gets instructions.
 */
export default function InstallPrompt() {
  const { t } = useTranslation("dashboard");
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Temporary — remove once install behaves correctly across devices.
    console.log("[InstallPrompt] userAgent:", navigator.userAgent);
    console.log("[InstallPrompt] isStandalone:", isStandalone());
    console.log("[InstallPrompt] isIOS:", isIOS());
    console.log("[InstallPrompt] dismissedFlag:", localStorage.getItem(DISMISSED_KEY));

    if (isStandalone() || localStorage.getItem(DISMISSED_KEY)) {
      console.log("[InstallPrompt] bailing out — standalone or previously dismissed");
      return;
    }

    if (isIOS()) {
      console.log("[InstallPrompt] showing iOS instructions branch");
      // Deliberately set post-mount, not as a lazy useState initializer —
      // isIOS()/isStandalone() read browser-only globals that don't exist
      // during SSR, so the initial render must stay `false` on both server
      // and client to avoid a hydration mismatch; this is the one update
      // that flips it once we're safely past that first paint.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowIOSInstructions(true);
      return;
    }

    function onBeforeInstallPrompt(e: Event) {
      console.log("[InstallPrompt] beforeinstallprompt FIRED");
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }
    function onInstalled() {
      console.log("[InstallPrompt] appinstalled FIRED");
      setDeferredPrompt(null);
      localStorage.setItem(DISMISSED_KEY, "1");
    }

    console.log("[InstallPrompt] listening for beforeinstallprompt now");
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  function dismiss() {
    setDeferredPrompt(null);
    setShowIOSInstructions(false);
    localStorage.setItem(DISMISSED_KEY, "1");
  }

  async function install() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    // Suppress either way — a user who just said no shouldn't see this
    // again every time they open the dashboard.
    setDeferredPrompt(null);
    localStorage.setItem(DISMISSED_KEY, "1");
  }

  if (!deferredPrompt && !showIOSInstructions) return null;

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-primary px-4 py-3.5 text-primary-foreground sm:gap-4 lg:col-span-3">
      <span className="flex-none text-xl" aria-hidden>📲</span>
      <div className="min-w-0 flex-1">
        <p className="font-display text-sm font-semibold leading-snug sm:text-base">
          {t("installPrompt.title")}
        </p>
        <p className="truncate text-xs text-primary-foreground/70 sm:text-sm">
          {showIOSInstructions ? t("installPrompt.iosInstructions") : t("installPrompt.subtitle")}
        </p>
      </div>
      {deferredPrompt ? (
        <button
          onClick={install}
          className="flex-none rounded-full bg-gold px-4 py-2 text-sm font-semibold text-gold-foreground transition-opacity hover:opacity-90"
        >
          {t("installPrompt.add")}
        </button>
      ) : null}
      <button
        onClick={dismiss}
        aria-label={t("installPrompt.dismiss")}
        className="flex-none text-lg text-primary-foreground/60 hover:text-primary-foreground"
      >
        ✕
      </button>
    </div>
  );
}
