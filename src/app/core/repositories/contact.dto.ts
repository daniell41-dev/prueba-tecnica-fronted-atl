/**
 * Contrato de datos de la "API" (`public/data/contacts.json`).
 *
 * Deliberadamente usa `snake_case` y un teléfono como texto libre con lada
 * internacional, como haría un backend real. La app nunca consume estos tipos
 * directamente: pasan por `contact.adapter.ts`, que los traduce al modelo de
 * dominio.
 */
export interface PhoneDto {
  type: string;
  number: string;
}

export interface ContactDto {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  company: string | null;
  favorite?: boolean;
  phones: PhoneDto[];
  created_at: string;
  updated_at: string;
}

/** Respuesta del endpoint de contactos. */
export interface ContactsResponseDto {
  contacts: ContactDto[];
}
