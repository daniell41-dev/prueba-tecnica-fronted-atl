# Agenda de contactos — prueba técnica Frontend

Aplicación Angular que carga una lista de contactos desde un JSON que simula una API,
permite agregarlos y editarlos con **Reactive Forms** validados, y guarda los cambios en
**`localStorage`** (o los descarta con **Cancelar**). Cada contacto admite **uno o varios
números de teléfono**. La interfaz completa se traduce al instante entre **español,
inglés y francés**, y está pensada mobile-first.

> ⏱️ **Tiempo invertido:** ~2.5 horas — incluye planificación, implementación y pruebas
> QA. Desglose al final de este README.

---

## Índice

- [Funcionalidad](#funcionalidad)
- [Stack](#stack)
- [Cómo correr el proyecto (paso a paso)](#cómo-correr-el-proyecto-paso-a-paso)
- [Scripts disponibles](#scripts-disponibles)
- [Cómo se simula la API](#cómo-se-simula-la-api)
- [Idiomas (i18n)](#idiomas-i18n)
- [Soporte mobile](#soporte-mobile)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Arquitectura](#arquitectura)
- [Testing](#testing)
- [Flujo de Git](#flujo-de-git)
- [Documentación adicional](#documentación-adicional)

---

## Funcionalidad

- **Lista de contactos** con buscador (nombre, empresa, correo o teléfono), favoritos
  primero y orden alfabético, y estados de carga / vacío / error con reintento.
- **Alta y edición** de contactos en el mismo formulario (Reactive Forms tipado).
- **Guardar o cancelar:** nada se persiste hasta pulsar "Guardar"; "Cancelar" descarta
  los cambios (con confirmación si hay algo sin guardar) y protege también la
  navegación hacia afuera del formulario (back del navegador).
- **Uno o varios teléfonos por contacto** (`FormArray`): agregar, quitar, tipo
  (móvil/casa/trabajo/otro), validados a 10 dígitos MX y sin duplicados.
- **Validación completa:** nombre/apellido requeridos, correo con formato válido y
  único entre contactos, empresa con límite de caracteres, mensajes de error bajo cada
  campo.
- **Detalle del contacto**, marcar/desmarcar favorito, eliminar con confirmación, y
  "restablecer datos de ejemplo" para volver al JSON semilla en cualquier momento.
- **Persistencia real:** los cambios sobreviven a recargar la página (`localStorage`).
- **Tres idiomas (ES/EN/FR)** con cambio instantáneo desde la barra superior, sin
  recargar la página; el idioma elegido se recuerda entre sesiones.
- **Mobile-first:** probado sin scroll horizontal ni truncamientos a 320/375/414/768px,
  en los tres idiomas.

## Stack

- **Angular 20** (standalone components, signals, `@if`/`@for`)
- **TypeScript** estricto
- **Reactive Forms** (`FormGroup` / `FormArray` tipados) — bonus 1
- **RxJS** + `HttpClient` para el consumo de la API simulada
- **SCSS** con design tokens propios (sin librería de UI), claro/oscuro automático,
  responsive con un breakpoint compartido
- **i18n propio en runtime** (signals + diccionarios TypeScript tipados) — sin
  `@angular/localize` ni librerías de traducción externas
- **Karma + Jasmine** para pruebas unitarias
- **pnpm** como gestor de paquetes

---

## Cómo correr el proyecto (paso a paso)

### 1. Requisitos previos

- **Node.js** 20 o superior
- **pnpm** 10 o superior (`npm install -g pnpm` si no lo tienes)

### 2. Clonar e instalar dependencias

```bash
git clone <url-del-repo>
cd prueba-tecnica-fronted-atl
pnpm install
```

### 3. Levantar el servidor de desarrollo

```bash
pnpm start
```

Abre **http://localhost:4200** — la app carga automáticamente los 8 contactos de
ejemplo (`public/data/contacts.json`) la primera vez y luego trabaja contra
`localStorage`.

### 4. Verificar que todo está en verde (opcional pero recomendado)

```bash
pnpm lint        # ESLint
pnpm build       # build de producción → ./dist/contacts-app
pnpm test:ci     # tests unitarios en Chrome headless
```

### 5. Explorar la app

- **Lista** (`/contacts`): busca, marca favoritos, entra a un contacto.
- **+ Nuevo** (`/contacts/new`): crea un contacto con uno o varios teléfonos.
- **Editar** (`/contacts/:id/edit`): modifica y guarda, o cancela sin perder los datos
  originales.
- **Restablecer datos de ejemplo**: botón visible cuando la lista queda vacía; también
  se puede volver a este estado borrando la clave `contacts-app.contacts` de
  `localStorage` desde las DevTools.

---

## Scripts disponibles

| Comando | Qué hace |
|---|---|
| `pnpm start` | Dev server en `http://localhost:4200` |
| `pnpm build` | Build de producción en `./dist/contacts-app` |
| `pnpm watch` | Build en modo desarrollo con watch |
| `pnpm lint` | ESLint (`@angular-eslint`) |
| `pnpm test` | Tests unitarios con navegador (Karma + Jasmine) |
| `pnpm test:ci` | Tests unitarios headless (Chrome sin sandbox, para CI) |

---

## Cómo se simula la API

`public/data/contacts.json` se sirve como archivo estático y se consume con
`HttpClient.get(...)` — una petición HTTP real, no un `import` de TypeScript — para que
la app tenga sus propios estados de carga y error, igual que contra un backend real:

```
public/data/contacts.json          (DTO snake_case: first_name, phones[].type, ...)
   → ContactsApiService (HttpClient)
      → contact.adapter.ts          (normaliza teléfonos y mapea al modelo de dominio)
         → LocalStorageContactRepository
             — primera vez: no hay nada en localStorage → pide el JSON → lo persiste
             — siguientes veces: localStorage es la fuente de verdad
```

Todo el CRUD (crear, editar, eliminar, favorito) escribe en `localStorage` a través del
mismo repositorio. El botón **"Restablecer datos de ejemplo"** borra lo local y vuelve a
pedir el JSON original.

---

## Idiomas (i18n)

Los tres botones de la barra superior (🇲🇽 ES / 🇬🇧 EN / 🇫🇷 FR) traducen **toda** la
interfaz al instante — formularios, validaciones, diálogos, notificaciones — sin recargar
la página. El idioma elegido se guarda en `localStorage` y se recupera al volver; si no
hay nada guardado, se detecta el idioma del navegador.

> **¿Por qué no `@angular/localize`** (el i18n "nativo" de Angular)? Porque es de
> **tiempo de compilación**: genera un bundle distinto por idioma y cambiar de idioma
> significa navegar a otra URL con recarga completa — además `ng serve` solo puede
> levantar un idioma a la vez, así que con `pnpm start` los tres botones no
> funcionarían. Detalle completo en
> [`docs/03-decisiones-tecnicas.md`](docs/03-decisiones-tecnicas.md).

Para agregar un texto nuevo: agregar la clave en `core/i18n/translations/es.ts` y en
`en.ts`/`fr.ts` — si falta en cualquiera de los dos, **el build falla** (`en.ts`/`fr.ts`
se tipan con `satisfies TranslationDictionary`, derivado de las claves de `es.ts`).

## Soporte mobile

Probado con capturas automatizadas (Playwright) en **320 / 375 / 414 / 768px**, en los
tres idiomas — sin scroll horizontal ni texto truncado. El caso más exigente (fila de
teléfono con etiqueta + número a 320px en francés, el idioma con textos más largos) usa
un layout apilado por debajo de `380px` (`src/styles/_breakpoints.scss`) y pasa a tres
columnas en pantallas más anchas.

---

## Estructura del proyecto

```
src/app/
├── core/                         # Lógica de datos y dominio (singleton)
│   ├── models/                    # Contact, Phone, ContactDraft, errores de dominio
│   ├── repositories/               # DTO, adapter, ContactsApiService, ContactRepository
│   │                               #   (interfaz + token) y su implementación localStorage
│   ├── services/                   # StorageService, IdService, ContactStore, ToastService
│   ├── guards/                     # unsavedChangesGuard
│   ├── validators/                 # Validadores de Reactive Forms del dominio
│   ├── constants/
│   └── i18n/                       # I18nService + diccionarios es/en/fr tipados
│
├── shared/                        # Componentes y pipes reutilizables (presentacionales)
│   ├── components/                 # avatar, contact-card, search-field, empty-state,
│   │                               #   confirm-dialog, field-error, spinner, toast,
│   │                               #   language-switcher
│   └── pipes/                      # initials, phoneFormat
│
├── features/contacts/             # Páginas de la feature, lazy-loaded
│   ├── contact-list/
│   ├── contact-detail/
│   └── contact-form/
│       └── components/phone-fieldset/  # FormArray de teléfonos (bonus 2)
│
└── app.ts · app.config.ts · app.routes.ts

public/data/contacts.json          # "API" simulada (8 contactos de ejemplo, es-MX)
```

## Arquitectura

Arquitectura por capas (`core / shared / features`) con **Repository**, **Adapter** y
**Facade** para desacoplar de dónde vienen los datos, y componentes contenedores
(páginas) vs. presentacionales (`shared/`). Detalle completo, convenciones y principios
SOLID aplicados en **[`docs/02-arquitectura-y-buenas-practicas.md`](docs/02-arquitectura-y-buenas-practicas.md)**.
El porqué de cada decisión relevante (estado con signals, `localStorage` detrás de un
token, Reactive Forms con `FormArray`, etc.) está en
**[`docs/03-decisiones-tecnicas.md`](docs/03-decisiones-tecnicas.md)**.

## Testing

Suite de **90 pruebas unitarias** (Jasmine) cubriendo el adaptador de datos, el
repositorio sobre `localStorage`, el store de estado, los validadores de formulario, los
pipes, el servicio de i18n (paridad de claves ES/EN/FR, persistencia, reactividad con
`OnPush`) y los componentes/páginas clave (incluida la validación y el `FormArray` de
teléfonos del formulario):

```bash
pnpm test:ci
```

## Flujo de Git

Este repo sigue Conventional Commits y un flujo `feature → develop → main` documentado
en **[`docs/01-flujo-git-github.md`](docs/01-flujo-git-github.md)**.

## Documentación adicional

- [`docs/01-flujo-git-github.md`](docs/01-flujo-git-github.md) — flujo Git/GitHub.
- [`docs/02-arquitectura-y-buenas-practicas.md`](docs/02-arquitectura-y-buenas-practicas.md) — arquitectura, convenciones, SOLID.
- [`docs/03-decisiones-tecnicas.md`](docs/03-decisiones-tecnicas.md) — decisiones técnicas y alternativas descartadas.

---

### Desglose del tiempo invertido

**Total: ~2.5 horas.** No es solo tiempo de código: incluye planificación previa y
verificación posterior, tal como se haría en un entregable profesional.

| Etapa | Incluye |
|---|---|
| Planificación y diseño | Definir alcance, arquitectura por capas, modelo de datos, stack y convenciones antes de escribir código |
| Implementación base | Scaffolding, capa `core` (modelos/repositorio/store), UI y features de contactos (lista, alta, edición, cancelar, bonus 1 y 2) |
| Features adicionales | i18n en tiempo de ejecución (ES/EN/FR) y ajustes de soporte mobile |
| Pruebas QA | Suite de 91 tests unitarios, lint, build, y verificación manual del flujo completo (crear, editar, cancelar, validar, persistir, cambiar de idioma) en distintos anchos de pantalla |

Este proyecto se desarrolló con **Claude Code** como herramienta de desarrollo asistido
por IA, bajo la dirección y revisión del autor.
