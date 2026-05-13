# Toolbox Challenge — Full Stack JS

Solución al challenge técnico de TBX/Toolbox. Monorepo con:

- `api/` — API REST Node 14 + Express que consume `https://echo-serv.tbxnet.com`, parsea CSVs y los expone como JSON.
- `web/` — Frontend React 18 + React Bootstrap (Webpack 5) que consume el API local.
- `docker-compose.yml` — orquesta ambos servicios (pendiente).

## Estructura

```
.
├── api/                # Node 14 + Express + Mocha/Chai
├── web/                # Node 16 + React + Bootstrap + Webpack
├── progress/           # Tablero multi-agente (board.md, current.md, history.md)
├── consigna.txt        # Consigna original
├── CLAUDE.md           # Protocolo de trabajo
├── init.sh             # Verificación de entorno
└── README.md
```

## Cómo correr local (sin Docker)

```bash
# Terminal 1 — API en :3000
cd api
nvm use            # Node 14
npm install
npm start

# Terminal 2 — Web en :8080
cd web
nvm use            # Node 16
npm install
npm start
```

## Cómo correr con Docker (pendiente)

```bash
docker compose up --build
```

## Endpoints API

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/health` | Status |
| GET | `/files/data` | Lista archivos, parsea y devuelve JSON |
| GET | `/files/data?fileName=X` | Filtro por archivo (opcional) |
| GET | `/files/list` | Passthrough del listado externo (opcional) |

## Decisiones técnicas

Documentadas en `progress/current.md` y al final de este README cuando esté completo.

## Tests

- API: `cd api && npm test` (Mocha + Chai)
- Web: `cd web && npm test` (Jest, opcional)

## Estado

Ver `progress/board.md` para tablero de tareas.
