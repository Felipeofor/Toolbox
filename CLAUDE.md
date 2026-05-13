# Toolbox Challenge — Full Stack JS

Challenge técnico de TBX/Toolbox (toolboxtve.com). API Node + Express en arquitectura hexagonal con DI, frontend React + Bootstrap + Redux con lazy loading.

## PROTOCOLO OBLIGATORIO

1. Leer `progress/board.md` al inicio de cada sesión.
2. Reclamar tarea moviéndola a IN PROGRESS con `owner` y `started: YYYY-MM-DD HH:MM`.
3. Al terminar, mover a DONE con `completed by` y fecha. Nunca marcar hecha sin compilar + tests + coverage gate + lint.
4. Solo el agente owner edita su tarea en IN PROGRESS.
5. Cualquier agente puede tomar tarea de BACKLOG si el usuario lo indica explícitamente.

## REGLAS DURAS

### API

- Node 14 declarado en `engines` y `.nvmrc`. JS ES6+. NO Babel/TS/Dart/Elm.
- Express + Mocha + Chai obligatorios.
- Content-Type `application/json; charset=utf-8` en toda respuesta.
- Token y baseUrl viven en `config/*.json`. Cero env vars del SO.
- Parseo CSV resiliente: descartar líneas inválidas, validar `hex` regex `/^[a-f0-9]{32}$/i`, `number` con `Number.isFinite`, `text` no vacío, `file` matchea expectedFileName.
- Descargas con `Promise.allSettled` en batches (concurrency configurable). Un fallo no tumba el batch.

### Arquitectura API — Hexagonal estricto

- **Dominio (`src/domain/`)** no importa NADA de infra ni interfaces. Solo VOs + errores.
- **Application (`src/application/`)** son factories `buildXxx({ deps })` que retornan funciones. Reciben dependencias por parámetro (DI), nunca via `require` directo del adapter.
- **Infrastructure (`src/infrastructure/`)** implementa puertos. Adapter HTTP usa axios cacheado por instancia, no por módulo.
- **Interfaces (`src/interfaces/http/`)** es la capa de presentación. Recibe `useCases` del container.
- **Composition root** (`src/platform/container.js`) cablea todo y acepta overrides para tests.
- Tests usan inyección, no monkey-patch. `buildContainer({ logger, fileSource, parseCsv })`.

### Frontend

- React 18 funcional + `useEffect`. ErrorBoundary es la única clase aceptable (React lo exige).
- React Bootstrap. Cero CSS custom salvo `visually-hidden` (ya existe).
- Redux Toolkit con slice + thunks + `createSelector` en `store/selectors.js`.
- `React.lazy` + `Suspense` para componentes pesados.
- A11y obligatorio: labels asociados, `role`/`aria-label`/`aria-live`, tables con `aria-label`.
- `process.env.API_BASE_URL` solo via DefinePlugin en build time.

### Calidad y seguridad

- `npm run lint` (StandardJS en API) DEBE pasar antes de DONE.
- `npm test` corre con coverage gate (nyc): branches 75% / lines 85% / functions 85% / statements 85%. Bajar el gate requiere autorización explícita.
- `helmet` + `cors` + `express-rate-limit` siempre activos.
- Validación al borde con middleware + VO. Nunca confiar en `req.query`.
- Errores tipados (`AppError`/`ValidationError`/`NotFoundError`/`UpstreamError`). Mapping centralizado.
- Commits convencionales. Nunca marcar DONE sin pasar todo el pipeline.

## MAPA DEL REPOSITORIO

```
Toolbox/
├── api/
│   ├── src/
│   │   ├── domain/        # VOs + errores
│   │   ├── application/   # use cases (factories)
│   │   ├── infrastructure/# adapters
│   │   ├── interfaces/http/  # Express, routes, middleware, openapi
│   │   ├── platform/      # config, logger, metrics, container
│   │   └── index.js       # entrypoint
│   ├── test/              # paralelo a src
│   ├── config/            # default.json + test.json
│   └── Dockerfile
├── web/
│   ├── src/
│   │   ├── components/    # ErrorBoundary, FilesView (lazy), SearchBar, FilesTable
│   │   ├── store/         # slice + selectors
│   │   ├── api/           # fetch client
│   │   ├── App.jsx
│   │   └── index.jsx
│   ├── test/
│   ├── nginx.conf
│   └── Dockerfile
├── .github/workflows/ci.yml
├── docker-compose.yml
├── progress/              # tablero multi-agente
├── consigna.txt
├── CLAUDE.md
└── README.md
```

## ARQUITECTURA

- **API externa:** `https://echo-serv.tbxnet.com` — auth `Bearer aSuperSecretKey`.
- **API propia:** Express en `:3000`. Endpoints `/health`, `/ready`, `/files/data` (con opcional `?fileName=`), `/files/list`, `/metrics`, `/docs`, `/openapi.json`.
- **Frontend:** React en `:8080`. Consume `API_BASE_URL` inyectado por DefinePlugin (default `http://localhost:3000`).
- **Docker:** compose orquesta `api` + `web`. `web` espera `api: service_healthy`.
- **CI:** GitHub Actions con 3 jobs (api, web, docker).

## AGENTES DISPONIBLES

- **implementer** — toma tareas de BACKLOG, implementa siguiendo reglas duras, mueve a DONE solo si pipeline pasa.
- **reviewer** — revisa código en DONE: arquitectura hexagonal preservada, reglas de dependencia respetadas, tests cubren happy + edge + security, a11y en web, sin secretos commiteados.
- **orchestrator** — coordina tareas paralelas (API y web son independientes), prioriza siguiendo el board.
