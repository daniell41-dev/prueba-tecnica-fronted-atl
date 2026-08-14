/**
 * Claves de `localStorage` usadas por la app.
 *
 * Centralizarlas evita literales repartidos por el código (DRY) y hace
 * explícito el "contrato" de lo que la app guarda en el navegador.
 */
export const STORAGE_KEYS = {
  /** Lista completa de contactos persistida tras el primer arranque. */
  contacts: 'contacts-app.contacts',
} as const;
