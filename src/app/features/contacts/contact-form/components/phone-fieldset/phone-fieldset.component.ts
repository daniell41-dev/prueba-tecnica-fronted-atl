import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { FormArray, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { PHONE_LABEL_KEYS, PHONE_LABELS } from '../../../../../core/models/contact.model';
import { mxPhoneValidator } from '../../../../../core/validators/contact.validators';
import { FieldErrorComponent } from '../../../../../shared/components/field-error/field-error.component';
import type { PhoneGroup } from '../../contact-form.types';

/**
 * Sub-formulario de "uno o varios teléfonos" (bonus 2): una fila por teléfono
 * con etiqueta + número, botón para agregar y para quitar (mínimo 1 fila).
 *
 * Recibe el `FormArray` del formulario padre y lo edita en el sitio
 * (`push`/`removeAt`): como es la misma instancia, el padre ve los cambios sin
 * necesidad de `@Output()` adicionales.
 */
@Component({
  selector: 'app-phone-fieldset',
  imports: [ReactiveFormsModule, FieldErrorComponent],
  templateUrl: './phone-fieldset.component.html',
  styleUrl: './phone-fieldset.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhoneFieldsetComponent {
  readonly array = input.required<FormArray<PhoneGroup>>();

  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly labelOptions = PHONE_LABEL_KEYS;
  protected readonly labelText = PHONE_LABELS;

  protected addPhone(): void {
    this.array().push(this.createPhoneGroup());
    this.array().markAsDirty();
  }

  protected removePhone(index: number): void {
    this.array().removeAt(index);
    this.array().markAsDirty();
  }

  protected canRemove(): boolean {
    return this.array().length > 1;
  }

  private createPhoneGroup(): PhoneGroup {
    return this.fb.group({
      id: this.fb.control<string | undefined>(undefined),
      label: this.fb.control<(typeof PHONE_LABEL_KEYS)[number]>('mobile', { validators: Validators.required }),
      number: this.fb.control('', { validators: [Validators.required, mxPhoneValidator()] }),
    });
  }
}
