import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { LanguageOption, LanguageSwitcherComponent } from './language-switcher.component';

const OPTIONS: LanguageOption[] = [
  { code: 'es', flag: '🇲🇽', label: 'Español' },
  { code: 'en', flag: '🇬🇧', label: 'English' },
  { code: 'fr', flag: '🇫🇷', label: 'Français' },
];

describe('LanguageSwitcherComponent', () => {
  let fixture: ComponentFixture<LanguageSwitcherComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [LanguageSwitcherComponent] });
    fixture = TestBed.createComponent(LanguageSwitcherComponent);
    fixture.componentRef.setInput('options', OPTIONS);
    fixture.componentRef.setInput('active', 'en');
    fixture.detectChanges();
  });

  it('pinta un botón por idioma, solo con la bandera (sin texto)', () => {
    const buttons = fixture.debugElement.queryAll(By.css('.language-switcher__btn'));
    expect(buttons.length).toBe(3);
    expect(buttons.map((b) => b.nativeElement.textContent.trim())).toEqual([
      '🇲🇽',
      '🇬🇧',
      '🇫🇷',
    ]);
  });

  it('expone el nombre del idioma como aria-label y title (accesible sin texto visible)', () => {
    const buttons = fixture.debugElement.queryAll(By.css('.language-switcher__btn'));
    expect(buttons.map((b) => b.attributes['aria-label'])).toEqual([
      'Español',
      'English',
      'Français',
    ]);
    expect(buttons.map((b) => b.attributes['title'])).toEqual(['Español', 'English', 'Français']);
  });

  it('marca como activo (aria-pressed) solo el idioma actual', () => {
    const buttons = fixture.debugElement.queryAll(By.css('.language-switcher__btn'));
    const pressed = buttons.map((b) => b.attributes['aria-pressed']);
    expect(pressed).toEqual(['false', 'true', 'false']);
  });

  it('emite localeChange con el código del botón pulsado', () => {
    const emitted = jasmine.createSpy('localeChange');
    fixture.componentInstance.localeChange.subscribe(emitted);

    const buttons = fixture.debugElement.queryAll(By.css('.language-switcher__btn'));
    buttons[2].nativeElement.click();

    expect(emitted).toHaveBeenCalledWith('fr');
  });

  it('actualiza el activo cuando cambia el input', () => {
    fixture.componentRef.setInput('active', 'fr');
    fixture.detectChanges();

    const buttons = fixture.debugElement.queryAll(By.css('.language-switcher__btn'));
    expect(buttons.map((b) => b.attributes['aria-pressed'])).toEqual(['false', 'false', 'true']);
  });
});
