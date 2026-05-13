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
