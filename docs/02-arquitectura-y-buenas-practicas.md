# 02 - ARQUITECTURA Y BUENAS PRÁCTICAS

Reglas de estructura, arquitectura y calidad de código para esta app de contactos
(Angular 20 standalone + TypeScript). Adaptado del mismo esquema usado en el proyecto
**Nimbo** (`project-mobile-ionic`), por eso el estilo y las convenciones son consistentes
entre ambos repos.

---

## 🧱 Estructura de carpetas (Clean / por capas)

```
src/app/
├── core/                      # Lógica singleton de toda la app (se instancia una vez)
│   ├── models/                # Contact, Phone, ContactDraft, errores de dominio
│   ├── repositories/          # DTO de la API, adapter DTO→dominio, ContactsApiService
│   │                          # (HttpClient), ContactRepository (interfaz + token) y su
│   │                          # implementación sobre localStorage
│   ├── services/               # StorageService, IdService, ContactStore, ToastService
│   ├── guards/                 # unsavedChangesGuard (CanDeactivate)
│   ├── validators/             # Validadores de Reactive Forms del dominio "contacto"
│   └── constants/              # Claves de localStorage, etc.
│
├── shared/                    # Reutilizable y SIN estado de negocio (presentacional)
│   ├── components/            # avatar, contact-card, search-field, empty-state,
│   │                          # confirm-dialog, field-error, spinner, toast
│   └── pipes/                 # initials, phoneFormat
│
├── features/contacts/         # Una carpeta por feature; páginas lazy-loaded
│   ├── contact-list/           # Lista + búsqueda + favoritos + estados de carga
│   ├── contact-detail/         # Ficha del contacto (editar / eliminar / favorito)
│   └── contact-form/           # Alta y edición (mismo formulario para ambos modos)
│       └── components/phone-fieldset/  # Sub-formulario "uno o varios teléfonos"
│
├── app.ts · app.config.ts · app.routes.ts
```

### Reglas de dependencia (bajo acoplamiento)

```
features  ──►  shared  ──►  (Angular)
   │
   └────────►  core
```

- `features` puede usar `core` y `shared`.
- `shared` **no** depende de `features` ni de `core/services` (es presentacional y
  genérico: recibe datos por `input()` y emite por `output()`).
- `core` no depende de `features`.
- No hay features hermanas que se importen entre sí (aquí solo existe `contacts`, pero la
  regla queda documentada para cuando se agregue una segunda).

### Flujo de datos (una sola dirección)

```
public/data/contacts.json  (DTO snake_case, simula el backend)
   → contact.adapter.ts        (normaliza teléfonos, mapea DTO → modelo de dominio)
      → ContactsApiService     (HttpClient + latencia simulada configurable)
         → LocalStorageContactRepository
             (siembra desde la API la 1ª vez; localStorage es la fuente de verdad después)
            → CONTACT_REPOSITORY  (InjectionToken = abstracción, Dependency Inversion)
               → ContactStore    (signals: contacts, status, query, computed filtrado)
                  → páginas (contenedores) → componentes shared (presentacionales)
```

---

## 📛 Convenciones de nombres

| Tipo | Sufijo / patrón | Ejemplo |
|------|-----------------|---------|
| Página (ruteable) | `*.page.ts` / `.html` / `.scss` | `contact-list.page.ts` |
| Componente | `*.component.ts` | `contact-card.component.ts` |
| Servicio | `*.service.ts` | `contact-store.service.ts` |
| Modelo / interfaz | `*.model.ts` | `contact.model.ts` |
| Repositorio | `*.repository.ts` | `local-storage-contact.repository.ts` |
| DTO / adapter | `*.dto.ts` / `*.adapter.ts` | `contact.dto.ts` |
| Guard | `*.guard.ts` | `unsaved-changes.guard.ts` |
| Pipe | `*.pipe.ts` | `phone-format.pipe.ts` |

- **Archivos y carpetas:** `kebab-case`.
- **Clases:** `PascalCase`. **Variables/métodos:** `camelCase`.
- **Selectores de componente:** prefijo `app-` (`app-contact-card`).
- Una clase pública por archivo.

---

## 🅰️ Reglas Angular (standalone)

- **Todo standalone.** Sin `NgModule`. Cada componente/página declara sus `imports`.
- **Routing con `provideRouter`** y **lazy loading** por feature (`loadComponent`).
- **`withComponentInputBinding()`**: el `:id` de la ruta llega como `input()` de la
  página, sin inyectar `ActivatedRoute` a mano.
- **Detección de cambios:** `ChangeDetectionStrategy.OnPush` en todos los componentes.
- **Estado reactivo:** signals para estado local/UI (`ContactStore`, formularios,
  banderas de diálogo); RxJS para el flujo de datos asíncrono (`HttpClient`,
  repositorio). No se mezclan sin razón.
- **Inyección:** `inject()` en lugar de inyección por constructor.
- **Plantillas:** control flow nuevo (`@if`, `@for`, `@switch`).

---

## 🧩 Patrón de componentes: contenedor vs presentacional

- **Páginas (`features/contacts/*`) = contenedoras:** obtienen datos de `ContactStore`,
  manejan navegación y orquestan formularios/diálogos.
- **Componentes (`shared/*`) = presentacionales:** reciben datos por `input()`, emiten
  eventos por `output()`. **Sin** acceso a servicios de datos. Reutilizables y
  testeables de forma aislada (ver `contact-card.component.spec.ts`).

---

## 🛠️ Servicios y patrones de diseño (GoF)

- **Repository** — `ContactRepository` (interfaz + `InjectionToken`) desacopla el "qué"
  del "dónde": la UI y el store no saben si los datos vienen de `localStorage`, HTTP o
  memoria.
- **Adapter** — `contact.adapter.ts` traduce el DTO de la API (`snake_case`, teléfonos
  con lada) al modelo de dominio (`Contact`), y viceversa al guardar.
- **Facade** — `ContactStore` es la única puerta de entrada al estado de contactos para
  las páginas; internamente orquesta el repositorio y expone signals de solo lectura.
- **Strategy** (implícito) — cambiar `LocalStorageContactRepository` por una
  implementación 100% HTTP es sustituir la fábrica del `InjectionToken`, sin tocar
  páginas ni componentes.
- **Singleton** — servicios `providedIn: 'root'`.

### SOLID

- **S**RP — cada servicio/componente tiene una responsabilidad (el store no sabe de
  HTTP; el repositorio no sabe de Angular Forms; los validadores no saben de UI).
- **O**CP — se extiende agregando repositorios/validadores nuevos, no modificando los
  existentes.
- **L**SP — cualquier implementación de `ContactRepository` es intercambiable detrás del
  token.
- **I**SP — `ContactDraft` expone solo lo que el formulario debe poder enviar (sin `id`
  ni timestamps, que genera la capa de datos).
- **D**IP — `ContactStore` depende de la interfaz `ContactRepository`, no de
  `localStorage` directamente.

### DRY / KISS / YAGNI

- **DRY** — un solo `ContactFormPage` sirve para alta y edición; validadores y pipes
  compartidos en `core/validators` y `shared/pipes`.
- **KISS** — estado con signals planos, sin librerías de estado externas.
- **YAGNI** — sin backend real, sin i18n completo, sin selector de tema manual (el
  claro/oscuro se resuelve solo con `prefers-color-scheme`): nada que el ejercicio no
  pida.

---

## 🧪 Testing

- **Unitarios:** Jasmine + Karma (`*.spec.ts` junto a cada unidad).
  - `core/repositories/contact.adapter.spec.ts` — normalización de teléfonos y mapeo DTO.
  - `core/repositories/local-storage-contact.repository.spec.ts` — siembra, CRUD,
    persistencia real en `localStorage`.
  - `core/services/contact-store.service.spec.ts` — carga, filtro/orden, mutaciones.
  - `core/services/storage.service.spec.ts` — wrapper de `localStorage`.
  - `core/validators/contact.validators.spec.ts` — nombre, teléfono MX, duplicados,
    email único, mínimo de teléfonos.
  - `shared/pipes/*.spec.ts`, `shared/components/contact-card/*.spec.ts`.
  - `features/contacts/contact-form/contact-form.page.spec.ts` — validación,
    `FormArray` de teléfonos, alta, edición, cancelar con confirmación.
- `pnpm test` (con navegador) en local; `pnpm test:ci` (Chrome headless) en CI.

---

## ✅ Definition of Done (por tarea)

- [ ] Cumple la estructura de carpetas y convenciones de nombres.
- [ ] Componentes standalone; `OnPush`; lazy loading si es página.
- [ ] Sin errores de `pnpm lint` ni de `pnpm build`.
- [ ] Lógica de negocio en `core`; UI reutilizable en `shared`.
- [ ] Tests unitarios de la lógica nueva.
- [ ] Sin `console.log` de debug ni código muerto.
- [ ] Commit con Conventional Commits.
