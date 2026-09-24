import { useState, type FormEvent } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useAuthGuard } from "@/lib/useAuthGuard";
import { useAppDispatch } from "@/store/hooks";
import { clearCredentials, setUser } from "@/store/authSlice";
import { changePassword, updateMe } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import type { Language } from "@/lib/types";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import TextField from "@/components/ui/TextField";
import SelectField from "@/components/ui/SelectField";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";

export default function ProfilePage() {
  const { settled, token, user } = useAuthGuard();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [displayName, setDisplayName] = useState(user?.display_name ?? "");
  const [language, setLanguage] = useState<Language>((user?.preferred_language as Language) ?? "en");
  const [saved, setSaved] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);

  if (!settled || !token || !user) return null;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    const updated = await updateMe(token, { display_name: displayName, preferred_language: language });
    dispatch(setUser(updated));
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  async function onChangePassword(e: FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords don't match.");
      return;
    }
    if (!token) return;
    setPasswordSaving(true);
    try {
      await changePassword(token, newPassword);
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSaved(true);
      setTimeout(() => setPasswordSaved(false), 1800);
    } catch (err) {
      setPasswordError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setPasswordSaving(false);
    }
  }

  function logout() {
    dispatch(clearCredentials());
    router.push("/auth/login");
  }

  return (
    <>
      <Head><title>Profile — Gio</title></Head>
      <AppShell title="Profile">
        <div className="mx-auto flex max-w-lg flex-col gap-5">
          <Card className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-foreground">
              {user.display_name[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-display text-lg font-semibold text-foreground">{user.display_name}</p>
              <p className="text-sm text-foreground-muted">{user.email}</p>
            </div>
          </Card>

          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-foreground">Gio linkage</h2>
              <Chip tone="success">Linked</Chip>
            </div>
            <p className="text-sm text-foreground-muted">
              Your Gio Member account is linked to your GioByQuartzic identity.
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
            <form onSubmit={onChangePassword} className="flex flex-col gap-4">
              <h2 className="font-display text-lg font-semibold text-foreground">Change password</h2>
              <TextField
                label="New password"
                type="password"
                autoComplete="new-password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <TextField
                label="Confirm new password"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={confirmPassword.length > 0 && confirmPassword !== newPassword ? "Passwords don't match." : undefined}
              />
              {passwordError ? <p className="text-sm font-medium text-danger">{passwordError}</p> : null}
              <Button type="submit" disabled={passwordSaving || !newPassword || !confirmPassword}>
                {passwordSaving ? "Updating…" : passwordSaved ? "Updated ✓" : "Update password"}
              </Button>
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
