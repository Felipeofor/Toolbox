# History — Toolbox Challenge

> Tareas completadas (movidas desde board.md → DONE → aquí).
> Formato: `## [Fecha] T## — título` + breve nota de qué quedó hecho.

## 2026-05-13 — T01 Scaffold monorepo

- `api/` con `package.json` (engines node 14.x, scripts start/test/lint), `.nvmrc=14`, `.gitignore`, README + carpetas `src/`, `test/`, `config/`.
- `web/` con `package.json` (engines node 16.x, scripts start/build/test), `.nvmrc=16`, `.gitignore`, README + carpetas `src/`, `public/`.
- `.gitignore` raíz con node_modules, dist, coverage, logs, IDE files, secretos (.env, .pem, .key).
- `README.md` raíz con estructura, instrucciones local sin Docker, endpoints, scripts, referencia a `progress/board.md`.
- Ambos `package.json` validados con `JSON.parse`.
