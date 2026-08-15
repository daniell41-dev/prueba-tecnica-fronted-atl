# CLAUDE.md

Guía operativa para Claude (y cualquier dev) en este repositorio. Léela antes de trabajar.

## Proyecto

**Agenda de contactos** — prueba técnica frontend. Stack: **Angular 20 (standalone) ·
TypeScript · Reactive Forms · localStorage**. Sin backend real: la lista inicial se
carga desde `public/data/contacts.json` vía `HttpClient`, simulando una API.

## Gestor de paquetes: pnpm (obligatorio)

⚠️ **Usa siempre `pnpm`, nunca `npm` ni `yarn`.** El lockfile es `pnpm-lock.yaml`.

```bash
pnpm install         # instalar dependencias
pnpm start           # dev server → http://localhost:4200
pnpm build           # build de producción → ./dist/contacts-app
pnpm lint            # ESLint
pnpm test            # tests (Karma + Jasmine, con navegador)
pnpm test:ci         # tests headless (CI / contenedores)
```

## Antes de terminar una tarea

Ejecuta y deja en verde:

```bash
pnpm lint && pnpm build && pnpm test:ci
```

`pnpm test:ci` requiere Chrome/Chromium disponible; si el binario no está en el `PATH`
del sistema, exporta `CHROME_BIN` apuntando a él antes de correr el comando.

## Convenciones

- **Commits:** Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`,
  `chore:`, `ci:`). Ver `docs/01-flujo-git-github.md`.
- **Ramas:** rama de sesión / `feature/<desc>` desde `develop`; PR a `develop`; PR
  `develop → main` solo a petición explícita.
- **Arquitectura y estilo:** `docs/02-arquitectura-y-buenas-practicas.md` (estructura
  `core/ shared/ features/`, standalone + lazy loading, SOLID, DRY/KISS/YAGNI).
- **Decisiones técnicas:** `docs/03-decisiones-tecnicas.md`.
- **i18n (ES/EN/FR):** ⚠️ ningún texto visible se hardcodea. Toda clave nueva se agrega a
  **los tres** diccionarios (`core/i18n/translations/{es,en,fr}.ts`) — `en.ts`/`fr.ts`
  no compilan si falta o sobra una clave respecto a `es.ts`. Detalle en
  `docs/02-arquitectura-y-buenas-practicas.md` (sección "Internacionalización").

## Documentación del repo

- `README.md` — qué es la app, paso a paso para correrla, capturas de estructura.
- `docs/01-flujo-git-github.md` — flujo Git/GitHub.
- `docs/02-arquitectura-y-buenas-practicas.md` — arquitectura, convenciones, SOLID.
- `docs/03-decisiones-tecnicas.md` — por qué de cada decisión técnica relevante.
