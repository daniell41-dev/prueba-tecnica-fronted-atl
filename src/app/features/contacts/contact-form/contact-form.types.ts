import { FormArray, FormControl, FormGroup } from '@angular/forms';

import { PhoneLabel } from '../../../core/models/contact.model';

/**
 * Formas tipadas del formulario de contacto (Reactive Forms tipado, Angular
 * 14+). Vivir en su propio archivo evita un ciclo de imports entre la página
 * y el fieldset de teléfonos, que comparten este tipo.
 */
export interface PhoneFormValue {
  id: string | undefined;
  label: PhoneLabel;
  number: string;
}

export type PhoneGroup = FormGroup<{
  id: FormControl<string | undefined>;
  label: FormControl<PhoneLabel>;
  number: FormControl<string>;
}>;

export type ContactFormGroup = FormGroup<{
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  email: FormControl<string>;
  company: FormControl<string>;
  phones: FormArray<PhoneGroup>;
}>;
