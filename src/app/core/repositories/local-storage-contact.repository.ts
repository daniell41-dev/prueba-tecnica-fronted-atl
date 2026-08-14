import { inject, Injectable } from '@angular/core';
import { map, Observable, of, tap, throwError } from 'rxjs';

import { STORAGE_KEYS } from '../constants/storage.constants';
import { ContactNotFoundError, StorageWriteError } from '../models/app-error';
import { Contact, ContactDraft, Phone, PhoneDraft } from '../models/contact.model';
import { IdService } from '../services/id.service';
import { StorageService } from '../services/storage.service';
import { normalizePhoneNumber } from './contact.adapter';
import { ContactsApiService } from './contacts-api.service';
import type { ContactRepository } from './contact.repository';

/** Copia el arreglo reemplazando el elemento en `index` (sin mutar el original). */
function replaceAt<T>(items: readonly T[], index: number, value: T): T[] {
  const copy = items.slice();
  copy[index] = value;
  return copy;
}

/**
 * Implementación del repositorio sobre `localStorage`, sembrada desde la API.
 *
 * Estrategia:
 *  1. La primera vez que se piden los contactos no hay nada guardado, así que se
 *     descargan de la API simulada y se persisten.
 *  2. A partir de ahí, `localStorage` es la fuente de verdad: lo que el usuario
 *     agrega o edita sobrevive a recargas de página.
 *  3. `resetToSeed()` permite volver al estado original de la API.
 *
 * Toda la escritura pasa por `persist()`, de modo que si el navegador rechaza
 * guardar (modo privado, cuota llena) el error se propaga como
 * `StorageWriteError` y la UI puede avisar en vez de fingir que guardó.
 */
@Injectable({ providedIn: 'root' })
export class LocalStorageContactRepository implements ContactRepository {
  private readonly storage = inject(StorageService);
  private readonly api = inject(ContactsApiService);
  private readonly ids = inject(IdService);

  getAll(): Observable<Contact[]> {
    const stored = this.storage.getJSON<Contact[]>(STORAGE_KEYS.contacts);
    if (stored !== null) {
      return of(stored);
    }
    return this.api.getContacts().pipe(tap((contacts) => this.persist(contacts)));
  }

  getById(id: string): Observable<Contact | undefined> {
    return this.getAll().pipe(map((contacts) => contacts.find((contact) => contact.id === id)));
  }

  create(draft: ContactDraft): Observable<Contact> {
    const now = new Date().toISOString();
    const contact: Contact = {
      ...this.sanitize(draft),
      id: this.ids.newId(),
      favorite: draft.favorite ?? false,
      createdAt: now,
      updatedAt: now,
    };

    return this.write([...this.snapshot(), contact], contact);
  }

  update(id: string, draft: ContactDraft): Observable<Contact> {
    const contacts = this.snapshot();
    const index = contacts.findIndex((contact) => contact.id === id);
    if (index === -1) {
      return throwError(() => new ContactNotFoundError(id));
    }

    const previous = contacts[index];
    const updated: Contact = {
      ...previous,
      ...this.sanitize(draft),
      // `favorite` no se edita desde el formulario: se conserva salvo que el
      // draft lo traiga explícitamente.
      favorite: draft.favorite ?? previous.favorite,
      updatedAt: new Date().toISOString(),
    };

    return this.write(replaceAt(contacts, index, updated), updated);
  }

  remove(id: string): Observable<void> {
    const contacts = this.snapshot();
    if (!contacts.some((contact) => contact.id === id)) {
      return throwError(() => new ContactNotFoundError(id));
    }
    return this.write(
      contacts.filter((contact) => contact.id !== id),
      undefined as void,
    );
  }

  setFavorite(id: string, favorite: boolean): Observable<Contact> {
    const contacts = this.snapshot();
    const index = contacts.findIndex((contact) => contact.id === id);
    if (index === -1) {
      return throwError(() => new ContactNotFoundError(id));
    }

    const updated: Contact = { ...contacts[index], favorite };
    return this.write(replaceAt(contacts, index, updated), updated);
  }

  resetToSeed(): Observable<Contact[]> {
    this.storage.remove(STORAGE_KEYS.contacts);
    return this.getAll();
  }

  // ── Internos ──────────────────────────────────────────────────────────────

  /** Lista persistida actualmente; `[]` si aún no se ha sembrado. */
  private snapshot(): Contact[] {
    return this.storage.getJSON<Contact[]>(STORAGE_KEYS.contacts) ?? [];
  }

  /** Persiste la lista y devuelve `result`, o falla con `StorageWriteError`. */
  private write<T>(contacts: Contact[], result: T): Observable<T> {
    return this.persist(contacts) ? of(result) : throwError(() => new StorageWriteError());
  }

  private persist(contacts: Contact[]): boolean {
    return this.storage.setJSON(STORAGE_KEYS.contacts, contacts);
  }

  /**
   * Normaliza lo que llega del formulario antes de guardarlo: recorta espacios,
   * convierte cadenas vacías en `null` y deja los teléfonos en dígitos con un id
   * estable. Así el almacenamiento nunca guarda basura de UI.
   */
  private sanitize(draft: ContactDraft): Omit<Contact, 'id' | 'favorite' | 'createdAt' | 'updatedAt'> {
    return {
      firstName: draft.firstName.trim(),
      lastName: draft.lastName.trim(),
      email: draft.email?.trim() || null,
      company: draft.company?.trim() || null,
      phones: draft.phones.map((phone) => this.toPhone(phone)),
    };
  }

  private toPhone(draft: PhoneDraft): Phone {
    return {
      id: draft.id ?? this.ids.newId(),
      label: draft.label,
      number: normalizePhoneNumber(draft.number),
    };
  }
}
