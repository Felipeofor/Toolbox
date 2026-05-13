# ADR 0007: Request correlation via `AsyncLocalStorage`

- **Status:** accepted
- **Date:** 2026-05-13
- **Tags:** observability

## Context

Operators of OTT pipelines need to trace a single user request across all downstream calls. The standard tool is a correlation ID propagated as an `X-Request-Id` header, logged with every entry, and forwarded to every upstream call.

The naive approach is to pass `req.id` through every function call, but that pollutes signatures and breaks the dependency rules of the hexagonal layout.

## Decision

Use Node's built-in `async_hooks.AsyncLocalStorage` (no extra dependency):

- A middleware reads `X-Request-Id` from the incoming request or generates a UUID v4 if absent, then runs the rest of the request inside `storage.run({ requestId }, next)`.
- The response always echoes `X-Request-Id`.
- `pino-http` includes the requestId on every log line via `customProps`.
- The upstream axios client has a request interceptor that calls `requestContext.getRequestId()` and forwards it as `X-Request-Id` to `echo-serv`.

This keeps the propagation out of function signatures while remaining testable (the context module exposes `run`, `get`, `getRequestId`).

## Consequences

Positive:
- A reviewer can trace one request from the browser to the upstream with `grep <requestId> logs`.
- Foundation for full distributed tracing (OpenTelemetry) without further refactor: the same context can carry traceId/spanId.

Negative:
- `AsyncLocalStorage` has a small CPU cost (a few percent on hot paths). Acceptable for this workload.

## Alternatives considered

- `cls-hooked`: deprecated; AsyncLocalStorage is the modern replacement.
- Threading `ctx` through every function: rejected; pollutes the application layer.
- OpenTelemetry SDK out of the box: deferred; we want the basic correlation right now and the SDK is a bigger ticket (sampling, exporters, collector wiring).
