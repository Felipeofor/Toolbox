# Toolbox Challenge — Full Stack JS

Solución al challenge técnico de TBX/Toolbox. Monorepo con:

- **`api/`** — REST API en **Node 14 + Express** que consume `https://echo-serv.tbxnet.com`, parsea CSVs y los expone como JSON.
- **`web/`** — Frontend en **React 18 + React Bootstrap (Webpack 5)** que consume el API local.
- **`docker-compose.yml`** — orquesta ambos servicios.

## Estructura

```
.
├── api/                          # Node 14 + Express + Mocha/Chai
│   ├── src/
│   │   ├── app.js                # factory de la app Express
│   │   ├── index.js              # entry point
│   │   ├── logger.js             # pino con timestamp ISO
│   │   ├── routes/files.js       # GET /files/data, GET /files/list
│   │   └── services/
│   │       ├── externalApi.js    # cliente axios con Bearer
│   │       ├── csvParser.js      # parseo + validación estricta
│   │       └── filesService.js   # orquestación con Promise.allSettled
│   ├── test/                     # mocha + chai + nock + supertest
│   ├── config/                   # default.json + test.json (sin env vars)
│   └── Dockerfile
├── web/                          # Node 16 + React 18 + Bootstrap + Webpack 5
│   ├── src/
│   │   ├── index.jsx
│   │   ├── App.jsx
│   │   ├── api/client.js         # fetch wrapper
│   │   ├── store/                # Redux Toolkit
│   │   └── components/           # FilesView, SearchBar, FilesTable
│   ├── test/                     # Jest + RTL + jest-dom
│   ├── public/index.html
│   ├── webpack.config.js
│   ├── nginx.conf                # SPA fallback para serve estático
│   └── Dockerfile
├── docker-compose.yml
├── consigna.txt
└── README.md
```

## Cómo correr local (sin Docker)

Requiere `nvm` o tener instalados Node 14 y Node 16. El `.nvmrc` de cada subproyecto define la versión esperada.

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

Levanta:
- `toolbox-api` en `http://localhost:3000` (healthcheck `/health`).
- `toolbox-web` en `http://localhost:8080` (espera a que la API esté healthy).

## Scripts

### API (`/api`)

| Comando | Descripción |
|---|---|
| `npm start` | Levanta el servidor en `:3000` |
| `npm test` | Corre Mocha + Chai (36 tests) |
| `npm run lint` | StandardJS (sin args lintea todo) |

### Web (`/web`)

| Comando | Descripción |
|---|---|
| `npm start` | webpack-dev-server en `:8080` |
| `npm run build` | Build de producción en `dist/` |
| `npm test` | Jest + RTL (7 tests) |

## Endpoints (API propia)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/health` | Healthcheck `{status:"ok"}` |
| GET | `/files/data` | Lista archivos del API externo, parsea y devuelve JSON agrupado |
| GET | `/files/data?fileName=X` | Filtro por archivo (opcional) |
| GET | `/files/list` | Passthrough del listado externo (opcional) |

### Ejemplos

```bash
curl -s http://localhost:3000/health
# {"status":"ok"}

curl -s "http://localhost:3000/files/data" | jq
# [{ "file": "file1.csv", "lines": [{ "text": "...", "number": 1, "hex": "..." }] }, ...]

curl -s "http://localhost:3000/files/data?fileName=file1.csv" | jq
# [{ "file": "file1.csv", "lines": [...] }]

curl -s http://localhost:3000/files/list | jq
# {"files":["file1.csv","file2.csv",...]}
```

Todas las respuestas son `Content-Type: application/json; charset=utf-8`.

## Decisiones técnicas

### API

- **`Promise.allSettled` en batches** (no `Promise.all`). Si un archivo falla descarga, el resto sigue. La API responde 200 con los archivos que sí pudieron procesarse — refleja patrones de pipelines de ingest reales (catálogos de content providers).
- **Concurrencia controlada** vía config (`externalApi.downloadConcurrency`, default 5). Para listados grandes evita saturar el upstream.
- **Token en archivo de config**, no en código ni env vars (la consigna prohíbe depender de env vars del SO). `config/default.json` con sane defaults; `config/test.json` overridea para tests.
- **Parser estricto** descarta silenciosamente líneas inválidas según consigna. Cada descarte loguea en `debug` con número de línea — observabilidad sin ruido. Validaciones:
  - Exactamente 4 columnas.
  - `text` no vacío.
  - `number` parseable a `Number.isFinite` (acepta negativos).
  - `hex` matchea `/^[a-f0-9]{32}$/i` (32 chars hex).
  - `file` coincide con el archivo desde donde vino la línea.
- **`ExternalApiError` tipado** con `status`. La capa de routes propaga ese status al cliente; default 502 para fallos upstream.
- **Logger estructurado** (pino) en JSON con timestamp ISO. Operadores que monitorean OTT viven en logs.

### Frontend

- **React 18 con createRoot** y componentes funcionales 100% (consigna explícita: Hook Effects).
- **Redux Toolkit** (slice `files`) con thunks. Estado: `data, list, filter, loading, error`. Permite a SearchBar acceder al listado completo sin prop drilling.
- **DefinePlugin** inyecta `API_BASE_URL` en tiempo de build → en Docker se pasa por ARG. Cero env vars en runtime del cliente.
- **react-bootstrap** para todos los componentes UI. Cero CSS custom — alineado a estética de dashboards de content management.
- **Estados loading/error siempre visibles** (Spinner + Alert). En operación OTT es regla: el operador necesita saber qué está pasando.

### Por qué Node 14 / Node 16

Lo pide la consigna explícitamente. Se declara en `engines` y `.nvmrc` de cada subproyecto. Las imágenes Docker usan exactamente esas versiones (`node:14-alpine`, `node:16-alpine`).

## Tests

- **API**: `cd api && npm test` → 36 tests Mocha + Chai cubren:
  - Cliente externo: 200, 404, 500, timeout, shape inválido.
  - Parser CSV: válidos, cols faltantes/extras, hex/number/text/file inválidos, CRLF, mixto.
  - Rutas: happy path, fallo parcial, listing fallido, filtro válido/inexistente/empty, /files/list passthrough, /health.

- **Web**: `cd web && npm test` → 7 tests Jest + RTL cubren:
  - FilesTable empty + flatten.
  - filesSlice initial, setFilter, clearFilter, fetchFilesData fulfilled/rejected, fetchFilesList fulfilled.

## Cumplimiento de la consigna

### API

- [x] Node 14 + Express
- [x] JS ES6+ sin Babel/TS
- [x] `GET /files/data` con shape pedido
- [x] Mocha + Chai, `npm test` corre
- [x] `npm start` arranca

### Frontend

- [x] React funcional + Hook Effects (useEffect, sin clases)
- [x] React Bootstrap
- [x] Webpack 5
- [x] Node 16, JS ES6+
- [x] Sin TypeScript

### Opcionales

- [x] `GET /files/list`
- [x] `?fileName=` en `/files/data`
- [x] StandardJS lint
- [x] Redux Toolkit
- [x] Jest
- [x] Filtro UI por fileName
- [x] Docker + docker-compose
