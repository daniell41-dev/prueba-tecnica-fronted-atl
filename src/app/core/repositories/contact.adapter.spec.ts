import { normalizePhoneNumber, toContact, toContacts } from './contact.adapter';
import { ContactDto } from './contact.dto';

function makeDto(overrides: Partial<ContactDto> = {}): ContactDto {
  return {
    id: 'c-1',
    first_name: ' Ana ',
    last_name: ' Pérez ',
    email: ' ana@correo.mx ',
    company: null,
    favorite: true,
    phones: [{ type: 'mobile', number: '+52 55 1234 5678' }],
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-02T00:00:00.000Z',
    ...overrides,
  };
}

describe('normalizePhoneNumber', () => {
  it('deja solo dígitos', () => {
    expect(normalizePhoneNumber('55-1234-5678')).toBe('5512345678');
  });

  it('quita la lada de México (+52) cuando el número trae 12 dígitos', () => {
    expect(normalizePhoneNumber('+52 55 1234 5678')).toBe('5512345678');
  });

  it('no toca un número nacional de 10 dígitos', () => {
    expect(normalizePhoneNumber('5512345678')).toBe('5512345678');
  });

  it('devuelve cadena vacía para entradas vacías o nulas', () => {
    expect(normalizePhoneNumber('')).toBe('');
    expect(normalizePhoneNumber(undefined as unknown as string)).toBe('');
  });
});

describe('toContact', () => {
  it('recorta espacios en nombre, apellido y email', () => {
    const contact = toContact(makeDto());
    expect(contact.firstName).toBe('Ana');
    expect(contact.lastName).toBe('Pérez');
    expect(contact.email).toBe('ana@correo.mx');
  });

  it('convierte cadenas vacías de company/email en null', () => {
    const contact = toContact(makeDto({ email: '  ', company: '  ' }));
    expect(contact.email).toBeNull();
    expect(contact.company).toBeNull();
  });

  it('normaliza los teléfonos y les asigna un id estable por posición', () => {
    const contact = toContact(
      makeDto({
        phones: [
          { type: 'mobile', number: '+52 55 1111 2222' },
          { type: 'work', number: '55 3333 4444' },
        ],
      }),
    );
    expect(contact.phones).toEqual([
      { id: 'c-1-p1', label: 'mobile', number: '5511112222' },
      { id: 'c-1-p2', label: 'work', number: '5533334444' },
    ]);
  });

  it('cae a "other" cuando el tipo de teléfono no se reconoce', () => {
    const contact = toContact(makeDto({ phones: [{ type: 'fax', number: '5512345678' }] }));
    expect(contact.phones[0].label).toBe('other');
  });

  it('usa created_at como updated_at si el dato no trae uno', () => {
    const contact = toContact(makeDto({ updated_at: undefined as unknown as string }));
    expect(contact.updatedAt).toBe(contact.createdAt);
  });

  it('respeta favorite=false y ausencia de favorite', () => {
    expect(toContact(makeDto({ favorite: false })).favorite).toBeFalse();
    expect(toContact(makeDto({ favorite: undefined })).favorite).toBeFalse();
  });
});

describe('toContacts', () => {
  it('mapea una lista completa preservando el orden', () => {
    const dtos = [makeDto({ id: 'a' }), makeDto({ id: 'b' })];
    expect(toContacts(dtos).map((c) => c.id)).toEqual(['a', 'b']);
  });
});
