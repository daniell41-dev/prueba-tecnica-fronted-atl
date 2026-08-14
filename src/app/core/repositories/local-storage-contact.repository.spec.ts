import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { ContactNotFoundError } from '../models/app-error';
import { Contact, ContactDraft } from '../models/contact.model';
import { IdService } from '../services/id.service';
import { STORAGE_KEYS } from '../constants/storage.constants';
import { ContactsApiService } from './contacts-api.service';
import { LocalStorageContactRepository } from './local-storage-contact.repository';

const SEED: Contact[] = [
  {
    id: 'seed-1',
    firstName: 'Ana',
    lastName: 'Pérez',
    email: 'ana@correo.mx',
    company: null,
    phones: [{ id: 'seed-1-p1', label: 'mobile', number: '5511112222' }],
    favorite: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

describe('LocalStorageContactRepository', () => {
  let repository: LocalStorageContactRepository;
  let apiSpy: jasmine.SpyObj<ContactsApiService>;
  let nextId: string;

  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEYS.contacts);
    nextId = 'new-id';

    apiSpy = jasmine.createSpyObj<ContactsApiService>('ContactsApiService', ['getContacts']);
    apiSpy.getContacts.and.returnValue(of(SEED.map((c) => ({ ...c, phones: [...c.phones] }))));

    TestBed.configureTestingModule({
      providers: [
        { provide: ContactsApiService, useValue: apiSpy },
        { provide: IdService, useValue: { newId: () => nextId } },
      ],
    });

    repository = TestBed.inject(LocalStorageContactRepository);
  });

  afterEach(() => {
    localStorage.removeItem(STORAGE_KEYS.contacts);
  });

  it('la primera carga siembra desde la API y persiste en localStorage', (done) => {
    repository.getAll().subscribe((contacts) => {
      expect(contacts).toEqual(SEED);
      expect(apiSpy.getContacts).toHaveBeenCalledTimes(1);
      expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.contacts)!)).toEqual(SEED);
      done();
    });
  });

  it('las siguientes cargas leen de localStorage sin volver a llamar a la API', (done) => {
    repository.getAll().subscribe(() => {
      repository.getAll().subscribe((contacts) => {
        expect(contacts).toEqual(SEED);
        expect(apiSpy.getContacts).toHaveBeenCalledTimes(1);
        done();
      });
    });
  });

  it('create agrega un contacto con id nuevo y timestamps', (done) => {
    const draft: ContactDraft = {
      firstName: '  Carlos  ',
      lastName: '  Ruiz ',
      email: '',
      company: '',
      phones: [{ label: 'mobile', number: '55 8888 9999' }],
    };

    repository.getAll().subscribe(() => {
      repository.create(draft).subscribe((created) => {
        expect(created.id).toBe('new-id');
        expect(created.firstName).toBe('Carlos');
        expect(created.email).toBeNull();
        expect(created.company).toBeNull();
        expect(created.phones).toEqual([{ id: 'new-id', label: 'mobile', number: '5588889999' }]);
        expect(created.favorite).toBeFalse();

        repository.getAll().subscribe((all) => {
          expect(all.length).toBe(2);
          done();
        });
      });
    });
  });

  it('update modifica un contacto existente conservando su favorito si el draft no lo trae', (done) => {
    repository.getAll().subscribe(() => {
      const draft: ContactDraft = {
        firstName: 'Ana',
        lastName: 'Pérez López',
        email: 'ana@correo.mx',
        company: 'Atlantis',
        phones: [{ id: 'seed-1-p1', label: 'mobile', number: '5511112222' }],
      };
      repository.update('seed-1', draft).subscribe((updated) => {
        expect(updated.lastName).toBe('Pérez López');
        expect(updated.company).toBe('Atlantis');
        expect(updated.favorite).toBeFalse();
        done();
      });
    });
  });

  it('update falla con ContactNotFoundError si el id no existe', (done) => {
    repository.getAll().subscribe(() => {
      repository.update('missing', SEED[0] as unknown as ContactDraft).subscribe({
        error: (err) => {
          expect(err).toBeInstanceOf(ContactNotFoundError);
          done();
        },
      });
    });
  });

  it('remove quita el contacto de la lista persistida', (done) => {
    repository.getAll().subscribe(() => {
      repository.remove('seed-1').subscribe(() => {
        repository.getAll().subscribe((all) => {
          expect(all.length).toBe(0);
          done();
        });
      });
    });
  });

  it('setFavorite alterna la marca de favorito', (done) => {
    repository.getAll().subscribe(() => {
      repository.setFavorite('seed-1', true).subscribe((updated) => {
        expect(updated.favorite).toBeTrue();
        done();
      });
    });
  });

  it('resetToSeed borra lo local y vuelve a pedir los datos a la API', (done) => {
    repository.getAll().subscribe(() => {
      repository.remove('seed-1').subscribe(() => {
        repository.resetToSeed().subscribe((contacts) => {
          expect(contacts).toEqual(SEED);
          expect(apiSpy.getContacts).toHaveBeenCalledTimes(2);
          done();
        });
      });
    });
  });
});
