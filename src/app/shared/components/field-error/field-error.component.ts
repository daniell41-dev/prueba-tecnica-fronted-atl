import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ValidationErrors } from '@angular/forms';

/**
 * Traduce el objeto `errors` de un `AbstractControl` a un mensaje único en
 * español. Centralizar el texto aquí evita repetir `@if` de mensajes en cada
 * formulario (DRY) y facilita mantener un tono consistente.
 */
const MESSAGES: Record<string, string> = {
  required: 'Este campo es obligatorio.',
  invalidName: 'Usa solo letras y espacios.',
  invalidPhone: 'Ingresa un teléfono de 10 dígitos.',
  duplicatePhone: 'Este teléfono ya está en la lista.',
  email: 'Ingresa un correo válido.',
  emailTaken: 'Ya existe un contacto con este correo.',
  maxlength: 'Se pasó del límite de caracteres.',
  minArrayLength: 'Agrega al menos un teléfono.',
};

@Component({
  selector: 'app-field-error',
  templateUrl: './field-error.component.html',
  styleUrl: './field-error.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldErrorComponent {
  readonly errors = input<ValidationErrors | null>(null);

  protected message(): string | null {
    const errors = this.errors();
    if (!errors) return null;
    const [firstKey] = Object.keys(errors);
    return firstKey ? (MESSAGES[firstKey] ?? 'Valor inválido.') : null;
  }
}
