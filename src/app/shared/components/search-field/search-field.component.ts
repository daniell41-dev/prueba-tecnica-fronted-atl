import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/**
 * Campo de búsqueda controlado desde fuera (no usa `ngModel`/formularios
 * reactivos internamente): recibe `value` y emite `valueChange`, como
 * cualquier componente presentacional de tipo "controlled input".
 */
@Component({
  selector: 'app-search-field',
  templateUrl: './search-field.component.html',
  styleUrl: './search-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchFieldComponent {
  readonly value = input('');
  readonly placeholder = input('Buscar contacto…');
  readonly valueChange = output<string>();

  protected onInput(event: Event): void {
    this.valueChange.emit((event.target as HTMLInputElement).value);
  }

  protected clear(): void {
    this.valueChange.emit('');
  }
}
