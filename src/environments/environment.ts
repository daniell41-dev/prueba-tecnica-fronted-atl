/**
 * Configuración de entorno (desarrollo).
 *
 * En producción este archivo se sustituye por `environment.prod.ts` mediante
 * `fileReplacements` en `angular.json`.
 */
export const environment = {
  production: false,
  /** Endpoint del "backend". Aquí, un JSON estático servido desde `public/`. */
  contactsApiUrl: 'data/contacts.json',
  /**
   * Latencia artificial (ms) al leer la API simulada. En desarrollo se deja
   * visible para poder validar los estados de carga y error de la UI.
   */
  apiLatencyMs: 600,
} as const;
