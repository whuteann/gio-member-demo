import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/lib/i18n";
import { detectInitialLanguage } from "@/lib/useLanguage";
import type { Language } from "@/lib/types";
import { AppStateProvider } from "@/context/AppStateContext";
import ReduxProvider from "@/store/ReduxProvider";
import { useAppSelector } from "@/store/hooks";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

// The single place i18n.language gets set from anything other than the
// widget itself (lib/useLanguage.ts::setLanguage) — see
// docs/behaviour_log_0001.md. Runs on every mount (pre-login: a saved
// local choice or the browser's own language) and again whenever the
// authenticated user's own preference becomes known or changes (e.g.
// right after login), so the two never disagree.
function LanguageSync() {
  const preferredLanguage = useAppSelector((s) => s.auth.user?.preferred_language);

  useEffect(() => {
    const target: Language = (preferredLanguage as Language) || detectInitialLanguage();
    if (i18n.language !== target) i18n.changeLanguage(target);
    document.documentElement.lang = target;
  }, [preferredLanguage]);

  return null;
}

// Registers public/sw.js — a no-op passthrough worker that exists purely so
// Chrome counts this page as installable (see components/ui/InstallPrompt.tsx).
// Guarded by the feature check since Safari < 11.1 and some embedded
// webviews don't expose navigator.serviceWorker at all.
function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Best-effort — losing the install-prompt capability on failure is
        // fine, nothing else in the app depends on this worker existing.
      });
    }
  }, []);

  return null;
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={`${fraunces.variable} ${jakarta.variable} font-sans`}>
      <ReduxProvider>
        <I18nextProvider i18n={i18n}>
          <LanguageSync />
          <ServiceWorkerRegister />
          <AppStateProvider>
            <Component {...pageProps} />
          </AppStateProvider>
        </I18nextProvider>
      </ReduxProvider>
    </div>
  );
}
