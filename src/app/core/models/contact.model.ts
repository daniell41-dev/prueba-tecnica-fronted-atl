import type { TranslationKey } from '../i18n/translations/es';

/**
 * Modelo de dominio de un contacto.
 *
 * Es la única forma en que el resto de la app "ve" un contacto: la capa de
 * datos (repositorios) traduce el formato de la API/almacenamiento a estas
 * interfaces mediante un adapter, de modo que un cambio en el backend no se
 * propague a componentes ni servicios.
 */

/** Etiquetas soportadas para un teléfono. Se guardan por clave, no por texto. */
export type PhoneLabel = 'mobile' | 'home' | 'work' | 'other';

/**
 * Clave de traducción para cada etiqueta (nunca el texto): el modelo de
 * dominio no debe contener copy de UI, solo el mapeo hacia `I18nService.t()`.
 */
export const PHONE_LABEL_TRANSLATION_KEYS: Readonly<Record<PhoneLabel, TranslationKey>> = {
  mobile: 'phone.mobile',
  home: 'phone.home',
  work: 'phone.work',
  other: 'phone.other',
};

export const PHONE_LABEL_KEYS = Object.keys(PHONE_LABEL_TRANSLATION_KEYS) as readonly PhoneLabel[];

/** Un teléfono del contacto. Un contacto puede tener uno o varios (bonus 2). */
export interface Phone {
  /** Identificador estable; permite hacer `track` en `@for` sin re-render. */
  id: string;
  label: PhoneLabel;
  /** Número normalizado: solo dígitos (10 en México). */
  number: string;
}

/** Contacto completo tal y como se persiste y se muestra. */
export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  company: string | null;
  phones: Phone[];
  favorite: boolean;
  /** ISO-8601. Sirve para ordenar por "recientes" y auditar cambios. */
  createdAt: string;
  updatedAt: string;
}

/** Teléfono aún sin persistir: los nuevos no traen `id` hasta que se guardan. */
export interface PhoneDraft {
  id?: string;
  label: PhoneLabel;
  number: string;
}

/**
 * Datos que el usuario captura en el formulario.
 *
 * Se excluyen `id` y las marcas de tiempo porque los genera la capa de datos:
 * el formulario no debe poder inventarlos (ISP — cada capa recibe solo lo que
 * le corresponde).
 */
export interface ContactDraft {
  firstName: string;
  lastName: string;
  email: string | null;
  company: string | null;
  phones: PhoneDraft[];
  favorite?: boolean;
}

/** Nombre completo listo para mostrar. */
export function fullName(contact: Pick<Contact, 'firstName' | 'lastName'>): string {
  return `${contact.firstName} ${contact.lastName}`.trim();
}
