import { useState, type FormEvent } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { useAuthGuard } from "@/lib/useAuthGuard";
import { useLanguage } from "@/lib/useLanguage";
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
import GioLinkSection from "@/components/profile/GioLinkSection";

export default function ProfilePage() {
  const { settled, token, user } = useAuthGuard();
  const { t } = useTranslation("profile");
  const { language, setLanguage } = useLanguage();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [displayName, setDisplayName] = useState(user?.display_name ?? "");
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
    const updated = await updateMe(token, { display_name: displayName });
    dispatch(setUser(updated));
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  async function onChangePassword(e: FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    if (newPassword.length < 6) {
      setPasswordError(t("password.tooShort"));
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(t("password.mismatch"));
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
      setPasswordError(err instanceof ApiError ? err.message : t("password.genericError"));
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
      <Head><title>{t("title")} — Auren</title></Head>
      <AppShell title={t("title")}>
        <div className="mx-auto flex max-w-lg flex-col gap-5">
          <Card className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-foreground">
              {user.display_name[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-display text-lg font-semibold text-foreground">{user.display_name}</p>
              <p className="text-sm text-foreground-muted">{user.phone_number}</p>
            </div>
          </Card>

          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-foreground">{t("linkage.title")}</h2>
              <Chip tone="success">{t("linkage.linked")}</Chip>
            </div>
            <p className="text-sm text-foreground-muted">
              {t("linkage.body")}
            </p>
            <p className="mt-2 font-mono text-xs text-foreground-muted">{t("linkage.gid", { gid: user.gid })}</p>
          </Card>

          <GioLinkSection token={token} />

          <Card>
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              <h2 className="font-display text-lg font-semibold text-foreground">{t("details.title")}</h2>
              <TextField
                label={t("details.displayName")}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
              <SelectField
                label={t("details.preferredLanguage")}
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
              >
                <option value="en">English</option>
                <option value="zh">中文 (Mandarin)</option>
              </SelectField>
              <Button type="submit">{saved ? t("details.saved") : t("details.save")}</Button>
            </form>
          </Card>

          <Card>
            <form onSubmit={onChangePassword} className="flex flex-col gap-4">
              <h2 className="font-display text-lg font-semibold text-foreground">{t("password.title")}</h2>
              <TextField
                label={t("password.newPassword")}
                type="password"
                autoComplete="new-password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <TextField
                label={t("password.confirmPassword")}
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={confirmPassword.length > 0 && confirmPassword !== newPassword ? t("password.mismatch") : undefined}
              />
              {passwordError ? <p className="text-sm font-medium text-danger">{passwordError}</p> : null}
              <Button type="submit" disabled={passwordSaving || !newPassword || !confirmPassword}>
                {passwordSaving ? t("password.updating") : passwordSaved ? t("password.updated") : t("password.update")}
              </Button>
            </form>
          </Card>

          <Card>
            <h2 className="mb-1 font-display text-lg font-semibold text-foreground">{t("privacy.title")}</h2>
            <p className="text-sm text-foreground-muted">
              {t("privacy.body")}
            </p>
          </Card>

          <Button variant="outline" onClick={logout}>{t("logout")}</Button>
        </div>
      </AppShell>
    </>
  );
}
