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

## Sin librería de componentes UI

Todo el UI (`shared/components/*`) es SCSS propio sobre tokens, sin Angular Material ni
Ionic. Mantiene el bundle pequeño y hace explícito cada patrón de accesibilidad (hit
targets de 44px, `aria-*`, `role="alertdialog"`, backdrop como `<button>` enfocable en
vez de un `<div>` con solo `click`) en lugar de depender de que la librería ya lo
resuelva.
