import { Contact, Phone, PhoneLabel, PHONE_LABEL_KEYS } from '../models/contact.model';
import { ContactDto, PhoneDto } from './contact.dto';

/**
 * Adapter (GoF) entre el formato de la API y el modelo de dominio.
 *
 * Concentra aquí toda la "suciedad" del backend —`snake_case`, teléfonos con
 * lada y separadores, campos opcionales— para que el resto de la app trabaje
 * siempre con `Contact` bien tipado.
 */

/** Lada de México; se elimina al normalizar para guardar 10 dígitos. */
const MX_COUNTRY_CODE = '52';

/** Longitud de un número nacional en México. */
export const PHONE_DIGITS = 10;

/**
 * Deja un teléfono en dígitos: quita espacios, guiones, paréntesis, `+` y la
 * lada de México cuando viene incluida (`+52 55 1234 5678` → `5512345678`).
 */
export function normalizePhoneNumber(raw: string): string {
  const digits = (raw ?? '').replace(/\D/g, '');
  if (digits.length === PHONE_DIGITS + MX_COUNTRY_CODE.length && digits.startsWith(MX_COUNTRY_CODE)) {
    return digits.slice(MX_COUNTRY_CODE.length);
  }
  return digits;
}

/** Convierte el `type` de la API en una etiqueta conocida; desconocido → `other`. */
function toPhoneLabel(type: string): PhoneLabel {
  const value = (type ?? '').toLowerCase() as PhoneLabel;
  return PHONE_LABEL_KEYS.includes(value) ? value : 'other';
}

function toPhone(dto: PhoneDto, contactId: string, index: number): Phone {
  return {
    // La API no identifica cada teléfono: se deriva un id estable y único
    // dentro del contacto para poder usarlo como `track` en las listas.
    id: `${contactId}-p${index + 1}`,
    label: toPhoneLabel(dto.type),
    number: normalizePhoneNumber(dto.number),
  };
}

/** Traduce un contacto de la API al modelo de dominio. */
export function toContact(dto: ContactDto): Contact {
  return {
    id: dto.id,
    firstName: dto.first_name?.trim() ?? '',
    lastName: dto.last_name?.trim() ?? '',
    email: dto.email?.trim() || null,
    company: dto.company?.trim() || null,
    favorite: dto.favorite ?? false,
    phones: (dto.phones ?? []).map((phone, index) => toPhone(phone, dto.id, index)),
    createdAt: dto.created_at,
    updatedAt: dto.updated_at ?? dto.created_at,
  };
}

export function toContacts(dtos: readonly ContactDto[]): Contact[] {
  return dtos.map(toContact);
}
