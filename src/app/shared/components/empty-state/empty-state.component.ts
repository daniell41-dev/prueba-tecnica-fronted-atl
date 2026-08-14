import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/**
 * Placeholder para listas vacías, sin resultados de búsqueda o errores de
 * carga. Un solo componente cubre los tres casos (DRY) variando `input()`s;
 * el botón de acción es opcional (p. ej. "Reintentar").
 */
@Component({
  selector: 'app-empty-state',
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  readonly icon = input('👤');
  readonly title = input.required<string>();
  readonly description = input<string | null>(null);
  readonly actionLabel = input<string | null>(null);
  readonly action = output<void>();
}
