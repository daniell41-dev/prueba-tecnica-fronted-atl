import { TestBed } from '@angular/core/testing';

import { StorageService } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;
  const key = 'test-key';

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StorageService);
    localStorage.removeItem(key);
  });

  afterEach(() => {
    localStorage.removeItem(key);
  });

  it('devuelve null cuando la clave no existe', () => {
    expect(service.getJSON(key)).toBeNull();
  });

  it('guarda y recupera un valor serializado', () => {
    const value = { a: 1, b: ['x', 'y'] };
    expect(service.setJSON(key, value)).toBeTrue();
    expect(service.getJSON(key)).toEqual(value);
  });

  it('devuelve null si el JSON guardado está corrupto', () => {
    localStorage.setItem(key, '{not-json');
    expect(service.getJSON(key)).toBeNull();
  });

  it('remove borra la clave', () => {
    service.setJSON(key, { a: 1 });
    service.remove(key);
    expect(service.getJSON(key)).toBeNull();
  });
});
