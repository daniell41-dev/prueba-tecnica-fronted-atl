import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';

import { I18nService } from '../i18n/i18n.service';
import { Locale } from '../i18n/locale.model';
import { ES } from '../i18n/translations/es';
import { Contact, ContactDraft } from '../models/contact.model';
import { CONTACT_REPOSITORY, ContactRepository } from '../repositories/contact.repository';
import { ContactStore } from './contact-store.service';

/**
 * `ContactStore` no debe depender del idioma real del navegador en sus
 * propios tests (eso ya lo cubren `i18n.service.spec.ts` y
 * `translations.spec.ts`): un `I18nService` fijo en español mantiene esta
 * suite determinista sin importar dónde se ejecute.
 */
function fakeI18nService(): Pick<I18nService, 'locale' | 't'> {
  return {
    locale: signal<Locale>('es').asReadonly(),
    t: (key) => ES[key],
  };
}

function contact(overrides: Partial<Contact>): Contact {
  return {
    id: 'id',
    firstName: 'Ana',
    lastName: 'Pérez',
    email: null,
    company: null,
    phones: [{ id: 'p1', label: 'mobile', number: '5511112222' }],
    favorite: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('ContactStore', () => {
  let store: ContactStore;
  let repo: jasmine.SpyObj<ContactRepository>;

  const seed: Contact[] = [
    contact({ id: 'b', firstName: 'Beto', lastName: 'Cruz' }),
    contact({ id: 'a', firstName: 'Ana', lastName: 'Díaz', favorite: true }),
    contact({ id: 'c', firstName: 'Carla', lastName: 'Nava', company: 'Atlantis' }),
  ];

  beforeEach(() => {
    repo = jasmine.createSpyObj<ContactRepository>('ContactRepository', [
      'getAll',
      'getById',
      'create',
      'update',
      'remove',
      'setFavorite',
      'resetToSeed',
    ]);
    repo.getAll.and.returnValue(of(seed));

    TestBed.configureTestingModule({
      providers: [
        { provide: CONTACT_REPOSITORY, useValue: repo },
        { provide: I18nService, useValue: fakeI18nService() },
      ],
    });
    store = TestBed.inject(ContactStore);
  });

  it('load() pasa a "loaded" y guarda los contactos', () => {
    store.load();
    expect(store.status()).toBe('loaded');
    expect(store.totalCount()).toBe(3);
  });

  it('load() pasa a "error" si el repositorio falla', () => {
    repo.getAll.and.returnValue(throwError(() => new Error('boom')));
    store.load();
    expect(store.status()).toBe('error');
    expect(store.error()).toContain('No se pudo cargar');
  });

  it('filteredContacts ordena favoritos primero y luego alfabéticamente', () => {
    store.load();
    expect(store.filteredContacts().map((c) => c.id)).toEqual(['a', 'b', 'c']);
  });

  it('setQuery filtra por nombre, empresa o teléfono', () => {
    store.load();
    store.setQuery('atlantis');
    expect(store.filteredContacts().map((c) => c.id)).toEqual(['c']);

    store.setQuery('5511112222');
    expect(store.filteredContacts().length).toBeGreaterThan(0);

    store.setQuery('no-existe-nadie');
    expect(store.filteredContacts()).toEqual([]);
  });

  it('emailsExcept devuelve los emails existentes salvo el del propio contacto', () => {
    repo.getAll.and.returnValue(
      of([contact({ id: 'x', email: 'x@correo.mx' }), contact({ id: 'y', email: 'y@correo.mx' })]),
    );
    store.load();
    expect(store.emailsExcept('x')).toEqual(['y@correo.mx']);
    expect(store.emailsExcept()).toEqual(['x@correo.mx', 'y@correo.mx']);
  });

  it('create agrega el contacto devuelto por el repositorio al estado', async () => {
    store.load();
    const created = contact({ id: 'new' });
    repo.create.and.returnValue(of(created));

    const result = await store.create({} as ContactDraft);

    expect(result).toBe(created);
    expect(store.findById('new')).toBe(created);
  });

  it('update reemplaza el contacto en el estado', async () => {
    store.load();
    const updated = contact({ id: 'a', firstName: 'Ana María' });
    repo.update.and.returnValue(of(updated));

    await store.update('a', {} as ContactDraft);

    expect(store.findById('a')?.firstName).toBe('Ana María');
  });

  it('remove quita el contacto del estado', async () => {
    store.load();
    repo.remove.and.returnValue(of(undefined));

    await store.remove('a');

    expect(store.findById('a')).toBeUndefined();
    expect(store.totalCount()).toBe(2);
  });

  it('toggleFavorite invierte el valor actual', async () => {
    store.load();
    const current = store.findById('b')!;
    const toggled = { ...current, favorite: true };
    repo.setFavorite.and.returnValue(of(toggled));

    await store.toggleFavorite(current);

    expect(repo.setFavorite).toHaveBeenCalledWith('b', true);
    expect(store.findById('b')?.favorite).toBeTrue();
  });

  it('resetToSeed reemplaza el estado con lo que devuelva el repositorio', () => {
    store.load();
    const reseeded = [contact({ id: 'seed' })];
    repo.resetToSeed.and.returnValue(of(reseeded));

    store.resetToSeed();

    expect(store.contacts()).toEqual(reseeded);
    expect(store.status()).toBe('loaded');
  });

  it('las acciones propagan el error si el repositorio falla', async () => {
    store.load();
    repo.remove.and.returnValue(throwError(() => new Error('nope')) as unknown as Observable<void>);

    await expectAsync(store.remove('a')).toBeRejected();
  });
});
