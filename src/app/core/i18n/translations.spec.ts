import { EN } from './translations/en';
import { ES } from './translations/es';
import { FR } from './translations/fr';

/**
 * Red de seguridad en runtime para la paridad de claves entre diccionarios.
 *
 * El tipo `satisfies TranslationDictionary` de `en.ts`/`fr.ts` ya obliga a
 * esto en tiempo de compilación (ver comentarios ahí), pero un test explícito
 * deja el contrato documentado y detecta además "traducciones fantasma"
 * (valores vacíos) que TypeScript no puede ver.
 */
describe('Paridad de traducciones (es/en/fr)', () => {
  const dictionaries = { es: ES, en: EN, fr: FR } as const;
  const referenceKeys = Object.keys(ES).sort();

  for (const [locale, dictionary] of Object.entries(dictionaries)) {
    it(`${locale}: tiene exactamente las mismas claves que es`, () => {
      expect(Object.keys(dictionary).sort()).toEqual(referenceKeys);
    });

    it(`${locale}: ninguna traducción está vacía`, () => {
      const empty = Object.entries(dictionary).filter(([, value]) => !value.trim());
      expect(empty).toEqual([]);
    });
  }

  it('en y fr no dejan ninguna clave igual al texto en español (traducción olvidada)', () => {
    const suspects: string[] = [];
    for (const key of referenceKeys as (keyof typeof ES)[]) {
      if (EN[key] === ES[key]) suspects.push(`en.${key}`);
      if (FR[key] === ES[key]) suspects.push(`fr.${key}`);
    }
    // Algunas claves son legítimamente iguales entre idiomas (marcas, "Mobile",
    // símbolos ★/☆...); se listan explícitamente para no generar falsos positivos.
    const allowedSameAsSpanish = new Set([
      'app.title',
      'detail.back',
      'list.title',
      'phone.mobile',
      'phone.other',
    ]);
    const unexpected = suspects.filter((entry) => {
      const key = entry.split('.').slice(1).join('.');
      return !allowedSameAsSpanish.has(key);
    });
    expect(unexpected).toEqual([]);
  });
});
