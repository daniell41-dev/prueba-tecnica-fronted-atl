import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

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
}
