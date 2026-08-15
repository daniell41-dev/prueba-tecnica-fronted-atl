import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';

import { I18nService } from '../i18n/i18n.service';

/**
 * Cualquier página de formulario que quiera protegerse implementa esto.
 * Mantenerlo como interfaz (en vez de acoplar el guard a `ContactFormPage`)
 * permite reutilizarlo en cualquier formulario futuro (Interface Segregation).
 */
export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
}

/**
 * `CanDeactivate` genérico: si la página reporta cambios sin guardar, pide
 * confirmación antes de navegar fuera (back del navegador, cambio de ruta,
 * cerrar pestaña ya lo cubre `beforeunload` aparte).
 *
 * Es la segunda barrera contra pérdida de datos accidental; la primera es el
 * botón "Cancelar" del propio formulario, que ya pregunta antes de descartar.
 *
 * Los guards funcionales corren dentro del contexto de inyección del router,
 * así que `inject()` funciona igual que en un componente o servicio.
 */
export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (component) => {
  if (!component.hasUnsavedChanges()) return true;
  const i18n = inject(I18nService);
  return confirm(i18n.t('form.unsavedChangesConfirm'));
};
