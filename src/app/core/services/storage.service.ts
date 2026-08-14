import { Injectable } from '@angular/core';

/**
 * Abstracción de almacenamiento persistente clave-valor.
 *
 * Es la única puerta de acceso a `localStorage` en toda la app: el resto del
 * código depende de esta clase, no de la API del navegador (Dependency
 * Inversion). Gracias a eso se puede sustituir por `sessionStorage`, IndexedDB
 * o un backend real sin tocar repositorios ni componentes, y se puede mockear
 * en tests.
 *
 * Todas las operaciones son tolerantes a fallos: en modo privado de Safari o
 * con la cuota llena `localStorage` lanza excepciones, y una app de contactos
 * no debería romperse por eso.
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  /** Lee y deserializa un valor. Devuelve `null` si no existe o está corrupto. */
  getJSON<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? null : (JSON.parse(raw) as T);
    } catch {
      return null;
    }
  }

  /** Serializa y guarda un valor. Devuelve `false` si el navegador lo impide. */
  setJSON<T>(key: string, value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      // Sin almacenamiento disponible no hay nada que limpiar.
    }
  }
}
