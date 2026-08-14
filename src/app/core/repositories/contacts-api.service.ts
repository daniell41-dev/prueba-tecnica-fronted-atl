import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { delay, identity, map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Contact } from '../models/contact.model';
import { toContacts } from './contact.adapter';
import { ContactsResponseDto } from './contact.dto';

/**
 * Acceso a la "API" de contactos.
 *
 * En el ejercicio el backend es un JSON estático (`public/data/contacts.json`)
 * servido por el propio dev server, pero se consume con `HttpClient` exactamente
 * igual que un REST real: cambiar a un backend de verdad es cambiar la URL de
 * `environment`, nada más.
 *
 * La latencia artificial (`environment.apiLatencyMs`) existe para que los
 * estados de carga y error de la UI sean visibles y testeables.
 */
@Injectable({ providedIn: 'root' })
export class ContactsApiService {
  private readonly http = inject(HttpClient);

  /** Carga inicial de contactos desde la API simulada. */
  getContacts(): Observable<Contact[]> {
    return this.http.get<ContactsResponseDto>(environment.contactsApiUrl).pipe(
      map((response) => toContacts(response?.contacts ?? [])),
      environment.apiLatencyMs > 0 ? delay(environment.apiLatencyMs) : identity,
    );
  }
}
