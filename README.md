# Toolbox Challenge — Full Stack JS

Solución al challenge técnico de TBX/Toolbox. Monorepo con:

- **`api/`** — REST API en **Node 14 + Express**, organizada en arquitectura **hexagonal (Ports & Adapters)** con DI explícita.
- **`web/`** — Frontend en **React 18 + React Bootstrap (Webpack 5)** con **Redux Toolkit**, selectores memoizados, lazy loading y error boundary.
- **`docker-compose.yml`** — orquesta ambos servicios.
- **`.github/workflows/ci.yml`** — pipeline CI con lint, tests, coverage gate, build y validación de imágenes Docker.

---

## Estructura

```
.
├── api/                                # Node 14 + Express (Hexagonal)
│   ├── src/
│   │   ├── domain/                     # Value Objects + errores de dominio
│   │   │   ├── Hex.js
│   │   │   ├── FileName.js
│   │   │   ├── FileLine.js
│   │   │   ├── FileEntry.js
│   │   │   └── errors.js
│   │   ├── application/                # Use cases (factories con DI)
│   │   │   └── files/
│   │   │       ├── getAllFilesData.js
│   │   │       ├── getFileData.js
│   │   │       └── listFiles.js
│   │   ├── infrastructure/             # Adapters (implementan puertos)
│   │   │   ├── echoServAdapter.js      # FileSource port → echo-serv.tbxnet.com
│   │   │   └── csvParser.js
│   │   ├── interfaces/http/            # Adapter primario (HTTP)
│   │   │   ├── server.js               # Factory de Express app
│   │   │   ├── filesRouter.js
│   │   │   ├── healthRouter.js         # /health (liveness) + /ready (readiness)
│   │   │   ├── middleware/
│   │   │   │   ├── security.js         # helmet + cors + rate-limit
│   │   │   │   ├── validateFileName.js # validación al borde
│   │   │   │   └── errorHandler.js     # mapping AppError → HTTP
│   │   │   └── openapi/openapi.yaml    # contrato OpenAPI 3.0
│   │   ├── platform/                   # Cross-cutting + composition root
│   │   │   ├── config.js
│   │   │   ├── logger.js               # pino estructurado
│   │   │   ├── metrics.js              # Prometheus (prom-client)
│   │   │   └── container.js            # composition root (DI)
│   │   └── index.js                    # entrypoint
│   ├── test/                           # mocha + chai + nock + supertest
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── interfaces/http/
│   ├── config/                         # default.json + test.json
│   └── Dockerfile
├── web/                                # Node 16 + React 18 + Bootstrap + Webpack 5
│   ├── src/
│   │   ├── index.jsx                   # ErrorBoundary + Provider
│   │   ├── App.jsx
│   │   ├── api/client.js               # fetch wrapper
│   │   ├── store/
│   │   │   ├── index.js
│   │   │   ├── filesSlice.js           # Redux Toolkit slice + thunks
│   │   │   └── selectors.js            # createSelector (memoizado)
│   │   └── components/
│   │       ├── ErrorBoundary.jsx
│   │       ├── FilesView.jsx           # Suspense + lazy(FilesTable)
│   │       ├── SearchBar.jsx
│   │       └── FilesTable.jsx
│   ├── test/                           # Jest + RTL + jest-dom
│   └── Dockerfile + nginx.conf
├── .github/workflows/ci.yml            # CI: lint + test + coverage + build + docker
├── docker-compose.yml
├── consigna.txt
└── README.md
```

---

## Arquitectura — API (Hexagonal / Ports & Adapters)

```
                ┌───────────────────────────────────────────┐
                │             interfaces/http               │
                │  (Express, routes, validation, errors)    │
                └────────────────┬──────────────────────────┘
                                 │ usa
                ┌────────────────▼──────────────────────────┐
                │              application                  │
                │   getAllFilesData · getFileData · listFiles
                │   (use cases, factory-built, deps inyectadas)
                └────────────────┬──────────────────────────┘
                                 │ depende del puerto
                ┌────────────────▼──────────────────────────┐
                │                 domain                    │
                │   Hex · FileName · FileLine · FileEntry   │
                │   AppError · ValidationError · NotFound · │
                │   UpstreamError                           │
                └────────────────▲──────────────────────────┘
                                 │ implementan
                ┌────────────────┴──────────────────────────┐
                │            infrastructure                 │
                │   echoServAdapter (HTTP)                  │
                │   csvParser                               │
                └───────────────────────────────────────────┘
```

**Puerto `FileSource`** (interfaz implícita):
- `listFiles(): Promise<string[]>`
- `downloadFile(name: string): Promise<string>`

**Composition root** (`platform/container.js`) cablea todo y permite **inyectar dependencias** en tests (cualquier dep es overridable).

### Por qué hexagonal

- **Testabilidad:** los use cases se prueban con sources falsos sin tocar HTTP ni axios.
- **Reemplazo:** cambiar el upstream a otro origen (S3, FS) es un adapter nuevo, sin tocar dominio ni use cases.
- **Reglas de dependencia:** dominio no importa nada de infra; infra implementa lo que el dominio define.

---

## Decisiones técnicas — API

| Área | Decisión | Por qué |
|---|---|---|
| Concurrencia | `Promise.allSettled` en batches con tamaño configurable | Una descarga fallida no tumba la respuesta; refleja patrón de ingest OTT real (clientes NBC/Sky/UFC). |
| Parser | Descarte silencioso con `logger.debug` por línea inválida | Consigna lo pide; matchea pipelines de catálogos sucios. |
| Validación al borde | `validateFileNameQuery` middleware + VO `FileName` con regex `^[A-Za-z0-9._-]+$` | Bloquea path traversal antes de tocar use case. |
| Errores tipados | `AppError`/`ValidationError`/`NotFoundError`/`UpstreamError` | Mapping centralizado en `errorHandler`; status/code consistentes. |
| Seguridad | `helmet` + `cors` con origin configurable + `express-rate-limit` | Defensa básica OWASP, rate limit para evitar abuso. |
| Config | Archivo `config/default.json` + `config/test.json`; cero env vars de SO | Lo exige la consigna. |
| Observabilidad | `pino` JSON con timestamp ISO + métricas Prometheus (`/metrics`) | Operación OTT vive en logs/métricas. |
| Healthchecks | `/health` (liveness — siempre 200) + `/ready` (verifica upstream) | Kubernetes-friendly, Docker compose usa `/health`. |
| Contrato | OpenAPI 3.0 en `openapi/openapi.yaml`, Swagger UI en `/docs`, JSON en `/openapi.json` | Lead-level: contrato versionado. |
| Inyección | Composition root `platform/container.js`; cada use case se construye via factory | Tests no necesitan monkey-patching. |
| Tests | Mocha + Chai + nock + supertest; **gate de coverage** vía nyc (85/75/85/85) | Calidad medible. |
| Lint | StandardJS | Suma del checklist + consistencia. |

---

## Decisiones técnicas — Web

| Área | Decisión | Por qué |
|---|---|---|
| React | Funcional + `useEffect` exclusivamente | Consigna explícita. |
| Estado | Redux Toolkit con slice `files` + thunks | Estado de carga/error/filtro compartido. |
| Selectores | `createSelector` memoizado en `store/selectors.js` | Evita recomputos en re-renders. |
| Code splitting | `React.lazy` + `Suspense` para `FilesTable` | Tabla solo carga cuando hace falta. |
| Resiliencia UI | `ErrorBoundary` global como wrapper de la app | Error en render no rompe toda la página. |
| Accesibilidad | Labels asociados (`htmlFor` + `visually-hidden`), `role`/`aria-label`/`aria-live`, table con `aria-label`, headings semánticas | A11y básica nivel WCAG AA. |
| Build | Webpack 5 + babel-loader + DefinePlugin (`API_BASE_URL`) | Inyección en build time, cero env vars en runtime. |
| Tests | Jest + RTL + jest-dom; 15 tests | Slice, selectors, ErrorBoundary, FilesTable. |

---

## Cómo correr local (sin Docker)

Requiere `nvm` para tener Node 14 (API) y Node 16 (Web). Cada subproyecto tiene `.nvmrc`.

```bash
# Terminal 1 — API en :3000
cd api
nvm use            # selecciona Node 14
npm install
npm start

# Terminal 2 — Web en :8080
cd web
nvm use            # selecciona Node 16
npm install
npm start
```

Abrir `http://localhost:8080`.

## Cómo correr con Docker

```bash
docker compose up --build
```

- `toolbox-api` en `http://localhost:3000` (healthcheck `/health`).
- `toolbox-web` en `http://localhost:8080` (espera a que la API esté healthy).
- Documentación interactiva en `http://localhost:3000/docs`.

---

## Scripts

### API (`/api`)

| Comando | Descripción |
|---|---|
| `npm start` | Levanta el servidor en `:3000` |
| `npm test` | Mocha + Chai con **coverage gate** (nyc, 85/75/85/85) |
| `npm run test:nocoverage` | Mocha solo, sin gate |
| `npm run coverage` | Resumen de cobertura |
| `npm run lint` | StandardJS |

### Web (`/web`)

| Comando | Descripción |
|---|---|
| `npm start` | webpack-dev-server en `:8080` |
| `npm run build` | Build de producción en `dist/` |
| `npm test` | Jest + RTL (15 tests) |

---

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/health` | Liveness probe |
| GET | `/ready` | Readiness probe (chequea upstream) |
| GET | `/files/data` | Listado parseado de todos los archivos |
| GET | `/files/data?fileName=X` | Filtro por archivo |
| GET | `/files/list` | Passthrough del listing upstream |
| GET | `/files/stats` | Parse quality stats per-file + summary global |
| GET | `/metrics` | Métricas Prometheus |
| GET | `/docs` | Swagger UI interactivo |
| GET | `/openapi.json` | Spec OpenAPI 3.0 |

### Ejemplos

```bash
curl -s http://localhost:3000/health
# {"status":"ok"}

curl -s http://localhost:3000/ready
# {"status":"ready"}

curl -s http://localhost:3000/files/data | jq
# [{"file":"file1.csv","lines":[{"text":"...","number":1,"hex":"..."}]}, ...]

curl -s "http://localhost:3000/files/data?fileName=file1.csv" | jq

curl -s http://localhost:3000/files/list | jq
# {"files":["file1.csv","file2.csv",...]}

curl -s http://localhost:3000/metrics | head
# # HELP toolbox_api_http_requests_total Total HTTP requests
# # TYPE toolbox_api_http_requests_total counter
# ...
```

Todas las respuestas JSON con `Content-Type: application/json; charset=utf-8`.

---

## Tests y cobertura

### API — 58 tests Mocha + Chai

- `domain/` — 17 tests sobre VOs (Hex, FileName, FileLine, FileEntry).
- `infrastructure/` — 16 tests sobre adapter (nock para 200/404/500/timeout/shape) y parser (vacío, header, cols, hex/number/text/file, CRLF, mixto).
- `application/` — 7 tests sobre use cases con doubles inyectados.
- `interfaces/http/` — 18 tests integración con supertest cubriendo health, ready, files/data (con/sin filtro, 400/404/200), files/list, metrics, openapi.json, swagger UI, helmet, 404 JSON.

**Coverage (nyc):** `Statements 96.45% · Branches 81.96% · Functions 96.55% · Lines 96.60%`. Gate configurado en 85/75/85/85.

### Web — 15 tests Jest + RTL

- `filesSlice` — initial, setFilter/clearFilter, thunks fulfilled/rejected.
- `selectors` — memoization, flatten, rowCount.
- `ErrorBoundary` — renderiza children OK; cae a fallback en error.
- `FilesTable` — empty state, flatten render, accessible name.

---

## CI / CD

`.github/workflows/ci.yml` corre en push a `main` y en PRs:

1. **API job** (Node 14): `npm ci` → `npm run lint` → `npm test` (con coverage gate) → upload coverage artifact.
2. **Web job** (Node 16): `npm ci` → `npm test --ci` → `npm run build` → upload dist artifact.
3. **Docker job** (después de los dos anteriores): `docker build` de api y web.

---

## Cumplimiento de la consigna

### Obligatorios API

- [x] Node 14 + Express
- [x] JS ES6+ sin Babel/TS
- [x] `GET /files/data` con shape pedido
- [x] Mocha + Chai, `npm test` corre
- [x] `npm start` arranca

### Obligatorios Frontend

- [x] React funcional + Hook Effects (sin clases excepto ErrorBoundary, donde es obligatorio)
- [x] React Bootstrap
- [x] Webpack 5
- [x] Node 16, JS ES6+, sin TypeScript

### Opcionales

- [x] `GET /files/list`
- [x] `?fileName=` en `/files/data`
- [x] StandardJS lint
- [x] Redux Toolkit
- [x] Tests Jest
- [x] Filtro UI por fileName
- [x] Docker + docker-compose

### Referencias visuales

- `wireframe.png` — wireframe original del frontend (banner "React Test App" + tabla striped).
- `sequence.png` — diagrama de secuencia: cliente → API → API externo (lista + loop downloads + formateo).
- `consigna.pdf` — consigna original en PDF.

El header rojo y el título "React Test App" matchean el wireframe. SearchBar/filter es agregado opcional (entra como suma).

### Más allá de la consigna (nivel Senior / Team Lead)

- [x] Arquitectura hexagonal con DI explícita
- [x] Value Objects de dominio (Hex, FileName, FileLine, FileEntry)
- [x] Errores tipados (`AppError` + jerarquía)
- [x] OpenAPI 3.0 spec + Swagger UI
- [x] `helmet` + `express-rate-limit` + validación al borde
- [x] `/health` (liveness) + `/ready` (readiness)
- [x] Métricas Prometheus (`/metrics`)
- [x] Coverage gate (nyc, 85/75/85/85)
- [x] ErrorBoundary, lazy loading, selectores memoizados, a11y
- [x] GitHub Actions CI con lint/test/coverage/build/docker
