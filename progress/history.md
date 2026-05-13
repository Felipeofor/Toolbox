# History — Toolbox Challenge

> Tareas completadas (movidas desde board.md → DONE → aquí).
> Formato: `## [Fecha] T## — título` + breve nota de qué quedó hecho.

## 2026-05-13 — T01 Scaffold monorepo

- `api/` con `package.json` (engines node 14.x, scripts start/test/lint), `.nvmrc=14`, `.gitignore`, README + carpetas `src/`, `test/`, `config/`.
- `web/` con `package.json` (engines node 16.x, scripts start/build/test), `.nvmrc=16`, `.gitignore`, README + carpetas `src/`, `public/`.
- `.gitignore` raíz con node_modules, dist, coverage, logs, IDE files, secretos (.env, .pem, .key).
- `README.md` raíz con estructura, instrucciones local sin Docker, endpoints, scripts, referencia a `progress/board.md`.
- Ambos `package.json` validados con `JSON.parse`.

## 2026-05-13 — T02 Inicializar repo git

- `git init -b main` en raíz.
- Config git local (no global): `user.name=Felipe Ramos`, `user.email=felipeofor@gmail.com`.
- `.claude/settings.local.json` excluido (agregado a `.gitignore` raíz).
- Commit inicial `b7231e4` con scaffold (16 files, 670 inserciones). Mensaje convencional `chore: scaffold monorepo (api + web)`.
- Remote `origin = https://github.com/Felipeofor/Toolbox.git`.
- Push exitoso a `origin/main` con tracking.

## 2026-05-13 — T03 Setup base API

- Deps prod: `express`, `cors`, `pino`, `pino-http`, `config`, `axios`.
- DevDeps: `mocha`, `chai`, `nock`, `supertest`, `standard`.
- `config/default.json`: server.port=3000, externalApi.baseUrl + token + timeoutMs + downloadConcurrency, log.level=info.
- `config/test.json`: port=0, log.level=silent (tests mudos).
- `src/logger.js`: pino con timestamp ISO, level desde config.
- `src/app.js`: factory `buildApp()`. Middlewares: cors (origin desde config), pino-http. Endpoint `/health` → 200 `{status:"ok"}`. Router `/files` (stub). Handlers 404 y 500 con JSON tipado.
- `src/index.js`: entry point; carga config, llama `buildApp()`, `app.listen(port)`.
- `src/routes/files.js`: stub para T03; routes reales en T06..T08.
- Smoke test ejecutado: GET /health → 200, body `{"status":"ok"}`, header `content-type: application/json; charset=utf-8`.
