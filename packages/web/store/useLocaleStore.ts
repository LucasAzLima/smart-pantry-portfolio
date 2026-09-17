import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_LOCALE,
  isLocale,
  LOCALE_STORAGE_KEY,
  type Locale,
} from "@/i18n/messages";

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: DEFAULT_LOCALE,
      setLocale: (locale) => {
        if (!isLocale(locale)) {
          return;
        }

        set({ locale });
      },
    }),
    {
      name: LOCALE_STORAGE_KEY,
      partialize: (state) => ({ locale: state.locale }),
      merge: (persistedState, currentState) => {
        if (
          typeof persistedState !== "object" ||
          persistedState === null ||
          !("locale" in persistedState)
        ) {
          return currentState;
        }

        const { locale } = persistedState as { locale?: unknown };
        if (typeof locale !== "string" || !isLocale(locale)) {
          return currentState;
        }

        return {
          ...currentState,
          locale,
        };
      },
    },
  ),
);
