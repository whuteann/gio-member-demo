import Head from "next/head";
import { useState, type ComponentPropsWithoutRef } from "react";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAuthGuard } from "@/lib/useAuthGuard";
import { useApiResource } from "@/lib/useApiResource";
import { useLanguage } from "@/lib/useLanguage";
import { createJournalEntry, getJournalInsights, listJournalEntries } from "@/lib/api/journal";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import StatTile from "@/components/ui/StatTile";

// Hand-styled instead of pulling in @tailwindcss/typography for one spot —
// just the handful of tags a journal entry will actually use. No
// rehype-raw plugin, so raw HTML in an entry's own text is never rendered
// as HTML (react-markdown escapes it by default).
const MARKDOWN_COMPONENTS = {
  p: (props: ComponentPropsWithoutRef<"p">) => <p className="mb-2 last:mb-0" {...props} />,
  strong: (props: ComponentPropsWithoutRef<"strong">) => <strong className="font-semibold text-foreground" {...props} />,
  em: (props: ComponentPropsWithoutRef<"em">) => <em className="italic" {...props} />,
  a: (props: ComponentPropsWithoutRef<"a">) => <a className="font-medium text-primary underline" target="_blank" rel="noreferrer" {...props} />,
  h1: (props: ComponentPropsWithoutRef<"h1">) => <h1 className="mb-1.5 mt-2 font-display text-base font-semibold text-foreground first:mt-0" {...props} />,
  h2: (props: ComponentPropsWithoutRef<"h2">) => <h2 className="mb-1.5 mt-2 font-display text-sm font-semibold text-foreground first:mt-0" {...props} />,
  h3: (props: ComponentPropsWithoutRef<"h3">) => <h3 className="mb-1 mt-2 text-sm font-semibold text-foreground first:mt-0" {...props} />,
  ul: (props: ComponentPropsWithoutRef<"ul">) => <ul className="mb-2 ml-4 list-disc space-y-0.5 last:mb-0" {...props} />,
  ol: (props: ComponentPropsWithoutRef<"ol">) => <ol className="mb-2 ml-4 list-decimal space-y-0.5 last:mb-0" {...props} />,
  li: (props: ComponentPropsWithoutRef<"li">) => <li {...props} />,
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote className="mb-2 border-l-2 border-border pl-3 italic text-foreground-muted last:mb-0" {...props} />
  ),
  code: (props: ComponentPropsWithoutRef<"code">) => (
    <code className="rounded bg-surface-muted px-1 py-0.5 text-[0.85em]" {...props} />
  ),
};

export default function JournalPage() {
  const { settled, token } = useAuthGuard();
  const { t } = useTranslation("journal");
  const { language } = useLanguage();
  const dateLocale = language === "zh" ? "zh-CN" : "en-US";
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  const { data, loading, refetch } = useApiResource(
    token
      ? async () => {
          const [entries, insights] = await Promise.all([listJournalEntries(token), getJournalInsights(token)]);
          return { entries, insights };
        }
      : null,
    [token]
  );

  if (!settled || !token) return null;
  if (loading || !data) {
    return (
      <AppShell title={t("title")}>
        <p className="text-sm text-foreground-muted">{t("loading")}</p>
      </AppShell>
    );
  }

  const { entries, insights } = data;
  const moodLabel = (mood: string) => t(`moods.${mood}`, { defaultValue: mood });
  const themeLabel = (theme: string) => t(`themes.${theme}`, { defaultValue: theme });

  async function save() {
    if (!token || !draft.trim() || saving) return;
    setSaving(true);
    try {
      await createJournalEntry(token, draft.trim());
      setDraft("");
      await refetch();
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Head><title>{t("title")} — Auren</title></Head>
      <AppShell title={t("title")}>
        <div className="grid gap-5 lg:grid-cols-3">
          <Card className="flex flex-col gap-3 lg:col-span-2">
            <h2 className="font-display text-lg font-semibold text-foreground">{t("today.title")}</h2>
            <p className="text-sm text-foreground-muted">{t("today.subtitle")}</p>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={t("today.placeholder")}
              rows={6}
              className="w-full resize-none rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-primary focus:outline-none"
            />
            <div className="flex justify-end">
              <Button disabled={!draft.trim()} loading={saving} onClick={save}>
                {saving ? t("today.saving") : t("today.save")}
              </Button>
            </div>
          </Card>

          <div className="grid grid-cols-3 gap-3 lg:col-span-1 lg:grid-cols-1">
            <StatTile icon={<span aria-hidden>📝</span>} label={t("stats.entries")} value={insights.entries_this_week} hint={
              insights.entries_delta === 0
                ? t("stats.sameAsLastWeek")
                : t("stats.deltaFromLastWeek", { sign: insights.entries_delta > 0 ? "↑" : "↓", count: Math.abs(insights.entries_delta) })
            } />
            <StatTile icon={<span aria-hidden>🙂</span>} label={t("stats.topMood")} value={insights.top_mood ? moodLabel(insights.top_mood) : "—"} />
            <StatTile icon={<span aria-hidden>🌱</span>} label={t("stats.topTheme")} value={insights.top_theme ? themeLabel(insights.top_theme) : "—"} />
          </div>

          <Card className="flex flex-col gap-3 lg:col-span-3">
            <h2 className="font-display text-lg font-semibold text-foreground">{t("entries.title")}</h2>
            {entries.length === 0 ? (
              <p className="text-sm text-foreground-muted">{t("entries.empty")}</p>
            ) : (
              <div className="flex flex-col divide-y divide-border">
                {entries.map((entry) => (
                  <div key={entry.id} className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Chip tone="primary">{moodLabel(entry.mood)}</Chip>
                        <Chip tone="neutral">{themeLabel(entry.theme)}</Chip>
                      </div>
                      <p className="text-xs text-foreground-muted">
                        {new Date(entry.created_at).toLocaleString(dateLocale, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="text-sm text-foreground-muted">
                      <ReactMarkdown remarkPlugins={[remarkGfm]} components={MARKDOWN_COMPONENTS}>
                        {entry.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </AppShell>
    </>
  );
}
