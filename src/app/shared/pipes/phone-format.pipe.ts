import { Pipe, PipeTransform } from '@angular/core';

/**
 * Da formato legible a un número de 10 dígitos: `5512345678` → `55 1234 5678`.
 * Si no trae exactamente 10 dígitos (dato antiguo o inválido), lo muestra tal cual.
 */
@Pipe({ name: 'phoneFormat', standalone: true })
export class PhoneFormatPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    const digits = (value ?? '').replace(/\D/g, '');
    if (digits.length !== 10) return value ?? '';
    return `${digits.slice(0, 2)} ${digits.slice(2, 6)} ${digits.slice(6)}`;
  }
}
