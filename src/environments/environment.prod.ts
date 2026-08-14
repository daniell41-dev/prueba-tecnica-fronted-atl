/** Configuración de entorno (producción). */
export const environment = {
  production: true,
  contactsApiUrl: 'data/contacts.json',
  /** Sin latencia artificial: en producción manda la red real. */
  apiLatencyMs: 0,
} as const;
