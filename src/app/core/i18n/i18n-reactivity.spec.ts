import { TestBed } from '@angular/core/testing';

import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { I18nService } from './i18n.service';

/**
 * Verifica el supuesto clave del que depende toda la extracción de textos:
 * un componente `OnPush` que llama a `i18n.t()` desde su plantilla se
 * actualiza al cambiar el idioma, aunque ninguno de sus `@Input()` cambie.
 * Esto funciona porque la lectura de una signal dentro de una plantilla
 * registra esa vista como "sucia" cuando la signal cambia, incluso con
 * `OnPush` — es el mecanismo, documentado en `i18n.service.ts`, en el que se
 * apoyan todas las plantillas de `features/` y `shared/`.
 */
describe('Reactividad de I18nService en componentes OnPush', () => {
  it('SpinnerComponent refleja el nuevo idioma sin tocar sus inputs', () => {
    TestBed.configureTestingModule({ imports: [SpinnerComponent] });
    const fixture = TestBed.createComponent(SpinnerComponent);
    const i18n = TestBed.inject(I18nService);
    i18n.setLocale('es');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Cargando…');

    i18n.setLocale('fr');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Chargement…');
    expect(fixture.nativeElement.textContent).not.toContain('Cargando…');
  });
});
