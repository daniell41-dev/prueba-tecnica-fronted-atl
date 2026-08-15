import { TestBed } from '@angular/core/testing';

import { STORAGE_KEYS } from '../constants/storage.constants';
import { I18nService } from './i18n.service';

describe('I18nService', () => {
  const originalLanguageDescriptor = Object.getOwnPropertyDescriptor(navigator, 'language');

  function setBrowserLanguage(language: string): void {
    Object.defineProperty(navigator, 'language', { value: language, configurable: true });
  }

  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEYS.locale);
  });

  afterEach(() => {
    localStorage.removeItem(STORAGE_KEYS.locale);
    // `language` normalmente vive en el prototipo de `Navigator`, no como
    // propiedad propia: `getOwnPropertyDescriptor` da `undefined` y hay que
    // *borrar* la propiedad propia que creamos (no redefinirla), para que
    // vuelva a resolverse por el getter del prototipo. Si no, el valor de
    // prueba se queda "pegado" para el resto de la suite.
    if (originalLanguageDescriptor) {
      Object.defineProperty(navigator, 'language', originalLanguageDescriptor);
    } else {
      delete (navigator as { language?: string }).language;
    }
  });

  it('usa español por defecto si no hay nada guardado ni el navegador lo soporta', () => {
    setBrowserLanguage('de-DE');
    TestBed.configureTestingModule({});
    const service = TestBed.inject(I18nService);

    expect(service.locale()).toBe('es');
  });

  it('detecta el idioma del navegador cuando está soportado', () => {
    setBrowserLanguage('fr-FR');
    TestBed.configureTestingModule({});
    const service = TestBed.inject(I18nService);

    expect(service.locale()).toBe('fr');
  });

  it('prioriza el idioma persistido sobre el del navegador', () => {
    localStorage.setItem(STORAGE_KEYS.locale, JSON.stringify('en'));
    setBrowserLanguage('fr-FR');
    TestBed.configureTestingModule({});
    const service = TestBed.inject(I18nService);

    expect(service.locale()).toBe('en');
  });

  describe('con el servicio ya creado', () => {
    let service: I18nService;

    beforeEach(() => {
      setBrowserLanguage('es-MX');
      TestBed.configureTestingModule({});
      service = TestBed.inject(I18nService);
    });

    it('traduce según el idioma activo', () => {
      expect(service.t('form.save')).toBe('Guardar');
      service.setLocale('en');
      expect(service.t('form.save')).toBe('Save');
      service.setLocale('fr');
      expect(service.t('form.save')).toBe('Enregistrer');
    });

    it('interpola parámetros en las claves que los usan', () => {
      expect(service.t('detail.deleteConfirmMessage', { name: 'Ana Pérez' })).toBe(
        'Se eliminará a Ana Pérez de forma permanente.',
      );
    });

    it('deja el placeholder intacto si falta un parámetro', () => {
      expect(service.t('detail.deleteConfirmMessage')).toBe(
        'Se eliminará a {name} de forma permanente.',
      );
    });

    it('persiste el idioma elegido', () => {
      service.setLocale('fr');
      expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.locale)!)).toBe('fr');
    });

    it('sincroniza document.documentElement.lang y el título', () => {
      service.setLocale('en');
      expect(document.documentElement.lang).toBe('en');
      expect(document.title).toBe('Contacts');

      service.setLocale('fr');
      expect(document.documentElement.lang).toBe('fr');
      expect(document.title).toBe('Contacts');
    });

    it('expone las opciones del switcher en orden estable', () => {
      expect(service.options.map((option) => option.code)).toEqual(['es', 'en', 'fr']);
    });
  });
});
