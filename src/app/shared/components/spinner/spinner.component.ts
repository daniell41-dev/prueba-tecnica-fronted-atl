import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Indicador de carga circular, accesible vía `role="status"`. */
@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpinnerComponent {
  readonly label = input('Cargando…');
}
