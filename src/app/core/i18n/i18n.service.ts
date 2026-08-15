import { inject, Injectable, signal } from '@angular/core';

import { STORAGE_KEYS } from '../constants/storage.constants';
import { StorageService } from '../services/storage.service';
import { DEFAULT_LOCALE, isSupportedLocale, Locale, LOCALE_OPTIONS } from './locale.model';
import { EN } from './translations/en';
import { ES, TranslationDictionary, TranslationKey } from './translations/es';
import { FR } from './translations/fr';

const DICTIONARIES: Record<Locale, TranslationDictionary> = { es: ES, en: EN, fr: FR };

/**
 * Traducción en tiempo de ejecución (ES/EN/FR) con signals.
 *
 * `@angular/localize` (el i18n "nativo" de Angular) se descartó a propósito:
 * es de **tiempo de compilación** — genera un bundle por idioma y cambiar de
 * idioma implica navegar a otra URL con recarga completa; además `ng serve`
 * solo puede servir un idioma a la vez. Con tres botones que traducen la app
 * al instante, hace falta estado en runtime. Este servicio sigue el mismo
 * patrón que `ContactStore`: un signal privado, uno público de solo lectura.
 */
@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly storage = inject(StorageService);

  private readonly _locale = signal<Locale>(this.resolveInitialLocale());
  readonly locale = this._locale.asReadonly();

  /** Metadatos para pintar el switcher (código + bandera), en orden estable. */
  readonly options = LOCALE_OPTIONS;

  constructor() {
    this.applyDocumentLocale(this._locale());
  }

  /** Traduce `key` en el idioma activo; interpola `{param}` si se pasan `params`. */
  t(key: TranslationKey, params?: Record<string, string | number>): string {
    const dictionary = DICTIONARIES[this._locale()];
    // Fallback a español: nunca debería faltar una clave (lo garantiza el tipo
    // TranslationDictionary + translations.spec.ts), pero es la red de
    // seguridad barata si algo se rompiera en runtime.
    const template = dictionary[key] ?? ES[key];
    return interpolate(template, params);
  }

  setLocale(locale: Locale): void {
    this._locale.set(locale);
    this.storage.setJSON(STORAGE_KEYS.locale, locale);
    this.applyDocumentLocale(locale);
  }

  private resolveInitialLocale(): Locale {
    const stored = this.storage.getJSON<string>(STORAGE_KEYS.locale);
    if (stored && isSupportedLocale(stored)) return stored;

    const detected = this.detectBrowserLocale();
    return detected ?? DEFAULT_LOCALE;
  }

  private detectBrowserLocale(): Locale | null {
    if (typeof navigator === 'undefined' || !navigator.language) return null;
    const language = navigator.language.slice(0, 2).toLowerCase();
    return isSupportedLocale(language) ? language : null;
  }

  /** Mantiene `<html lang>` y `<title>` sincronizados (accesibilidad y SEO). */
  private applyDocumentLocale(locale: Locale): void {
    if (typeof document === 'undefined') return;
    document.documentElement.lang = locale;
    document.title = this.t('app.title');
  }
}

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in params ? String(params[key]) : match,
  );
}
