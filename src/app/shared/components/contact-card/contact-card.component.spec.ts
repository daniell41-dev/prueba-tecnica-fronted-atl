import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { Contact } from '../../../core/models/contact.model';
import { ContactCardComponent } from './contact-card.component';

const CONTACT: Contact = {
  id: '1',
  firstName: 'Ana',
  lastName: 'Pérez',
  email: null,
  company: 'Atlantis',
  phones: [{ id: 'p1', label: 'mobile', number: '5511112222' }],
  favorite: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('ContactCardComponent', () => {
  let fixture: ComponentFixture<ContactCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ContactCardComponent] });
    fixture = TestBed.createComponent(ContactCardComponent);
    fixture.componentRef.setInput('contact', CONTACT);
    fixture.detectChanges();
  });

  it('muestra el nombre completo', () => {
    const name = fixture.debugElement.query(By.css('.contact-card__name'));
    expect(name.nativeElement.textContent.trim()).toBe('Ana Pérez');
  });

  it('muestra la empresa cuando existe (antes que el teléfono)', () => {
    const meta = fixture.debugElement.query(By.css('.contact-card__meta'));
    expect(meta.nativeElement.textContent.trim()).toBe('Atlantis');
  });

  it('la estrella refleja el estado de favorito', () => {
    const star = fixture.debugElement.query(By.css('.contact-card__favorite'));
    expect(star.nativeElement.textContent.trim()).toBe('☆');
    expect(star.attributes['aria-pressed']).toBe('false');
  });

  it('emite favoriteToggled sin propagar el click al contenedor', () => {
    const emitted = jasmine.createSpy('favoriteToggled');
    fixture.componentInstance.favoriteToggled.subscribe(emitted);

    const noop = (): void => undefined;
    const star = fixture.debugElement.query(By.css('.contact-card__favorite'));
    star.triggerEventHandler('click', { preventDefault: noop, stopPropagation: noop });

    expect(emitted).toHaveBeenCalled();
  });
});
