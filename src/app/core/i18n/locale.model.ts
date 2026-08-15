/**
 * Idiomas soportados por la app.
 *
 * Cambiar de idioma es una decisión de runtime (signal), no de compilación:
 * ver `i18n.service.ts` para el porqué frente a `@angular/localize`.
 */
export type Locale = 'es' | 'en' | 'fr';

export const DEFAULT_LOCALE: Locale = 'es';

export interface LocaleOption {
  code: Locale;
  /** Bandera decorativa (aria-hidden); el texto accesible viene de una clave `t()`. */
  flag: string;
}

/** Metadatos de UI para pintar el switcher, en un orden estable. */
export const LOCALE_OPTIONS: readonly LocaleOption[] = [
  { code: 'es', flag: '🇲🇽' },
  { code: 'en', flag: '🇬🇧' },
  { code: 'fr', flag: '🇫🇷' },
];

const SUPPORTED_LOCALES = new Set<Locale>(LOCALE_OPTIONS.map((option) => option.code));

export function isSupportedLocale(value: string): value is Locale {
  return SUPPORTED_LOCALES.has(value as Locale);
}
