import { AbstractControl, FormArray, ValidationErrors, ValidatorFn } from '@angular/forms';

import { normalizePhoneNumber, PHONE_DIGITS } from '../repositories/contact.adapter';

/**
 * Validadores propios del dominio "contacto".
 *
 * Se agrupan aquí (en vez de repartirlos por los componentes) para poder
 * probarlos de forma aislada y reutilizarlos entre `contact-form` y cualquier
 * otro formulario futuro (DRY).
 */

/** Letras (con acentos y ñ), espacios y guiones. Nombres como "Ana Sofía" o "José". */
const NAME_PATTERN = /^[\p{L}\s'-]+$/u;

/** Solo valida si hay contenido; combínalo con `Validators.required` si es obligatorio. */
export function nameValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = (control.value ?? '').trim();
    if (!value) return null;
    return NAME_PATTERN.test(value) ? null : { invalidName: true };
  };
}

/** Un teléfono mexicano válido tiene 10 dígitos una vez quitados lada/formato. */
export function mxPhoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = (control.value ?? '').trim();
    if (!value) return null;
    const digits = normalizePhoneNumber(value);
    return digits.length === PHONE_DIGITS ? null : { invalidPhone: true };
  };
}

/**
 * Exige que un `FormArray` tenga al menos un elemento.
 * Se aplica al array de teléfonos (bonus 2: uno o varios, nunca cero).
 */
export function minArrayLength(min: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const length = (control as FormArray).length;
    return length >= min ? null : { minArrayLength: { required: min, actual: length } };
  };
}

/**
 * Marca como duplicado cualquier teléfono cuyo número normalizado coincida con
 * otro dentro del mismo `FormArray`. El error se asigna a cada control
 * involucrado (`duplicatePhone`), no solo al array, para poder pintar el campo
 * exacto en rojo.
 */
export function uniquePhonesValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const array = control as FormArray;
    const numbers = array.controls.map((group) =>
      normalizePhoneNumber(group.get('number')?.value ?? ''),
    );

    let hasDuplicates = false;
    array.controls.forEach((group, index) => {
      const numberControl = group.get('number');
      if (!numberControl) return;

      const digits = numbers[index];
      const isDuplicate = digits.length > 0 && numbers.filter((n) => n === digits).length > 1;

      const { duplicatePhone, ...rest } = numberControl.errors ?? {};
      void duplicatePhone;
      if (isDuplicate) {
        hasDuplicates = true;
        numberControl.setErrors({ ...rest, duplicatePhone: true });
      } else if (Object.keys(rest).length > 0) {
        numberControl.setErrors(rest);
      } else {
        numberControl.setErrors(null);
      }
    });

    return hasDuplicates ? { duplicatePhones: true } : null;
  };
}

/**
 * Valida que el email (si se capturó) no pertenezca ya a otro contacto.
 *
 * Recibe una función en vez de la lista directamente para no atar el
 * validador a un snapshot fijo: se reevalúa contra el estado más reciente
 * cada vez que Angular corre las validaciones.
 */
export function uniqueEmailValidator(
  getExistingEmails: () => readonly string[],
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = (control.value ?? '').trim().toLowerCase();
    if (!value) return null;
    const taken = getExistingEmails().some((email) => email.toLowerCase() === value);
    return taken ? { emailTaken: true } : null;
  };
}
