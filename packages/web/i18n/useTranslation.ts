"use client";

import { useCallback } from "react";
import { translate, type TranslateParams } from "@/i18n/translate";
import type { Locale, MessageKey } from "@/i18n/messages";
import { useLocaleStore } from "@/store/useLocaleStore";

export function useTranslation() {
  const locale = useLocaleStore((state) => state.locale);
  const setLocale = useLocaleStore((state) => state.setLocale);

  const t = useCallback(
    (key: MessageKey, params?: TranslateParams) => translate(locale, key, params),
    [locale],
  );

  return {
    locale,
    setLocale,
    t,
  };
}

export type { Locale, MessageKey };
