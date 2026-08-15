import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { I18nService } from './core/i18n/i18n.service';
import { Locale } from './core/i18n/locale.model';
import { ToastService } from './core/services/toast.service';
import {
  LanguageOption,
  LanguageSwitcherComponent,
} from './shared/components/language-switcher/language-switcher.component';
import { ToastComponent } from './shared/components/toast/toast.component';

/**
 * Raíz de la app: barra global (nombre + selector de idioma) + `router-outlet`
 * + toasts. Es quien cablea los componentes `shared` presentacionales
 * (`app-language-switcher`, `app-toast`) con sus servicios de `core`, para
 * que esos componentes se mantengan sin dependencias de datos.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LanguageSwitcherComponent, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly i18n = inject(I18nService);
  protected readonly toast = inject(ToastService);

  /** Opciones del switcher ya traducidas; se recalcula al cambiar de idioma. */
  protected readonly languageOptions = computed<LanguageOption[]>(() =>
    this.i18n.options.map((option) => ({
      code: option.code,
      flag: option.flag,
      label: this.i18n.t(`app.language.${option.code}`),
    })),
  );

  protected onLocaleChange(locale: Locale): void {
    this.i18n.setLocale(locale);
  }
}
