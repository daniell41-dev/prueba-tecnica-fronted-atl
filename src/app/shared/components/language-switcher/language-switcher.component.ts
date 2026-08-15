import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { Locale } from '../../../core/i18n/locale.model';

/** Una opción de idioma ya resuelta para mostrar (bandera + etiqueta traducida). */
export interface LanguageOption {
  code: Locale;
  flag: string;
  label: string;
}

/**
 * Selector de idioma: 3 botones (ES/EN/FR). Presentacional puro — recibe las
 * opciones ya traducidas y el idioma activo por `input()`, emite la intención
 * de cambio por `output()`. Quien lo cablea con `I18nService` es `App`
 * (mismo patrón que `app-toast` en `app.html`), no este componente.
 */
@Component({
  selector: 'app-language-switcher',
  templateUrl: './language-switcher.component.html',
  styleUrl: './language-switcher.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageSwitcherComponent {
  readonly options = input.required<readonly LanguageOption[]>();
  readonly active = input.required<Locale>();
  readonly switchAriaLabel = input('Change language');

  readonly localeChange = output<Locale>();
}
