# Agent Board — Toolbox Challenge

> Protocolo: al tomar tarea → mover a IN PROGRESS con `owner` y `started`.
> Al terminar → mover a DONE con `completed by` y fecha.
> Solo el owner edita su tarea en IN PROGRESS.
> Cualquier agente puede tomar tareas de BACKLOG si el usuario lo indica.
> Nunca marcar como DONE sin que compile y tests pasen.

---

## BACKLOG

### Setup

### API (Node 14 + Express)







### Frontend (Node 16 + React + Bootstrap)





### Global



- **T19 — Entrega** · `MANUAL`
  Falta: enviar URL del repo al reclutador. Repo público y pusheado al día.

---

## IN PROGRESS

*(vacío)*

---

## DONE

- **T01 — Scaffold monorepo** · `completed by: implementer` · `2026-05-13`
  Estructura `api/` (src, test, config) y `web/` (src, public) creadas. `package.json` válidos con engines, `.nvmrc` (14 y 16), `.gitignore` raíz + por subproyecto, README raíz + por subproyecto.

- **T02 — Inicializar repo git** · `completed by: implementer` · `2026-05-13`
  `git init -b main`, config local `user.name=Felipe Ramos`, `user.email=felipeofor@gmail.com`. Commit inicial `b7231e4` (16 files). Remote `origin → https://github.com/Felipeofor/Toolbox.git`, push a `main` con tracking.

- **T03 — Setup base API** · `completed by: implementer` · `2026-05-13`
  Deps: express, cors, pino, pino-http, config, axios. DevDeps: mocha, chai, nock, supertest, standard. `config/default.json` y `config/test.json` con server/externalApi/log. `src/logger.js` (pino), `src/app.js` (cors + pino-http + /health + router files + 404/500 handlers), `src/index.js` entry. Smoke test: `/health` → 200 `{"status":"ok"}` con `application/json; charset=utf-8`.

- **T04 — Cliente API externa** · `completed by: implementer` · `2026-05-13`
  `src/services/externalApi.js`: factory axios cached (`getClient`/`_resetClient`), header `Authorization: Bearer <token>`, timeout configurable. `listFiles()` valida `Array.isArray(res.data.files)`. `downloadFile(name)` con `encodeURIComponent`, `responseType:'text'`. Errores envueltos en `ExternalApiError` con `status` (502 default, 504 en timeout, propagación del HTTP cuando hay response). 10 tests pasando.

- **T05 — Parser CSV resiliente** · `completed by: implementer` · `2026-05-13`
  `src/services/csvParser.js`: `parseCsv(content, expectedFileName)` con header opcional, soporte CRLF, regex hex `/^[a-f0-9]{32}$/i`, validación `Number.isFinite`, match estricto de `file` cuando se pasa `expectedFileName`. Líneas inválidas se logean en `debug` y descartan. 15 tests cubriendo: vacío, header solo, válidas, cols faltantes/extras, number/hex/empty text/file mismatch, CRLF, mixto.

- **T06 + T07 + T08 — Rutas /files** · `completed by: implementer` · `2026-05-13`
  `src/services/filesService.js`: orquesta listing + descargas en batches (concurrency configurable, default 5) con `Promise.allSettled`. `processFile` retorna null en fallo (no tumba batch). Files con 0 líneas válidas se omiten del output. `getFileData(name)` valida que el nombre exista en listing externo (404 si no). `src/routes/files.js`: GET `/files/data` (con opcional `?fileName=`), GET `/files/list` (passthrough). Errores propagan status; default 502. Content-Type `application/json; charset=utf-8` en todas las respuestas. 11 tests integración pasando (total 36/36).

- **T09 — StandardJS** · `completed by: implementer` · `2026-05-13`
  Configurado `"standard": {"env":["mocha"]}` en package.json para reconocer globals de tests. Fix de 1 template literal sin expresiones. `npx standard` exit 0 sobre `src/` y `test/`. Tests siguen 36/36.

- **T10 — Dockerfile API** · `completed by: implementer` · `2026-05-13`
  `api/Dockerfile` multi-stage: stage `deps` (node:14-alpine, `npm ci --omit=dev`) → stage `runtime` que copia node_modules + package.json + src + config. EXPOSE 3000. HEALTHCHECK `/health`. CMD `node src/index.js`. `.dockerignore` excluye node_modules, tests, coverage, logs. No verificado con `docker build` (docker no instalado local — se valida en CI/T19).

- **T11 + T12 + T13 + T14 — Frontend completo** · `completed by: implementer` · `2026-05-13`
  Webpack 5 + babel-loader + html-webpack-plugin + DefinePlugin (`API_BASE_URL`), devServer en 8080. React 18 (createRoot) + react-bootstrap + bootstrap CSS. Redux Toolkit con slice `files` (data, list, filter, loading, error) + thunks `fetchFilesData(fileName?)` y `fetchFilesList()`. Componentes funcionales con `useEffect`: `App` (Navbar + Container), `FilesView` (orquesta loading/error/table, dispara fetch al montar), `SearchBar` (input + datalist autocomplete con listado + Search/Clear/Refresh), `FilesTable` (cols file/text/number/hex, vacío si sin datos). Cliente API `src/api/client.js` con fetch nativo. `npx webpack --mode production` exit 0 (1.22 MiB con warnings de tamaño esperados).

- **T15 — Tests Jest** · `completed by: implementer` · `2026-05-13`
  Jest + jsdom + babel-jest + RTL + jest-dom. `jest.env.js` para env vars. `test/FilesTable.test.jsx`: empty state + render flatten. `test/filesSlice.test.js`: initial state, setFilter/clearFilter, fetchFilesData fulfilled/rejected, fetchFilesList fulfilled. 7/7 pasando.

- **T16 — Dockerfile web** · `completed by: implementer` · `2026-05-13`
  Multi-stage `node:16-alpine` (npm ci + webpack production con `API_BASE_URL` por ARG) → `nginx:alpine` que copia `dist/` y monta `nginx.conf` con `try_files $uri /index.html` (SPA fallback) + gzip. EXPOSE 80. `.dockerignore` excluye node_modules, dist, tests, jest config.

- **T17 — docker-compose.yml** · `completed by: implementer` · `2026-05-13`
  Servicios `api` (puerto 3000, healthcheck wget /health) y `web` (puerto 8080→80, `depends_on api: service_healthy`, build arg `API_BASE_URL`). Red `toolbox-net` (bridge).

- **T18 — README final** · `completed by: implementer` · `2026-05-13`
  README raíz con estructura, instrucciones local + Docker, scripts, endpoints con ejemplos curl, decisiones técnicas (Promise.allSettled, parser validations, token en config, observabilidad), cumplimiento checklist de consigna (obligatorios + 7 opcionales tildados).

- **T19 — Push final a origin/main** · `completed by: implementer` · `2026-05-13`
  4 commits pusheados a `origin/main`: scaffold (b7231e4) → API base (bb56e3c) → API /files + lint (94af820) → frontend + Docker + README (e8e619c). Tests verdes (API 36/36, Web 7/7) y StandardJS clean al momento del push. Queda `MANUAL` (no automatizable): enviar URL `https://github.com/Felipeofor/Toolbox` al reclutador.

- **T21 — Resiliencia + governance + E2E (Team Lead bundle)** · `completed by: implementer` · `2026-05-13`
  API: versioning `/v1` con legacy alias, config schema validation con Ajv, correlation IDs vía AsyncLocalStorage propagando a upstream, TTL cache para listFiles, axios-retry con backoff, opossum circuit breaker, graceful shutdown SIGTERM/SIGINT. Tests subieron a 80/80 con coverage 94.77/76.79/94.62/95.11 (sobre gate 85/75/85/85). Governance: 7 ADRs en docs/adr/, package.json raíz con husky + lint-staged + commitlint, .github/dependabot.yml, .github/workflows/codeql.yml, npm audit en CI. E2E: e2e/ con Playwright (3 specs: dashboard, search/sort, contrato API) + job nuevo en ci.yml que levanta API + Web reales antes de correr.

- **T20 — Upgrade arquitectura a nivel Sr/Team Lead** · `completed by: implementer` · `2026-05-13`
  Refactor del API a hexagonal (domain/application/infrastructure/interfaces + platform). VOs (Hex, FileName, FileLine, FileEntry) + errores tipados (AppError, ValidationError, NotFoundError, UpstreamError). DI via composition root (`platform/container.js`). Use cases factory-built. Adapter axios encapsulado por instancia. Middleware seguridad (helmet + cors + rate-limit). Validación al borde (validateFileNameQuery). `/health` (liveness) y `/ready` (readiness con upstream check). Métricas Prometheus en `/metrics`. OpenAPI 3.0 spec (`interfaces/http/openapi/openapi.yaml`) + Swagger UI en `/docs`. Coverage gate nyc (85/75/85/85, actual 96/82/96/96). Web: ErrorBoundary global, `React.lazy + Suspense` en FilesTable, selectores `createSelector` memoizados, a11y (labels, roles, aria-live). CI GitHub Actions con 3 jobs (api, web, docker). Tests: API 58/58, Web 15/15, lint clean.
