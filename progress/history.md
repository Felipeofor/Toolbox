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

## 2026-05-13 — T04 Cliente API externa

- `src/services/externalApi.js` con:
  - `buildClient()` + `getClient()` cacheado + `_resetClient()` (para tests).
  - Header `Authorization: Bearer <token>` desde config.
  - Timeout configurable (default 10s, test 1s).
  - `listFiles()` valida `Array.isArray(res.data.files)`. Lanza `ExternalApiError` con status 502 si shape inválido.
  - `downloadFile(name)` con `encodeURIComponent`, `responseType: 'text'`, transformResponse identity para no parsear CSV como JSON. Valida nombre no vacío (400).
  - Errores HTTP propagan `status` del response; timeout → 504; otros → 502.
- `test/externalApi.test.js`: 10 tests con nock cubriendo happy path, 404, 500, timeout, shape inválido, nombre vacío.
- Todos los tests pasan (10/10).

## 2026-05-13 — T05 Parser CSV resiliente

- `src/services/csvParser.js`:
  - `parseCsv(content, expectedFileName)` retorna `[{text, number, hex}]`.
  - Header detection: si la primera línea matchea `file,text,number,hex` (case-insensitive), se saltea.
  - Soporta `\n` y `\r\n`.
  - Validaciones por línea (todas obligatorias):
    - Exactamente 4 columnas (no más, no menos).
    - `file` matchea `expectedFileName` cuando se provee.
    - `text` string no vacío.
    - `number` parseable a `Number.isFinite`.
    - `hex` regex `/^[a-f0-9]{32}$/i` (acepta upper/lower case).
  - Líneas vacías se ignoran sin log.
  - Líneas inválidas: logger.debug con line number y raw, luego descartadas.
- `test/csvParser.test.js`: 15 tests cubriendo todos los casos.
- Total tests acumulados: 25/25 pasando.

## 2026-05-13 — T06 + T07 + T08 Rutas /files

- `src/services/filesService.js`:
  - `processFile(name)`: descarga + parsea, retorna null en fallo (loguea warn).
  - `getAllFilesData()`: lista archivos, descarga en batches de `externalApi.downloadConcurrency` (default 5) con `Promise.allSettled`. Omite archivos con 0 líneas válidas.
  - `getFileData(name)`: valida que el archivo esté en el listing externo (404 si no), procesa solo ese.
- `src/routes/files.js`:
  - `GET /files/data` con opcional `?fileName=X`. Valida param no vacío (400).
  - `GET /files/list` passthrough con shape `{files:[...]}`.
  - Content-Type `application/json; charset=utf-8` en todas las respuestas.
  - Errores propagan `err.status` cuando es 4xx/5xx, default 502.
- `test/files.routes.test.js`: 11 tests con supertest + nock:
  - Happy path con múltiples archivos.
  - Un archivo falla descarga (omitido, resto OK).
  - Líneas mixtas válidas/inválidas (archivo con 0 válidas se omite).
  - Listing externo falla (status propagado).
  - Empty listing → `[]`.
  - Filtro fileName: válido, 404 inexistente, 400 empty.
  - `/files/list` happy + 503 propagado.
  - `/health` 200.
- Total tests: 36/36 pasando.

## 2026-05-13 — T09 StandardJS lint

- `package.json` agregado bloque `"standard": {"env": ["mocha"]}` para registrar globals de Mocha.
- `test/csvParser.test.js:60`: cambiado template literal sin interpolación a single-quote string.
- `npx standard 'src/**/*.js' 'test/**/*.js'` → exit 0.
- Tests siguen verdes: 36/36.
