import Link from "next/link";
import { useRouter } from "next/router";
import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useAppState } from "@/context/AppStateContext";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearCredentials } from "@/store/authSlice";
import { useLanguage } from "@/lib/useLanguage";
import { isPremiumActive as isRealPremiumActive } from "@/lib/api/entitlement";
import Sheet from "@/components/ui/Sheet";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";

// A subtle text-only toggle — moved here from a dedicated dashboard card
// per product feedback ("more subtle design in the header"). Visible on
// every page via AppShell instead of just /dashboard.
function LanguageToggle({ className = "" }: { className?: string }) {
  const { language, setLanguage } = useLanguage();
  return (
    <button
      type="button"
      onClick={() => setLanguage(language === "en" ? "zh" : "en")}
      className={`rounded-full px-2.5 py-1 text-xs font-semibold text-foreground-muted transition-colors hover:bg-surface-muted hover:text-foreground ${className}`}
    >
      {language === "en" ? "EN" : "中文"}
    </button>
  );
}

const TABS = [
  { href: "/dashboard", labelKey: "nav.home", icon: "🏠" },
  { href: "/check-in", labelKey: "nav.checkIn", icon: "💬" },
  { href: "/inner-reading", labelKey: "nav.reading", icon: "🔮" },
  { href: "/colour-psychology", labelKey: "nav.forYou", icon: "✨" },
  { href: "/progress", labelKey: "nav.progress", icon: "🌿" },
];

const MENU_LINKS = [
  { href: "/profile", labelKey: "nav.profile", icon: "🧑" },
  { href: "/membership", labelKey: "nav.membership", icon: "💳" },
  { href: "/core-personality", labelKey: "nav.corePersonality", icon: "🧭" },
  { href: "/journal", labelKey: "nav.journal", icon: "📓" },
  { href: "/colour-psychology", labelKey: "nav.colourPsychology", icon: "💧" },
  // { href: "/rewards", labelKey: "nav.rewards", icon: "🎁" },
  { href: "/check-in/history", labelKey: "nav.checkInHistory", icon: "📜" },
  { href: "/inner-reading/history", labelKey: "nav.readingHistory", icon: "📖" },
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname.startsWith(href);
}

export default function AppShell({ children, title }: { children: ReactNode; title?: string }) {
  const router = useRouter();
  const { t } = useTranslation("common");
  const mock = useAppState();
  const dispatch = useAppDispatch();
  const reduxToken = useAppSelector((s) => s.auth.token);
  const reduxUser = useAppSelector((s) => s.auth.user);
  const reduxSubscription = useAppSelector((s) => s.auth.subscription);
  const [menuOpen, setMenuOpen] = useState(false);

  // A real backend session (Redux) always wins over the old localStorage
  // mock — the two are independent logins (see docs/dev_log_0001.md), but
  // only one shell renders at a time, so pick whichever is actually active.
  const usingRealSession = !!reduxToken && !!reduxUser;
  const displayName = usingRealSession ? reduxUser!.display_name : mock.user?.displayName;
  const identity = usingRealSession ? reduxUser!.phone_number : mock.user?.email;
  const isPremiumActive = usingRealSession ? (reduxSubscription ? isRealPremiumActive(reduxSubscription) : false) : mock.isPremiumActive;
  const logout = usingRealSession
    ? () => {
        dispatch(clearCredentials());
        router.push("/auth/login");
      }
    : mock.logout;

  return (
    <div className="min-h-screen bg-background lg:flex lg:h-screen lg:overflow-hidden">
      {/* Desktop sidebar — stays put at viewport height while <main> scrolls
          independently below; its own content is short enough it never
          needs a scrollbar of its own. */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface px-5 py-6 lg:flex lg:h-screen lg:overflow-y-auto">
        <div className="mb-8 flex items-center justify-between px-1">
          <Link href="/dashboard" className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/auren-logo-horizontal.png" alt="Auren" className="h-7 w-auto" />
          </Link>
          <LanguageToggle />
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {TABS.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                isActive(router.pathname, tab.href)
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-surface-muted"
              }`}
            >
              <span aria-hidden>{tab.icon}</span>
              {t(tab.labelKey)}
            </Link>
          ))}
          <div className="my-3 h-px bg-border" />
          {MENU_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive(router.pathname, link.href)
                  ? "bg-surface-muted text-foreground"
                  : "text-foreground-muted hover:bg-surface-muted hover:text-foreground"
              }`}
            >
              <span aria-hidden>{link.icon}</span>
              {t(link.labelKey)}
            </Link>
          ))}
        </nav>
        <div className="mt-4 flex items-center justify-between rounded-xl bg-surface-muted px-3 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{displayName}</p>
            <p className="truncate text-xs text-foreground-muted">{identity}</p>
          </div>
          <Chip tone={isPremiumActive ? "gold" : "neutral"}>{isPremiumActive ? t("nav.premium") : t("nav.free")}</Chip>
        </div>
        <button
          onClick={logout}
          className="mt-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-foreground-muted hover:bg-surface-muted"
        >
          {t("nav.logout")}
        </button>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col lg:h-screen lg:min-h-0">
        {/* Mobile top bar */}
        <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-3.5 lg:hidden">
          <Link href="/dashboard" className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/auren-logo-horizontal.png" alt="Auren" className="h-6 w-auto" />
          </Link>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Chip tone={isPremiumActive ? "gold" : "neutral"}>{isPremiumActive ? t("nav.premium") : t("nav.free")}</Chip>
            <button
              onClick={() => setMenuOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-muted text-sm font-semibold text-foreground"
              aria-label={t("nav.openMenu")}
            >
              {displayName?.[0]?.toUpperCase() ?? "G"}
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 pb-28 pt-5 lg:min-h-0 lg:overflow-y-auto lg:px-10 lg:pb-10 lg:pt-8">
          {title ? <h1 className="mb-5 font-display text-2xl font-semibold text-foreground lg:text-3xl">{title}</h1> : null}
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>

        {/* Mobile bottom nav */}
        <nav className="fixed inset-x-0 bottom-0 z-30 flex items-stretch justify-around border-t border-border bg-surface/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
          {TABS.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold ${
                isActive(router.pathname, tab.href) ? "text-primary" : "text-foreground-muted"
              }`}
            >
              <span className="text-lg" aria-hidden>{tab.icon}</span>
              {t(tab.labelKey)}
            </Link>
          ))}
        </nav>
      </div>

      <Sheet open={menuOpen} onClose={() => setMenuOpen(false)} title={displayName}>
        <div className="flex flex-col gap-1">
          {MENU_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-foreground hover:bg-surface-muted"
            >
              <span aria-hidden>{link.icon}</span>
              {t(link.labelKey)}
            </Link>
          ))}
          <div className="my-2 h-px bg-border" />
          <Button variant="outline" onClick={logout}>
            {t("nav.logout")}
          </Button>
        </div>
      </Sheet>
    </div>
  );
}
