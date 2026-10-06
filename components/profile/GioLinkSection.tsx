import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Card from "@/components/ui/Card";
import TextField from "@/components/ui/TextField";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import {
  authenticateGio,
  checkGioPhone,
  confirmAurenSide,
  confirmGioSide,
  getGioLinkStatus,
  issueAurenAssertion,
  requestGioHandoff,
} from "@/lib/api/accountLink";

const BRACELET_WEBSITE_URL = process.env.NEXT_PUBLIC_BRACELET_WEBSITE_URL ?? "http://localhost:3000";

type Step = "loading" | "statusError" | "linked" | "phone" | "password" | "confirm";

interface GioLinkSectionProps {
  token: string;
}

export default function GioLinkSection({ token }: GioLinkSectionProps) {
  const { t } = useTranslation("profile");

  const [step, setStep] = useState<Step>("loading");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [preview, setPreview] = useState<{ display_name: string } | null>(null);
  const [verifyGioToken, setVerifyGioToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function loadStatus() {
    setStep("loading");
    getGioLinkStatus(token)
      .then((res) => setStep(res.linked ? "linked" : "phone"))
      .catch((err) => {
        // Deliberately NOT defaulting to "not linked" here — a failed
        // status check (wrong backend URL, network error, CORS, 500...)
        // must never be indistinguishable from a genuine "not linked"
        // answer, or a linked user could be shown the linking wizard
        // again because of an infra problem, not their actual status.
        console.error("Failed to check Gio link status:", err);
        setStep("statusError");
      });
  }

  useEffect(() => {
    loadStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleCheckPhone() {
    setError(null);
    setSubmitting(true);
    try {
      const res = await checkGioPhone(phone);
      if (!res.exists) {
        setError(t("gioLink.notFound"));
      } else {
        setStep("password");
      }
    } catch (err) {
      // Generic on purpose — the underlying error's own message text can
      // look exactly like a plausible in-flow answer (e.g. a misconfigured
      // URL hitting an unrelated server's generic 404 body reads just like
      // "not found"), which is actively misleading rather than merely
      // unhelpful. Real detail goes to the console, not the user.
      console.error("check-phone request failed:", err);
      setError(t("gioLink.genericError"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAuthenticate() {
    setError(null);
    setSubmitting(true);
    try {
      const res = await authenticateGio(phone, password);
      setVerifyGioToken(res.verify_gio_token);
      setPreview({ display_name: res.display_name });
      setStep("confirm");
    } catch (err) {
      // Generic on purpose — don't reveal whether phone or password was
      // the problem (see AUREN_GIO_ACCOUNT_LINKING_PLAN.md §6).
      console.error("authenticate request failed:", err);
      setError(t("gioLink.invalidCredentials"));
    } finally {
      setSubmitting(false);
    }
  }

  const [handoffError, setHandoffError] = useState<string | null>(null);
  const [handoffSubmitting, setHandoffSubmitting] = useState(false);

  async function handleOpenGio() {
    setHandoffError(null);
    setHandoffSubmitting(true);
    try {
      const { sso_token } = await requestGioHandoff(token);
      window.location.href = `${BRACELET_WEBSITE_URL}/auth/sso?token=${encodeURIComponent(sso_token)}`;
    } catch (err) {
      console.error("handoff request failed:", err);
      setHandoffError(t("gioLink.handoffError"));
      setHandoffSubmitting(false);
    }
  }

  async function handleConfirm() {
    if (!verifyGioToken) return;
    setError(null);
    setSubmitting(true);
    try {
      const assertion = await issueAurenAssertion(token);
      await confirmAurenSide(verifyGioToken, assertion.verify_auren_token);
      await confirmGioSide(verifyGioToken, assertion.verify_auren_token);
      setStep("linked");
    } catch (err) {
      // No automatic retry, no background job — a failed confirm here
      // (e.g. the Gio-side write) is surfaced and the user re-does this
      // step; the tokens are still valid within their 5 min window.
      console.error("confirm request failed:", err);
      setError(t("gioLink.genericError"));
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "loading") return null;

  if (step === "statusError") {
    return (
      <Card>
        <h2 className="mb-1 font-display text-lg font-semibold text-foreground">{t("gioLink.title")}</h2>
        <p className="mb-4 text-sm font-medium text-danger">{t("gioLink.statusCheckFailed")}</p>
        <Button variant="outline" onClick={loadStatus}>
          {t("gioLink.retry")}
        </Button>
      </Card>
    );
  }

  if (step === "linked") {
    return (
      <Card>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-foreground">{t("gioLink.title")}</h2>
          <Chip tone="success">{t("gioLink.linked")}</Chip>
        </div>
        <p className="mb-4 text-sm text-foreground-muted">{t("gioLink.linkedBody")}</p>
        {handoffError ? <p className="mb-3 text-sm font-medium text-danger">{handoffError}</p> : null}
        <Button onClick={handleOpenGio} disabled={handoffSubmitting} loading={handoffSubmitting}>
          {t("gioLink.openGio")}
        </Button>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="mb-1 font-display text-lg font-semibold text-foreground">{t("gioLink.title")}</h2>
      <p className="mb-4 text-sm text-foreground-muted">{t("gioLink.body")}</p>

      {error ? <p className="mb-3 text-sm font-medium text-danger">{error}</p> : null}

      {step === "phone" && (
        <div className="flex flex-col gap-4">
          <TextField
            label={t("gioLink.phoneLabel")}
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Button onClick={handleCheckPhone} disabled={submitting || !phone} loading={submitting}>
            {t("gioLink.continue")}
          </Button>
        </div>
      )}

      {step === "password" && (
        <div className="flex flex-col gap-4">
          <TextField
            label={t("gioLink.passwordLabel")}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button onClick={handleAuthenticate} disabled={submitting || !password} loading={submitting}>
            {t("gioLink.verify")}
          </Button>
        </div>
      )}

      {step === "confirm" && preview && (
        <div className="flex flex-col gap-4">
          <div className="rounded-xl bg-surface-muted px-4 py-3 text-sm">
            <p className="font-semibold text-foreground">{preview.display_name}</p>
          </div>
          <Button onClick={handleConfirm} disabled={submitting} loading={submitting}>
            {t("gioLink.confirmLink")}
          </Button>
        </div>
      )}
    </Card>
  );
}
