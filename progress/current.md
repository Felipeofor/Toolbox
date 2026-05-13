# Contexto Activo — Toolbox Challenge

## Decisiones arquitectónicas vigentes

### Monorepo
- `api/` y `web/` como subproyectos independientes. Cada uno con su `package.json`, `.nvmrc`, `Dockerfile`.
- `docker-compose.yml` raíz orquesta ambos.

### API
- **HTTP client:** axios (mejor que node-fetch para tests con `nock` y manejo de errores estructurado).
- **Config:** archivo `config/default.json` cargado al boot. Sin variables de entorno (consigna lo prohíbe). Token y baseUrl ahí.
- **Concurrencia descargas:** `Promise.allSettled`. Permite que un archivo fallido no tumbe la respuesta.
- **Parser:** validaciones explícitas — `hex` regex `/^[a-f0-9]{32}$/i`, `number` parseo + `Number.isFinite`, `file` debe coincidir con nombre del archivo donde vino la línea. Líneas inválidas se descartan silenciosamente (consigna lo pide).
- **Tests:** Mocha + Chai + nock para mockear API externa. Coverage de líneas válidas, líneas con cada tipo de defecto, descarga fallida, listado fallido, archivo vacío, solo-header.

### Frontend
- **Build:** Webpack 5. React 18 (no hay restricción de versión, va la más reciente estable).
- **Estilos:** React Bootstrap. Sin CSS custom salvo lo mínimo.
- **Estado:** primero `useState` + `useReducer`. Redux solo se agrega si los core tasks están terminados y queda tiempo (T14 opcional).
- **Llamadas API:** fetch nativo. Base URL del API propio: `http://localhost:3000`.

### Docker
- API: `node:14-alpine` multi-stage.
- Web: build con `node:16-alpine`, serve estático con `nginx:alpine`.
- Compose con healthcheck en API (`/files/list` o `/health`).

## Cuestiones abiertas

- ¿Endpoint `/health` propio en API? Recomendado para healthcheck Docker, no pedido por consigna.
- ¿CORS abierto a todos o restringido a `http://localhost:8080`? Restringir es más prolijo, abierto es más simple para evaluación.
- Wireframe del frontend está en link externo (`cs1.ssltrust.me/s/ECH9VusiMmi3ac1`) — verificar antes de codear layout final.
- Diagrama de secuencia en `cs1.ssltrust.me/s/6u9aC5hCTEhTpT1` — útil para README.

## Estado del proyecto

- Consigna leída y analizada.
- Investigación de empresa hecha (Toolbox/tbxnet — OTT/streaming, content aggregation).
- Harness configurado (CLAUDE.md, init.sh, progress/, settings.local.json).
- Código de aplicación: 0% — pendiente arrancar por T01.
