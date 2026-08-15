import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';

import { I18nService } from '../../../core/i18n/i18n.service';

/**
 * Campo de búsqueda controlado desde fuera (no usa `ngModel`/formularios
 * reactivos internamente): recibe `value` y emite `valueChange`, como
 * cualquier componente presentacional de tipo "controlled input".
 *
 * `placeholder` es opcional: si no se pasa, cae al texto traducido por
 * defecto (`I18nService` es infraestructura de UI, no datos de negocio —
 * ver excepción documentada en `docs/02-arquitectura-y-buenas-practicas.md`).
 */
@Component({
  selector: 'app-search-field',
  templateUrl: './search-field.component.html',
  styleUrl: './search-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchFieldComponent {
  readonly value = input('');
  readonly placeholder = input<string | null>(null);

  readonly valueChange = output<string>();

  protected readonly i18n = inject(I18nService);

  protected onInput(event: Event): void {
    this.valueChange.emit((event.target as HTMLInputElement).value);
  }

  protected clear(): void {
    this.valueChange.emit('');
  }
}
