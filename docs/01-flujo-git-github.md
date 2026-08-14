# 01 - FLUJO GIT Y GITHUB

Workflow de Git y GitHub para este repositorio, adaptado del mismo esquema usado en
`project-mobile-ionic`.

---

## 🌳 Estructura de ramas

```
main (producción - protegida)
  ↑
  │ (PR al terminar el ejercicio, solo a petición explícita)
  │
develop (integración - default)
  ↑
  │ (PR de la rama de sesión / feature)
  │
claude/<sesión>  ó  feature/<descripción>
```

- **`main`** — código final entregable. Solo acepta PRs de `develop`. Nunca se trabaja
  directamente aquí.
- **`develop`** — rama de integración; debe estar siempre en verde (`pnpm lint && pnpm
  build && pnpm test:ci`).
- **Rama de trabajo** — en sesiones de Claude Code on the web, la rama asignada por la
  sesión (`claude/<nombre>`); en desarrollo local, `feature/<descripción>` desde
  `develop`.

## ☁️ Adaptación a Claude Code on the web

Cada sesión trabaja sobre su rama de sesión asignada y solo hace push a ella. El flujo
seguido en este ejercicio:

1. Se crea un **issue** en GitHub describiendo el trabajo.
2. Se desarrolla y commitea en la rama de sesión (Conventional Commits).
3. Se abre el **PR: rama de sesión → `develop`**, referenciando el issue con
   `Closes #N`, y se mergea.
4. Al terminar, se avisa que `develop` está listo. El PR **`develop → main`** solo se
   crea si se pide explícitamente — es la única acción que requiere aprobación humana.

---

## 📝 Conventional Commits

```
feat: nueva funcionalidad
fix: corrección de bug
docs: cambios en documentación
style: formato de código (sin cambio lógico)
refactor: refactorización
test: agregar o modificar tests
chore: tareas de mantenimiento
ci: cambios de integración continua

Ejemplos:
feat: add contact form with reactive validation
fix: normalize MX phone numbers before persisting
test: add spec for uniquePhonesValidator
docs: add architecture and setup guide
```

---

## ✅ Checklist de PR (auto-revisión)

**Funcionalidad**
- [ ] La app corre sin errores (`pnpm start`).
- [ ] `pnpm lint` y `pnpm build` sin errores.
- [ ] `pnpm test:ci` en verde.

**Calidad de código**
- [ ] Estructura por capas respetada (`core / shared / features`).
- [ ] Nombres descriptivos (`*.page.ts`, `*.component.ts`, `*.service.ts`, ...).
- [ ] Sin código comentado innecesario ni `console.log` de debug.
- [ ] Cumple SOLID / DRY / KISS (ver `docs/02-arquitectura-y-buenas-practicas.md`).

**Git**
- [ ] Commits con Conventional Commits.
- [ ] El PR está asociado al issue correcto (`Closes #N`).
- [ ] No hay archivos innecesarios (`dist/`, `node_modules/`, `.angular/` ignorados).

---

## 🔐 `.gitignore` esencial

```gitignore
/dist
/node_modules
/.angular/cache
/coverage
src/environments/environment.local.ts
```

No se commitean API keys, tokens ni credenciales — este ejercicio no usa ninguno.
