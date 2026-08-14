import { Pipe, PipeTransform } from '@angular/core';

/** Iniciales para el avatar: primera letra de nombre y apellido, en mayúsculas. */
@Pipe({ name: 'initials', standalone: true })
export class InitialsPipe implements PipeTransform {
  transform(firstName: string | null | undefined, lastName?: string | null): string {
    const first = (firstName ?? '').trim().charAt(0);
    const last = (lastName ?? '').trim().charAt(0);
    const initials = `${first}${last}`.toUpperCase();
    return initials || '?';
  }
}
