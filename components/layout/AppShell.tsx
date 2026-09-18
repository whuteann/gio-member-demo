import Link from "next/link";
import { useRouter } from "next/router";
import { useState, type ReactNode } from "react";
import { useAppState } from "@/context/AppStateContext";
import Sheet from "@/components/ui/Sheet";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";

const TABS = [
  { href: "/dashboard", label: "Home", icon: "🏠" },
  { href: "/check-in", label: "Check-In", icon: "💬" },
  { href: "/inner-reading", label: "Reading", icon: "🔮" },
  { href: "/colour-psychology", label: "For You", icon: "✨" },
  { href: "/progress", label: "Progress", icon: "🌿" },
];

const MENU_LINKS = [
  { href: "/profile", label: "Profile", icon: "🧑" },
  { href: "/membership", label: "Membership", icon: "💳" },
  { href: "/core-personality", label: "Core Personality", icon: "🧭" },
  { href: "/journal", label: "Journal", icon: "📓" },
  { href: "/colour-psychology", label: "Colour Psychology", icon: "💧" },
  // { href: "/rewards", label: "Rewards", icon: "🎁" },
  { href: "/check-in/history", label: "Check-In History", icon: "📜" },
  { href: "/inner-reading/history", label: "Reading History", icon: "📖" },
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname.startsWith(href);
}

export default function AppShell({ children, title }: { children: ReactNode; title?: string }) {
  const router = useRouter();
  const { user, isPremiumActive, logout } = useAppState();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background lg:flex lg:h-screen lg:overflow-hidden">
      {/* Desktop sidebar — stays put at viewport height while <main> scrolls
          independently below; its own content is short enough it never
          needs a scrollbar of its own. */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface px-5 py-6 lg:flex lg:h-screen lg:overflow-y-auto">
        <Link href="/dashboard" className="mb-8 flex items-center gap-2 px-1">
          <span className="text-2xl" aria-hidden>🌿</span>
          <span className="font-display text-xl font-semibold text-primary">Gio</span>
        </Link>
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
              {tab.label}
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
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mt-4 flex items-center justify-between rounded-xl bg-surface-muted px-3 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{user?.displayName}</p>
            <p className="truncate text-xs text-foreground-muted">{user?.email}</p>
          </div>
          <Chip tone={isPremiumActive ? "gold" : "neutral"}>{isPremiumActive ? "Premium" : "Free"}</Chip>
        </div>
        <button
          onClick={logout}
          className="mt-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-foreground-muted hover:bg-surface-muted"
        >
          Log out
        </button>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col lg:h-screen lg:min-h-0">
        {/* Mobile top bar */}
        <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-3.5 lg:hidden">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xl" aria-hidden>🌿</span>
            <span className="font-display text-lg font-semibold text-primary">Gio</span>
          </Link>
          <div className="flex items-center gap-2">
            <Chip tone={isPremiumActive ? "gold" : "neutral"}>{isPremiumActive ? "Premium" : "Free"}</Chip>
            <button
              onClick={() => setMenuOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-muted text-sm font-semibold text-foreground"
              aria-label="Open menu"
            >
              {user?.displayName?.[0]?.toUpperCase() ?? "G"}
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
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>

      <Sheet open={menuOpen} onClose={() => setMenuOpen(false)} title={user?.displayName}>
        <div className="flex flex-col gap-1">
          {MENU_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-foreground hover:bg-surface-muted"
            >
              <span aria-hidden>{link.icon}</span>
              {link.label}
            </Link>
          ))}
          <div className="my-2 h-px bg-border" />
          <Button variant="outline" onClick={logout}>
            Log out
          </Button>
        </div>
      </Sheet>
    </div>
  );
}
