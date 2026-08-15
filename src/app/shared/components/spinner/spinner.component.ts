import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';

import { I18nService } from '../../../core/i18n/i18n.service';

/** Indicador de carga circular, accesible vía `role="status"`. */
@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpinnerComponent {
  readonly label = input<string | null>(null);

  protected readonly i18n = inject(I18nService);
}
