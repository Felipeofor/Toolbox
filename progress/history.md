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

## 2026-05-13 — T10 Dockerfile API

- `api/Dockerfile` multi-stage:
  - Stage `deps`: `node:14-alpine`, `npm ci --omit=dev` (solo prod deps).
  - Stage `runtime`: `node:14-alpine`, NODE_ENV=production, copia `node_modules` desde deps + `package.json` + `src/` + `config/`.
  - EXPOSE 3000.
  - HEALTHCHECK con `wget -qO- /health` cada 10s.
  - CMD `node src/index.js`.
- `api/.dockerignore` excluye node_modules, coverage, test, README, .nvmrc.
- No verificado con `docker build` local (Docker no instalado). El Dockerfile sigue patrones estándar Node y se ejercitará en T17 docker-compose o en entrega.

## 2026-05-13 — T11 + T12 + T13 + T14 Frontend completo

- `package.json`: deps react 18, react-dom, react-bootstrap, bootstrap, react-redux, @reduxjs/toolkit. devDeps @babel/core+preset-env+preset-react, babel-loader, webpack 5 + cli + dev-server, html-webpack-plugin, css-loader, style-loader, jest + jest-environment-jsdom + babel-jest + @testing-library/react + jest-dom.
- `.babelrc`: presets env (esmodules) + react (runtime automatic).
- `webpack.config.js`:
  - Entry `./src/index.jsx`, output con contenthash en prod.
  - Loaders: babel-loader para `.jsx?`, style-loader+css-loader para `.css`.
  - HtmlWebpackPlugin con `public/index.html`.
  - DefinePlugin inyecta `process.env.API_BASE_URL` (default `http://localhost:3000`).
  - devServer puerto 8080 + historyApiFallback + hot.
- `public/index.html` con `<div id="root">`.
- `src/index.jsx`: monta `<Provider store={store}><App/></Provider>` con createRoot. Importa bootstrap CSS.
- `src/App.jsx`: Navbar `bg=dark variant=dark` + Container con `<FilesView/>`.
- `src/store/index.js`: configureStore con reducer `files`.
- `src/store/filesSlice.js`: createSlice con thunks `fetchFilesData(fileName?)` y `fetchFilesList()`. Actions `setFilter`, `clearFilter`. Estado `{data, list, filter, loading, error}`.
- `src/api/client.js`: `fetch` nativo, base URL desde DefinePlugin. Funciones `getFilesData(fileName)` y `getFilesList()`. Errores con `err.status`.
- `src/components/FilesView.jsx`: dispatch inicial en useEffect, renderiza Spinner | Alert | FilesTable.
- `src/components/SearchBar.jsx`: input controlado + datalist autocompleta con `state.files.list` + botones Search/Clear/Refresh.
- `src/components/FilesTable.jsx`: tabla flatten lines en filas con cols File Name / Text / Number / Hex.
- `npm install` exitoso (935 paquetes). `npx webpack --mode production` build limpio (warnings esperados de tamaño bundle 1.22 MiB).

## 2026-05-13 — T15 Tests Jest

- `jest.config.js`: testEnvironment jsdom, transform babel-jest, moduleNameMapper para CSS/SVG, testMatch test/**/*.test.{js,jsx}.
- `jest.env.js`: setea `API_BASE_URL` para tests.
- `test/__mocks__/styleMock.js`: stub para CSS imports.
- `test/FilesTable.test.jsx`: 2 tests (empty state + flatten render). Import directo de `@testing-library/jest-dom` para matchers.
- `test/filesSlice.test.js`: 5 tests (initial state, setFilter, clearFilter, fetchFilesData fulfilled, fetchFilesData rejected, fetchFilesList fulfilled). Mockea `global.fetch`.
- `npx jest` exit 0, 7/7 tests pasando.

## 2026-05-13 — T16 + T17 Docker web + compose

- `web/Dockerfile` multi-stage:
  - Stage `build`: `node:16-alpine`, `npm ci`, copia `.babelrc`, `webpack.config.js`, `public/`, `src/`. ARG `API_BASE_URL` inyectado en ENV antes de `npm run build`.
  - Stage `runtime`: `nginx:alpine`. Copia `nginx.conf` a `/etc/nginx/conf.d/default.conf` y `dist/` a `/usr/share/nginx/html`. EXPOSE 80.
- `web/nginx.conf`: server on :80, root html, gzip básico, `try_files $uri /index.html` para SPA fallback.
- `web/.dockerignore` excluye node_modules, dist, build, coverage, test, jest configs.
- `docker-compose.yml` (raíz):
  - `api`: build `./api`, expose 3000, healthcheck con wget cada 10s contra `/health`.
  - `web`: build `./web` con arg `API_BASE_URL=http://localhost:3000`, mapping 8080→80, `depends_on api: { condition: service_healthy }`.
  - Red `toolbox-net` bridge compartida.
- No verificado con `docker compose up` (Docker no instalado local). Sintaxis estándar y testeada en otros proyectos.

## 2026-05-13 — T18 README final

- README raíz reescrito:
  - Header con stack y propósito.
  - Estructura del repo comentada.
  - Instrucciones de "Cómo correr local sin Docker" usando nvm.
  - Instrucciones de "Cómo correr con Docker" (compose up).
  - Tabla de scripts API y Web.
  - Tabla de endpoints + ejemplos curl con jq.
  - Sección "Decisiones técnicas" con justificación de Promise.allSettled, concurrencia, token en config, parser validations, ExternalApiError, logger.
  - Sección frontend con createRoot, Redux Toolkit, DefinePlugin, sin CSS custom, loading/error visibles.
  - Justificación de Node 14/16.
  - Resumen de tests (36 API + 7 web).
  - Checklist de cumplimiento de la consigna (obligatorios + 7 opcionales tildados).

## 2026-05-13 — T19 Push final a origin/main

- Smoke previo al push:
  - API: `npm test` 36/36 ✓, `npm run lint` (standard) exit 0 ✓.
  - Web: `npm test` 7/7 ✓.
- Commits acumulados pusheados a `origin/main`:
  - `b7231e4` chore: scaffold monorepo
  - `bb56e3c` feat(api): setup base Express + /health
  - `94af820` feat(api): /files endpoints + CSV parsing + standard lint
  - `e8e619c` feat: frontend + Dockerfiles + compose + README final
- `git push` → fast-forward `b7231e4..e8e619c`.
- Repo público: https://github.com/Felipeofor/Toolbox
- Pendiente `MANUAL`: enviar URL al reclutador.

## 2026-05-13 — T20 Upgrade a arquitectura Sr/Team Lead

### Refactor API → Hexagonal

- `src/domain/`:
  - `errors.js`: `AppError`/`ValidationError`/`NotFoundError`/`UpstreamError` con `status` y `code` propios.
  - `Hex.js`: VO con validación regex en constructor + `isValid()` estático + `toJSON()`.
  - `FileName.js`: VO con whitelist `^[A-Za-z0-9._-]+$` y maxLength 255 (anti path traversal).
  - `FileLine.js`: VO compuesto que rechaza tipos inválidos.
  - `FileEntry.js`: aggregate con `isEmpty()` + `toJSON()`.
- `src/application/files/`:
  - `getAllFilesData.js`: factory `buildGetAllFilesData({ fileSource, parseCsv, logger, concurrency })`. Batches con `Promise.allSettled`. Omite entries vacíos.
  - `getFileData.js`: factory que construye `FileName` (valida input), lista upstream y lanza `NotFoundError` si no existe.
  - `listFiles.js`: passthrough.
- `src/infrastructure/`:
  - `echoServAdapter.js`: factory `buildEchoServAdapter({ config, logger })`. axios instance per-build (no cache global), mapping de errores a `UpstreamError` con status correcto (504 timeout, propaga HTTP cuando hay response).
  - `csvParser.js`: factory `buildParser({ logger })`. Construye `FileLine` con `Hex` VO. Validaciones estrictas.
- `src/interfaces/http/`:
  - `server.js`: factory `buildHttpServer(container)`. Carga OpenAPI YAML al boot. Sirve `/health`, `/ready`, `/files/*`, `/metrics`, `/docs`, `/openapi.json`. Middleware order: helmet → cors → rate-limit → pino-http → metrics.
  - `filesRouter.js`: factory que recibe `useCases`. Usa middleware `validateFileNameQuery`.
  - `healthRouter.js`: `/health` always 200, `/ready` ejecuta `readinessProbe()` (chequea upstream).
  - `middleware/security.js`: helmet + cors (origin de config) + rate limiter.
  - `middleware/errorHandler.js`: mapping centralizado `AppError → HTTP response`.
  - `middleware/validateFileName.js`: chequea param antes de tocar use case.
  - `openapi/openapi.yaml`: spec completo con schemas (FileEntry, FileLine, FileList, HealthStatus, AppError) y responses.
- `src/platform/`:
  - `config.js`: `loadConfig()` retorna POJO desde `node-config`.
  - `logger.js`: `buildLogger({level})` con pino.
  - `metrics.js`: `buildMetrics()` con prom-client (default metrics + http_request_duration histogram + http_requests_total counter + middleware).
  - `container.js`: composition root con overrides para tests.
- `src/index.js`: 10 líneas — entrypoint que solo cablea container + server + listen.

### Tests reorganizados (58 tests)

- `test/domain/`: 17 tests sobre VOs (4 archivos).
- `test/infrastructure/`: 16 tests (csvParser + echoServAdapter con nock).
- `test/application/useCases.test.js`: 7 tests con fakes de FileSource y parseCsv.
- `test/interfaces/http/server.test.js`: 18 tests integración (supertest) cubriendo health, ready, files/data, files/list, metrics, openapi.json, swagger, helmet, 404.
- `test/setup.js` + `.mocharc.json`: bootstrapping de NODE_CONFIG_DIR/NODE_ENV.

### Coverage gate (nyc)

- Thresholds: branches 75, lines 85, functions 85, statements 85.
- Actual: **96.45% / 81.96% / 96.55% / 96.60%** — gate pasa.

### Web polish

- `src/components/ErrorBoundary.jsx`: clase obligatoria (React lo requiere). `getDerivedStateFromError` + fallback Alert con role='alert'.
- `src/store/selectors.js`: `createSelector` memoizado (selectData, selectList, selectFilter, selectLoading, selectError, selectRowCount, selectFlattenedRows con stable keys).
- `src/components/FilesView.jsx`: `React.lazy(() => import('./FilesTable.jsx'))` + `Suspense` con spinner fallback.
- `FilesTable.jsx`: consume `selectFlattenedRows` + `selectRowCount` directamente. Agrega header con count visible.
- `SearchBar.jsx`: `Form.Label` con `htmlFor` + `visually-hidden`, `role='search'`, `aria-label`.
- `FilesView.jsx`: section con heading semántica, `aria-live='polite'`.
- `index.jsx`: wrapper `<ErrorBoundary>` alrededor del Provider.

### Web tests (15)

- `selectors.test.js`: 5 tests incluyendo verificación de memoization.
- `ErrorBoundary.test.jsx`: 2 tests (children OK + fallback en error).
- `FilesTable.test.jsx`: refactor para envolverse en Provider de Redux con preloadedState; agregado test de accessible name.
- `filesSlice.test.js`: 5 tests existentes mantenidos.

### Seguridad e infra

- `helmet` + `cors` + `express-rate-limit` siempre activos.
- `app.disable('x-powered-by')` + `trust proxy` para rate-limit detrás de proxy.
- `/openapi.json` y `/docs` (Swagger UI) sirviendo el contrato.
- `/metrics` para Prometheus scraping.

### CI

- `.github/workflows/ci.yml` con 3 jobs:
  1. `api`: Node 14, npm ci, lint, test (con coverage gate), upload coverage artifact.
  2. `web`: Node 16, npm ci, test --ci, build, upload dist artifact.
  3. `docker`: depende de los anteriores; build de imágenes api y web.

### Resultado pipeline pre-commit

- API: `npm run lint` exit 0; `npm test` 58/58 + coverage 96/82/96/96.
- Web: `npm test` 15/15; `npx webpack --mode production` build OK (1.22 MiB, lazy chunk emitido).
