import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { InitialsPipe } from '../../pipes/initials.pipe';

/** Colores de fondo del avatar; se elige uno de forma determinista por contacto. */
const PALETTE = ['#4f46e5', '#0891b2', '#c026d3', '#ea580c', '#16a34a', '#be123c', '#7c3aed'];

/**
 * Avatar circular con iniciales, coloreado de forma estable según el nombre
 * (mismo contacto → mismo color siempre, sin guardar nada extra).
 *
 * Presentacional puro: solo `input()`, sin servicios (regla de `shared/`).
 */
@Component({
  selector: 'app-avatar',
  imports: [InitialsPipe],
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarComponent {
  readonly firstName = input.required<string>();
  readonly lastName = input<string | null>(null);
  readonly size = input<'sm' | 'md' | 'lg'>('md');

  protected readonly background = computed(() => {
    const key = `${this.firstName()}${this.lastName() ?? ''}`;
    const index = hashString(key) % PALETTE.length;
    return PALETTE[index];
  });
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}
