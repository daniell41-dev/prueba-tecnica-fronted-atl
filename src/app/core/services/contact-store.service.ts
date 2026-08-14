import { computed, inject, Injectable, signal } from '@angular/core';
import { finalize, Observable } from 'rxjs';

import { Contact, ContactDraft, fullName } from '../models/contact.model';
import { CONTACT_REPOSITORY } from '../repositories/contact.repository';

export type LoadStatus = 'idle' | 'loading' | 'loaded' | 'error';

/**
 * Fachada de estado de contactos (Facade / GoF) sobre `ContactRepository`.
 *
 * Es el único lugar donde vive el estado de "todos los contactos": las páginas
 * leen signals de solo lectura y disparan acciones (`load`, `save`, `remove`,
 * `toggleFavorite`); nunca hablan con el repositorio directamente. Esto
 * mantiene una sola fuente de verdad en memoria y evita que cada página tenga
 * que repetir su propia copia de la lista.
 */
@Injectable({ providedIn: 'root' })
export class ContactStore {
  private readonly repository = inject(CONTACT_REPOSITORY);

  private readonly _contacts = signal<Contact[]>([]);
  private readonly _status = signal<LoadStatus>('idle');
  private readonly _error = signal<string | null>(null);
  private readonly _query = signal('');

  readonly contacts = this._contacts.asReadonly();
  readonly status = this._status.asReadonly();
  readonly error = this._error.asReadonly();
  readonly query = this._query.asReadonly();

  readonly loading = computed(() => this._status() === 'loading');

  /** Lista ordenada (favoritos primero, luego alfabético) y filtrada por `query`. */
  readonly filteredContacts = computed(() => {
    const term = this._query().trim().toLowerCase();
    const sorted = [...this._contacts()].sort(compareContacts);
    if (!term) return sorted;
    return sorted.filter((contact) => matchesQuery(contact, term));
  });

  readonly totalCount = computed(() => this._contacts().length);
  readonly visibleCount = computed(() => this.filteredContacts().length);

  /** Emails ya usados; el formulario los pasa al validador de email único. */
  emailsExcept(id?: string): string[] {
    return this._contacts()
      .filter((contact) => contact.id !== id && contact.email)
      .map((contact) => contact.email as string);
  }

  setQuery(term: string): void {
    this._query.set(term);
  }

  /**
   * Carga inicial (siembra desde la API la primera vez, luego localStorage).
   *
   * Devuelve una promesa para que quien necesite esperar el resultado pueda
   * hacerlo (p. ej. `ContactFormPage` al entrar por URL directa a "editar"
   * antes de que la lista se haya cargado); quien solo quiere dispararla en
   * segundo plano puede ignorar el valor de retorno.
   */
  load(): Promise<Contact[]> {
    this._status.set('loading');
    this._error.set(null);
    return new Promise<Contact[]>((resolve) => {
      this.repository.getAll().subscribe({
        next: (contacts) => {
          this._contacts.set(contacts);
          this._status.set('loaded');
          resolve(contacts);
        },
        error: () => {
          this._status.set('error');
          this._error.set('No se pudo cargar la lista de contactos.');
          resolve([]);
        },
      });
    });
  }

  findById(id: string): Contact | undefined {
    return this._contacts().find((contact) => contact.id === id);
  }

  create(draft: ContactDraft): Promise<Contact> {
    return toPromise(this.repository.create(draft), (contact) =>
      this._contacts.update((contacts) => [...contacts, contact]),
    );
  }

  update(id: string, draft: ContactDraft): Promise<Contact> {
    return toPromise(this.repository.update(id, draft), (contact) =>
      this._contacts.update((contacts) => contacts.map((c) => (c.id === id ? contact : c))),
    );
  }

  remove(id: string): Promise<void> {
    return toPromise(this.repository.remove(id), () =>
      this._contacts.update((contacts) => contacts.filter((c) => c.id !== id)),
    );
  }

  toggleFavorite(contact: Contact): Promise<Contact> {
    return toPromise(this.repository.setFavorite(contact.id, !contact.favorite), (updated) =>
      this._contacts.update((contacts) => contacts.map((c) => (c.id === updated.id ? updated : c))),
    );
  }

  /** Descarta los datos locales y vuelve a los del JSON semilla. */
  resetToSeed(): void {
    this._status.set('loading');
    this.repository
      .resetToSeed()
      .pipe(finalize(() => this._status.set('loaded')))
      .subscribe((contacts) => this._contacts.set(contacts));
  }
}

function compareContacts(a: Contact, b: Contact): number {
  if (a.favorite !== b.favorite) return a.favorite ? -1 : 1;
  return fullName(a).localeCompare(fullName(b), 'es');
}

function matchesQuery(contact: Contact, term: string): boolean {
  const haystack = [
    fullName(contact),
    contact.email ?? '',
    contact.company ?? '',
    ...contact.phones.map((phone) => phone.number),
  ]
    .join(' ')
    .toLowerCase();
  return haystack.includes(term);
}

/** Adapta un Observable "de una sola emisión" a Promise y aplica el efecto local. */
function toPromise<T>(source: Observable<T>, onSuccess: (value: T) => void): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    source.subscribe({
      next: (value) => {
        onSuccess(value);
        resolve(value);
      },
      error: reject,
    });
  });
}
