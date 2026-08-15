import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';

import { I18nService } from '../../../core/i18n/i18n.service';

/**
 * Diálogo de confirmación modal genérico (eliminar contacto, descartar
 * cambios sin guardar). Presentacional: el llamador decide qué pasa en
 * `confirmed` / `cancelled`, este componente solo pinta y emite.
 *
 * `title`/`message` siempre los pasa quien lo usa (son contenido específico
 * del caso). `confirmLabel`/`cancelLabel` son opcionales y caen al texto
 * traducido genérico si no se pasan.
 */
@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent {
  readonly open = input.required<boolean>();
  readonly title = input.required<string>();
  readonly message = input<string | null>(null);
  readonly confirmLabel = input<string | null>(null);
  readonly cancelLabel = input<string | null>(null);
  readonly danger = input(false);

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  protected readonly i18n = inject(I18nService);
}
