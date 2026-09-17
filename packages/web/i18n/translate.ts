import {
  DEFAULT_LOCALE,
  dictionaries,
  type Locale,
  type MessageKey,
  type Messages,
} from "./messages";

export type TranslateParams = Record<string, string | number>;

function applyParams(template: string, params?: TranslateParams): string {
  if (!params) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = params[key];
    return value === undefined ? match : String(value);
  });
}

/**
 * Resolves a message key from the active dictionary, falling back to the
 * default locale when the key is missing.
 */
export function translate(
  locale: Locale,
  key: MessageKey,
  params?: TranslateParams,
): string {
  const primary: Messages = dictionaries[locale];
  const fallback: Messages = dictionaries[DEFAULT_LOCALE];
  const template = primary[key] || fallback[key] || key;
  return applyParams(template, params);
}

export function getDictionary(locale: Locale): Messages {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}
