import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { ValidationErrors } from '@angular/forms';

import { I18nService } from '../../../core/i18n/i18n.service';
import { TranslationKey } from '../../../core/i18n/translations/es';

/**
 * Mapea la *clave* de un error de validación a una *clave de traducción*
 * (nunca al texto): el texto final lo resuelve `I18nService.t()` según el
 * idioma activo. Centralizar el mapeo aquí evita repetir el `@if` de
 * mensajes en cada formulario (DRY) y mantiene un tono consistente.
 */
const ERROR_TRANSLATION_KEYS: Record<string, TranslationKey> = {
  required: 'errors.required',
  invalidName: 'errors.invalidName',
  invalidPhone: 'errors.invalidPhone',
  duplicatePhone: 'errors.duplicatePhone',
  email: 'errors.email',
  emailTaken: 'errors.emailTaken',
  maxlength: 'errors.maxlength',
  minArrayLength: 'errors.minArrayLength',
};

@Component({
  selector: 'app-field-error',
  templateUrl: './field-error.component.html',
  styleUrl: './field-error.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldErrorComponent {
  readonly errors = input<ValidationErrors | null>(null);

  protected readonly i18n = inject(I18nService);

  protected message(): string | null {
    const errors = this.errors();
    if (!errors) return null;
    const [firstKey] = Object.keys(errors);
    if (!firstKey) return null;
    return this.i18n.t(ERROR_TRANSLATION_KEYS[firstKey] ?? 'errors.generic');
  }
}
