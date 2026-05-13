# Toolbox API

API REST en Node 14 + Express que consume `echo-serv.tbxnet.com`, parsea CSVs y expone los datos como JSON.

## Requisitos

- Node 14.x (`nvm use` lee `.nvmrc`)
- npm

## Scripts

- `npm start` — levanta el servidor en puerto 3000.
- `npm test` — corre Mocha + Chai.
- `npm run lint` — StandardJS.

## Endpoints

- `GET /health` — status del servicio.
- `GET /files/data` — lista archivos del API externo, parsea y devuelve JSON agrupado.
- `GET /files/data?fileName=X` — filtro por archivo (opcional).
- `GET /files/list` — passthrough del listado externo (opcional).

Ver `/README.md` raíz para arquitectura completa.
