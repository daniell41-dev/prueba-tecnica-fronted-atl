import { inject, InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { Contact, ContactDraft } from '../models/contact.model';
import { LocalStorageContactRepository } from './local-storage-contact.repository';

/**
 * Repositorio de contactos (patrón Repository / GoF).
 *
 * Define **qué** operaciones de datos existen, sin decir **dónde** viven los
 * datos. El store y las páginas dependen de esta abstracción, así que cambiar
 * `localStorage` por una API REST se reduce a registrar otra implementación en
 * el token (Open/Closed + Dependency Inversion).
 *
 * Se modela como interfaz + `InjectionToken` —en lugar de clase abstracta— para
 * evitar un ciclo de imports en tiempo de ejecución: la implementación solo
 * importa el *tipo* de esta interfaz.
 */
export interface ContactRepository {
  /** Todos los contactos. Siembra desde la API la primera vez. */
  getAll(): Observable<Contact[]>;
  getById(id: string): Observable<Contact | undefined>;
  create(draft: ContactDraft): Observable<Contact>;
  update(id: string, draft: ContactDraft): Observable<Contact>;
  remove(id: string): Observable<void>;
  /** Marca/desmarca favorito sin tocar el resto del contacto. */
  setFavorite(id: string, favorite: boolean): Observable<Contact>;
  /** Descarta los cambios locales y vuelve a los datos de la API. */
  resetToSeed(): Observable<Contact[]>;
}

export const CONTACT_REPOSITORY = new InjectionToken<ContactRepository>('ContactRepository', {
  providedIn: 'root',
  factory: () => inject(LocalStorageContactRepository),
});
