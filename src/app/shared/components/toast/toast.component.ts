import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';

import { I18nService } from '../../../core/i18n/i18n.service';
import { Toast } from '../../../core/services/toast.service';

/** Notificación flotante temporal. `toast()` es `null` cuando no hay nada que mostrar. */
@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastComponent {
  readonly toast = input<Toast | null>(null);
  readonly dismissed = output<void>();

  protected readonly i18n = inject(I18nService);
}
