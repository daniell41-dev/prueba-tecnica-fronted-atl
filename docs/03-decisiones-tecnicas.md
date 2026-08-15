# 03 - DECISIONES TÉCNICAS

Registro corto de las decisiones de diseño tomadas para este ejercicio y por qué, con
las alternativas que se descartaron.

---

## La "API" es un JSON estático consumido por `HttpClient`

`public/data/contacts.json` se sirve como cualquier archivo estático del `dist/` y se
consume con `HttpClient.get(...)`, no con un `import` de TypeScript. Esto respeta el
enunciado ("la lista inicial se carga desde un JSON que simula la API") de forma
honesta: hay una petición de red real, con sus propios estados de carga y error, en
lugar de datos ya presentes en el bundle. `environment.apiLatencyMs` añade una latencia
artificial en desarrollo para que el spinner y el manejo de errores sean visibles y
testeables.

**Alternativa descartada:** `import contacts from './contacts.json'`. Es más simple,
pero no simula una API — los datos estarían disponibles de forma síncrona desde el
primer render, sin estado de carga.

---

## Persistencia: `localStorage` detrás de un Repository, no un servicio "God"

`ContactRepository` (interfaz + `InjectionToken`) separa el contrato de datos de su
implementación (`LocalStorageContactRepository`). La primera carga siembra desde la API
simulada; desde ahí, `localStorage` es la fuente de verdad. `resetToSeed()` permite
volver al estado original sin borrar el navegador a mano — útil para quien revise el
ejercicio.

**Por qué no `sessionStorage` o IndexedDB:** el enunciado pide explícitamente
`localStorage`. Si se necesitara cambiarlo, solo se toca la implementación detrás del
token; páginas, formularios y el store no se enteran (Dependency Inversion).

---

## Estado con Angular Signals, no NgRx/Akita

`ContactStore` es un servicio `providedIn: 'root'` con signals privados y `computed()`
públicos de solo lectura (`filteredContacts`, `totalCount`, etc.). Para el tamaño de
este ejercicio (una entidad, CRUD simple, sin estado compartido complejo entre módulos
lejanos) una librería de estado añadiría ceremonia sin beneficio real (YAGNI). Signals
da reactividad fina, `OnPush` en todos los componentes y cero dependencias nuevas.

---

## Reactive Forms tipados + `FormArray` para los teléfonos (bonus 1 y 2)

`ContactFormPage` usa un único `FormGroup` tipado (`ContactFormGroup`) para alta y
edición — mismo formulario, misma validación, sin duplicar código entre los dos flujos.
Los teléfonos viven en un `FormArray<PhoneGroup>` con mínimo un elemento
(`minArrayLength(1)`), delegado a un componente hijo (`PhoneFieldsetComponent`) que
agrega/quita filas mutando el mismo array por referencia.

Validadores propios en `core/validators/contact.validators.ts` (reutilizables y
testeados de forma aislada, sin `TestBed`):

- `nameValidator` — letras/acentos/espacios.
- `mxPhoneValidator` — 10 dígitos una vez normalizado (se admite lada `+52`, espacios,
  guiones).
- `minArrayLength` — al menos un teléfono.
- `uniquePhonesValidator` — sin números repetidos dentro del mismo contacto; marca el
  control exacto en rojo, no solo el array.
- `uniqueEmailValidator` — el email (opcional) no puede repetirse entre contactos.

---

## Cancelar sin persistir: dos capas de protección

1. **Botón "Cancelar":** si el formulario está `dirty`, se pide confirmación
   (`ConfirmDialogComponent`) antes de descartar; si no hay cambios, sale directo.
2. **`unsavedChangesGuard` (`CanDeactivate`):** cubre la navegación por fuera del botón
   (back del navegador, cambio de ruta), reutilizando la misma pregunta.

Nada se escribe en `localStorage` hasta que `onSubmit()` llama al repositorio — el
formulario nunca muta el estado global mientras se edita.

---

## Claro/oscuro automático, sin `ThemeService`

Los tokens de color (`src/styles/_tokens.scss`) definen variables CSS para modo claro y
las redefinen bajo `@media (prefers-color-scheme: dark)`. No hay selector manual de tema
ni persistencia de preferencia: el enunciado no lo pide, y añadir un servicio de tema
completo (como en Nimbo) sería alcance fuera de lo solicitado (YAGNI). Si se pidiera más
adelante, el patrón para agregarlo ya está documentado en `project-mobile-ionic`.

---

## i18n en runtime con signals, no `@angular/localize`

El enunciado pide "tres botones que traducen la app" (ES/EN/FR al instante). Angular sí
trae i18n "nativo" (`@angular/localize`, atributos `i18n` + `$localize`), pero es de
**tiempo de compilación**: `ng build --localize` genera un `dist/{es,en,fr}/` distinto
por idioma, y cambiar de idioma en producción significa **navegar a otra URL con recarga
completa de página**. Peor para este ejercicio: `ng serve` solo puede levantar **un
idioma a la vez** (`ng serve --configuration=fr`), así que con `pnpm start` los tres
botones simplemente no funcionarían para quien revise la prueba.

Con eso descartado, la alternativa es estado en runtime. `I18nService` sigue el mismo
patrón que `ContactStore` (signal privado + público de solo lectura), sin agregar
ninguna dependencia nueva:

- **`ngx-translate` u otra librería:** habría sido menos código propio, pero suma
  dependencias externas y rompe la filosofía "cero dependencias de UI" ya aplicada al
  resto del proyecto (SCSS propio, sin librería de componentes — ver más abajo).
- **Diccionarios en TypeScript (`es.ts`/`en.ts`/`fr.ts`), no JSON:** `en.ts` y `fr.ts` se
  tipan con `satisfies TranslationDictionary` (derivado de `keyof typeof ES`), así que si
  a cualquiera de los dos le falta una clave —o le sobra una que no existe en
  español— **no compila**. Con JSON esa garantía no existe: una clave olvidada en inglés
  aparecería en producción como texto en blanco o como la clave cruda, no como un error
  de build. `translations.spec.ts` repite la verificación en runtime como red de
  seguridad doble (además detecta valores vacíos, algo que TypeScript no puede ver).
- **Por qué `t()` funciona con `OnPush` sin código extra:** Angular registra una vista
  como dependiente de cualquier signal que lea durante el renderizado — incluida una
  leída indirectamente a través de una llamada a método como `i18n.t(...)`. Cambiar el
  signal `locale` re-renderiza automáticamente cualquier plantilla que llamó a `t()`, sin
  `ChangeDetectorRef` ni `markForCheck()` manual. Verificado explícitamente en
  `core/i18n/i18n-reactivity.spec.ts`.

### Excepción documentada a "shared/ sin servicios de core"

La regla de `docs/02-arquitectura-y-buenas-practicas.md` prohíbe que `shared/components`
inyecte servicios de `core` (mantiene los componentes presentacionales puros). Se hizo
una excepción explícita para `I18nService`: traducir texto es infraestructura de UI
transversal, no estado de negocio — el mismo argumento por el que nadie cuestiona que un
componente presentacional use `DatePipe` o `CurrencyPipe`. La alternativa (pasar cada
string traducido como `@Input()` desde cada página) habría multiplicado el
prop-drilling sin aportar ningún beneficio real de desacoplamiento, porque el "acoplamiento"
real que la regla busca evitar es con la *entidad contacto* (`ContactStore`,
repositorios), no con el idioma de la interfaz.

---

## Sin librería de componentes UI

Todo el UI (`shared/components/*`) es SCSS propio sobre tokens, sin Angular Material ni
Ionic. Mantiene el bundle pequeño y hace explícito cada patrón de accesibilidad (hit
targets de 44px, `aria-*`, `role="alertdialog"`, backdrop como `<button>` enfocable en
vez de un `<div>` con solo `click`) en lugar de depender de que la librería ya lo
resuelva.

---

## Un solo breakpoint compartido, no media queries repetidas por componente

`src/styles/_breakpoints.scss` expone `$mobile-compact: 380px` vía
`stylePreprocessorOptions.includePaths` en `angular.json` (`@use 'breakpoints' as bp;`
en cualquier `.scss`, sin rutas relativas). Antes de esto había un `420px` suelto en
`contact-form.page.scss`; con un idioma como el francés (~30% más largo que el español
en promedio) y una fila de teléfono a tres columnas (`112px 1fr auto`), el ancho
disponible para el número quedaba tan justo a 320px que el `<select>` de tipo llegaba a
truncar "Domicilio". La corrección: por debajo de `$mobile-compact` la etiqueta ocupa la
fila completa y el número comparte fila solo con el botón de quitar; de
`$mobile-compact` en adelante vuelve a las tres columnas en línea. Verificado con
capturas de Playwright a 320/375/414/768px en los tres idiomas (el peor caso, francés,
sin overflow horizontal ni truncamiento).
