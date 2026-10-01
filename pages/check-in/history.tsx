import Head from "next/head";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useAuthGuard } from "@/lib/useAuthGuard";
import { useApiResource } from "@/lib/useApiResource";
import { useLanguage } from "@/lib/useLanguage";
import { isPremiumActive } from "@/lib/api/entitlement";
import { listCheckIns } from "@/lib/api/reflections";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";
import EntitlementGate from "@/components/ui/EntitlementGate";

const DIMS = ["emotional_energy", "mental_clarity", "inner_pressure", "grounding"] as const;

export default function CheckInHistoryPage() {
  const { settled, token, subscription } = useAuthGuard();
  const { t } = useTranslation("checkIn");
  const { language } = useLanguage();
  const dateLocale = language === "zh" ? "zh-CN" : "en-US";
  const premium = subscription ? isPremiumActive(subscription) : false;

  const { data: sessions, loading } = useApiResource(token ? () => listCheckIns(token) : null, [token]);

  if (!settled || !token) return null;
  if (loading || !sessions) {
    return (
      <AppShell title={t("history.title")}>
        <p className="text-sm text-foreground-muted">{t("history.loading")}</p>
      </AppShell>
    );
  }

  return (
    <>
      <Head><title>{t("history.title")} — Gio</title></Head>
      <AppShell title={t("history.title")}>
        <div className="flex flex-col gap-3">
          <Link href="/check-in/session" className="self-start">
            <Chip tone="primary">{t("history.newCheckIn")}</Chip>
          </Link>
          {sessions.length === 0 ? (
            <Card><p className="text-sm text-foreground-muted">{t("history.empty")}</p></Card>
          ) : (
            sessions.map((session) => (
              <Link key={session.id} href={`/check-in/${session.id}/result`}>
                <Card className="flex items-center gap-3 transition-opacity hover:opacity-80">
                  <div className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-surface-muted text-lg" aria-hidden>
                    {session.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {(language === "zh" ? session.title_zh : session.title) ?? session.title ?? (session.completed_at ? new Date(session.completed_at).toLocaleDateString(dateLocale, { weekday: "short", month: "short", day: "numeric" }) : "—")}
                      </p>
                      {session.category ? <Chip tone="neutral">{session.category}</Chip> : null}
                    </div>
                    <p className="truncate text-xs text-foreground-muted">{(language === "zh" ? session.subtitle_zh : session.subtitle) ?? session.subtitle ?? session.summary ?? t("history.questions", { count: session.answers.length })}</p>
                  </div>
                  <div className="flex flex-none items-center gap-2">
                    <div className="hidden gap-1 sm:flex">
                      {DIMS.map((d) => {
                        const q = session.answers.find((x) => x.dimension === d);
                        return q ? (
                          <span key={d} className="rounded-full bg-surface-muted px-2 py-1 text-[10px] font-semibold text-foreground-muted">
                            {q.normalized_value}
                          </span>
                        ) : null;
                      })}
                    </div>
                    <span aria-hidden="true" className="text-foreground-muted">&rsaquo;</span>
                  </div>
                </Card>
              </Link>
            ))
          )}
          {!premium ? (
            <EntitlementGate
              title={t("history.premiumTitle")}
              description={t("history.premiumBody")}
            />
          ) : null}
        </div>
      </AppShell>
    </>
  );
}
