/**
 * Errores de dominio.
 *
 * Tener tipos propios (en vez de `throw new Error('...')` suelto) permite que la
 * UI distinga el motivo del fallo y muestre el mensaje adecuado, y que los tests
 * afirmen sobre el tipo y no sobre el texto.
 */

/** Se pidió un contacto que ya no existe (p. ej. eliminado en otra pestaña). */
export class ContactNotFoundError extends Error {
  constructor(readonly contactId: string) {
    super(`No se encontró el contacto ${contactId}.`);
    this.name = 'ContactNotFoundError';
  }
}

/** El navegador rechazó escribir en `localStorage` (modo privado, cuota llena). */
export class StorageWriteError extends Error {
  constructor() {
    super('No se pudieron guardar los cambios en este navegador.');
    this.name = 'StorageWriteError';
  }
}
