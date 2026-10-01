import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setUser } from "@/store/authSlice";
import { updateMe } from "@/lib/api/auth";
import type { Language } from "@/lib/types";

const STORAGE_KEY = "gio-language";

/** Pre-login language guess: a previously-saved local choice, else the
 * browser's own language, else English. Only used before `user` exists —
 * see _app.tsx's sync effect for what happens once it does. */
export function detectInitialLanguage(): Language {
  if (typeof window === "undefined") return "en";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "zh") return stored;
  } catch {
    // localStorage unavailable (private mode, disabled storage, etc.)
  }
  return navigator.language?.toLowerCase().startsWith("zh") ? "zh" : "en";
}

/**
 * The single accessor for "what language is the UI in right now" — see
 * docs/behaviour_log_0001.md. Backs both `t()` (via `useTranslation`,
 * which already re-renders on language change) and the existing
 * `localized()`/`localizedSnapshot()` bilingual-content helpers, so
 * there's one current-language concept in this app, not several.
 */
export function useLanguage() {
  const { i18n } = useTranslation();
  const token = useAppSelector((s) => s.auth.token);
  const dispatch = useAppDispatch();

  const setLanguage = useCallback(
    async (next: Language) => {
      await i18n.changeLanguage(next);
      if (typeof document !== "undefined") document.documentElement.lang = next;
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // ignore — persisting the choice is a nicety, not a requirement
      }
      if (token) {
        const updated = await updateMe(token, { preferred_language: next });
        dispatch(setUser(updated));
      }
    },
    [i18n, token, dispatch]
  );

  return { language: (i18n.language as Language) || "en", setLanguage };
}
