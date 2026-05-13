# Toolbox Challenge — Full Stack JS

Challenge técnico de TBX/Toolbox (toolboxtve.com). API Node + Express que reformatea datos de API externa, frontend React + Bootstrap.

## PROTOCOLO OBLIGATORIO

1. Leer `progress/board.md` al inicio de cada sesión.
2. Reclamar tarea moviéndola a IN PROGRESS con `owner` y `started: YYYY-MM-DD HH:MM`.
3. Al terminar, mover a DONE con `completed by` y fecha. Nunca marcar hecha sin compilar / pasar tests.
4. Solo el agente owner edita su tarea en IN PROGRESS.
5. Cualquier agente puede tomar tarea de BACKLOG si el usuario lo indica explícitamente.
6. Tareas marcadas `MANUAL` requieren acción humana (envío de repo, credenciales, etc.).

## REGLAS DURAS

- Node 14 para API, Node 16 para frontend. Declarar en `engines` y `.nvmrc` de cada subproyecto.
- API: solo JavaScript ES6+. NO Babel, TypeScript, Dart, Elm.
- Tests obligatorios con Mocha + Chai (API) y Jest (frontend, opcional pero sumado).
- Frontend: programación funcional con Hook Effects. Cero class components.
- Content-Type `application/json; charset=utf-8` en toda respuesta del API propio.
- Bearer token `aSuperSecretKey` va en archivo de config local, nunca hardcodeado en lógica de negocio.
- No depender de variables de entorno del SO ni librerías globales.
- Parseo CSV resiliente: descartar líneas mal formadas, validar `hex` regex `/^[a-f0-9]{32}$/i`, validar `number` numérico.
- Descargas concurrentes con `Promise.allSettled`. Un fallo no tumba la respuesta.
- Commits convencionales. NUNCA marcar tarea como hecha sin que compile y tests pasen.

## MAPA DEL REPOSITORIO

```
Toolbox/
├── api/                 # Node 14 + Express + Mocha/Chai
│   ├── src/
│   ├── test/
│   ├── package.json
│   └── Dockerfile
├── web/                 # Node 16 + React + Bootstrap + Webpack
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── progress/            # tablero multi-agente
├── consigna.txt         # consigna original
├── README.md
└── CLAUDE.md
```

## ARQUITECTURA

- **API externa:** `https://echo-serv.tbxnet.com` — autorización `Bearer aSuperSecretKey`.
  - `GET /v1/secret/files` → `{files: ["file1.csv", ...]}`
  - `GET /v1/secret/file/{name}` → CSV crudo
- **API propio:** Express en puerto `3000`.
  - `GET /files/data` → JSON agrupado por archivo con líneas válidas.
  - `GET /files/data?fileName=X` → filtro opcional.
  - `GET /files/list` → passthrough listado externo (opcional).
- **Frontend:** React en puerto `8080`. Consume `http://localhost:3000`. CORS habilitado en API.
- **Docker:** compose orquesta `api` + `web`, red interna `toolbox-net`.

## AGENTES DISPONIBLES

- **implementer** — toma tareas de BACKLOG, implementa, agrega tests, mueve a DONE solo si compila.
- **reviewer** — revisa código en DONE, verifica resiliencia (líneas malformadas, descargas fallidas), reglas duras, calidad de tests.
- **orchestrator** — coordina tareas paralelas (API y web son independientes en gran parte), prioriza opcionales según tiempo.
