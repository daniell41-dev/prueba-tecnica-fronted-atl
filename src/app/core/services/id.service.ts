import { Injectable } from '@angular/core';

/**
 * Generador de identificadores únicos.
 *
 * Se expone como servicio inyectable (en lugar de llamar a `crypto.randomUUID()`
 * directamente) para poder sustituirlo por una secuencia determinista en los
 * tests y para aislar el fallback de navegadores sin contexto seguro.
 */
@Injectable({ providedIn: 'root' })
export class IdService {
  newId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    // Fallback (contextos no seguros): suficiente para identificar filas locales.
    return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
}
