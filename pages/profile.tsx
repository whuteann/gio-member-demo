import { useState, type FormEvent } from "react";
import Head from "next/head";
import { useAppGuard } from "@/lib/useAppGuard";
import { useAppState } from "@/context/AppStateContext";
import type { Language } from "@/lib/types";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import TextField from "@/components/ui/TextField";
import SelectField from "@/components/ui/SelectField";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";

export default function ProfilePage() {
  const { settled, user } = useAppGuard();
  const { updateProfile, logout } = useAppState();
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [language, setLanguage] = useState<Language>(user?.preferredLanguage ?? "en");
  const [saved, setSaved] = useState(false);

  if (!settled || !user) return null;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    updateProfile({ displayName, preferredLanguage: language });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  return (
    <>
      <Head><title>Profile — Gio</title></Head>
      <AppShell title="Profile">
        <div className="mx-auto flex max-w-lg flex-col gap-5">
          <Card className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-foreground">
              {user.displayName[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-display text-lg font-semibold text-foreground">{user.displayName}</p>
              <p className="text-sm text-foreground-muted">{user.email}</p>
            </div>
          </Card>

          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-foreground">Gio linkage</h2>
              <Chip tone="success">Linked</Chip>
            </div>
            <p className="text-sm text-foreground-muted">
              Your local Gio Member account is linked to your GioByQuartzic identity.
            </p>
            <p className="mt-2 font-mono text-xs text-foreground-muted">GID: {user.gid}</p>
          </Card>

          <Card>
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              <h2 className="font-display text-lg font-semibold text-foreground">Details</h2>
              <TextField
                label="Display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
              <SelectField
                label="Preferred language"
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
              >
                <option value="en">English</option>
                <option value="zh">中文 (Mandarin)</option>
              </SelectField>
              <TextField label="Timezone" value={user.timezone} disabled readOnly />
              <Button type="submit">{saved ? "Saved ✓" : "Save changes"}</Button>
            </form>
          </Card>

          <Card>
            <h2 className="mb-1 font-display text-lg font-semibold text-foreground">Privacy</h2>
            <p className="text-sm text-foreground-muted">
              Private check-in notes are always stored separately and excluded from AI context and
              recommendations — this cannot be changed.
            </p>
          </Card>

          <Button variant="outline" onClick={logout}>Log out</Button>
        </div>
      </AppShell>
    </>
  );
}
