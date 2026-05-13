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

- **T03 — Setup base API**
  Instalar Express, cors, pino, config. Entry `src/index.js`. Config `config/default.json` con `externalApi.baseUrl` y `externalApi.token`. Script `npm start`. Puerto 3000. Endpoint `/health` mínimo.
  **Done when:** `npm start` arranca en :3000; `curl /health` devuelve `{status:"ok"}`.

- **T04 — Cliente API externa**
  `src/services/externalApi.js`: funciones `listFiles()` y `downloadFile(name)` usando axios con baseURL y header `Authorization: Bearer <token>` desde config. Timeout 10s. Manejo de errores: lanza error tipado con código HTTP.
  **Done when:** tests con `nock` cubren 200, 404, 500, timeout para ambas funciones; todos pasan.

- **T05 — Parser CSV resiliente**
  `src/services/csvParser.js`: función `parseCsv(content, expectedFileName)` que retorna `[{text,number,hex}]`. Descarta líneas inválidas (cols faltantes, `hex` no `/^[a-f0-9]{32}$/i`, `number` no finito, `file` no coincide con `expectedFileName`). Maneja archivo vacío y solo-header. Logger debug por línea descartada.
  **Done when:** tests cubren: válida; cols faltantes; hex malo; number no numérico; file mismatch; vacío; solo header; mixto; todos pasan.

- **T06 — Endpoint GET /files/data**
  `src/routes/files.js` registra ruta. Controller orquesta `listFiles()` → `Promise.allSettled(downloadFile)` → `parseCsv` por cada uno. Filtra archivos con descarga fallida (logger warn). Devuelve `[{file, lines:[{text,number,hex}]}]` con `Content-Type: application/json; charset=utf-8`. Status 200 incluso si todos los archivos fallan (devuelve `[]`).
  **Done when:** test de integración con nock cubre: todos OK; un archivo falla descarga; archivo con líneas mixtas válidas/inválidas; lista externa falla (500 con mensaje).

- **T07 — Endpoint GET /files/list (opcional)**
  Passthrough del listado externo. Devuelve el JSON tal cual.
  **Done when:** test integración devuelve mismo shape que API externa; pasa.

- **T08 — Filtro `?fileName=` en /files/data (opcional)**
  Si query param presente, validar que existe en `listFiles()`. Descargar solo ese archivo. 404 si no está en el listado. 400 si query param vacío/inválido.
  **Done when:** tests cubren: param válido devuelve solo ese archivo; param inexistente devuelve 404; sin param funciona como antes.

- **T09 — StandardJS (opcional)**
  Agregar `standard` devDep + script `npm run lint`. Corregir todo el código hasta pasar.
  **Done when:** `npm run lint` exit 0.

- **T10 — Dockerfile API**
  Multi-stage `node:14-alpine`. Stage `deps` instala con `npm ci --omit=dev`, stage final copia node_modules + src + config. EXPOSE 3000. CMD `node src/index.js`.
  **Done when:** `docker build -t toolbox-api ./api` exit 0; `docker run -p 3000:3000 toolbox-api` y `curl :3000/health` responde.

### Frontend (Node 16 + React + Bootstrap)

- **T11 — Setup base web**
  Webpack 5 config (entry, output, loaders babel-less con `swc-loader` o `esbuild-loader`), `public/index.html`, `src/index.jsx`, React 18, react-bootstrap, bootstrap CSS. Script `npm start` con webpack-dev-server en 8080.
  **Done when:** `npm start` levanta en :8080 y renderiza "Toolbox" placeholder.

- **T12 — Componente FilesTable**
  `src/components/FilesTable.jsx` funcional con `useEffect`. Fetch a `/files/data` al montar. Estados: loading (spinner), error (alert), success (Table con cols `file, text, number, hex`). Usa componentes de react-bootstrap (`Container`, `Table`, `Spinner`, `Alert`).
  **Done when:** corriendo API local + web, se ve la tabla con datos; loading visible en boot; alert si API down.

- **T13 — Filtro UI por fileName (opcional)**
  `src/components/Search.jsx`: input + botón "Search". Al submit, llama `/files/data?fileName=X`. Botón "Clear" vuelve al listado completo. Estado controlado.
  **Done when:** filtro funciona contra API local; clear restaura listado; UX consistente con wireframe.

- **T14 — Redux (opcional)**
  Redux Toolkit con slice `files` (loading, error, data, filter). Reemplazar `useState` en FilesTable y Search. Thunk para fetch.
  **Done when:** estado en Redux DevTools coincide con UI; sin `useState` en componentes de datos.

- **T15 — Tests Jest (opcional)**
  Tests con `@testing-library/react` para FilesTable y Search. Mockear fetch con `jest.fn` o MSW.
  **Done when:** `npm test` exit 0; coverage `>= 60%` en components.

- **T16 — Dockerfile web**
  Multi-stage: build con `node:16-alpine` (`npm ci`, `npm run build`), serve con `nginx:alpine` static (`/usr/share/nginx/html`). Config nginx para fallback a `index.html` (SPA).
  **Done when:** `docker build -t toolbox-web ./web` exit 0; `docker run -p 8080:80 toolbox-web` sirve la app.

### Global

- **T17 — docker-compose.yml**
  Servicios `api` y `web`. Red interna `toolbox-net`. `api` expone 3000, `web` expone 8080. Healthcheck en api contra `/health`. Web `depends_on: { api: { condition: service_healthy } }`.
  **Done when:** `docker compose up --build` levanta ambos; web carga datos del api en el browser.

- **T18 — README final**
  Cómo correr local sin Docker, con Docker, scripts disponibles, decisiones técnicas (por qué `Promise.allSettled`, qué descarta el parser y por qué, por qué Node 14), endpoints documentados con ejemplos curl.
  **Done when:** un dev nuevo puede clonar y correr en < 5 min siguiendo el README.

- **T19 — `MANUAL` Entrega**
  Push a repo público, enviar URL al reclutador.
  **Done when:** repo accesible públicamente; mensaje enviado.

---

## IN PROGRESS

- **T02 — Inicializar repo git**
  `git init`, primer commit con scaffold, agregar remote `https://github.com/Felipeofor/Toolbox.git`, push a `main`.
  **Done when:** `git log` muestra commit inicial; remoto pusheado; repo accesible público.
  `owner: implementer` · `started: 2026-05-13`

---

## DONE

- **T01 — Scaffold monorepo** · `completed by: implementer` · `2026-05-13`
  Estructura `api/` (src, test, config) y `web/` (src, public) creadas. `package.json` válidos con engines, `.nvmrc` (14 y 16), `.gitignore` raíz + por subproyecto, README raíz + por subproyecto.
