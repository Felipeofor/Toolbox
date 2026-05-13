# ADR 0001: Hexagonal architecture for the API

- **Status:** accepted
- **Date:** 2026-05-13
- **Tags:** architecture, api

## Context

The API has three concerns that change at different rates:

- Domain rules (CSV line validity, file naming, hex format) are stable.
- The upstream we consume (`echo-serv.tbxnet.com`) is fully external and could change.
- The presentation layer (HTTP/JSON) is decoupled from how data is fetched.

A traditional `routes/services/repositories` layout couples these three concerns through direct `require` calls, which makes testing harder (every test must monkey-patch the cached HTTP client) and replacement painful (swapping the upstream means touching service-layer code).

## Decision

Adopt Ports & Adapters (a.k.a. Hexagonal Architecture):

- `domain/` exposes pure value objects (`Hex`, `FileName`, `FileLine`, `FileEntry`) and typed errors. Imports nothing from the rest of the codebase.
- `application/` defines use cases as factories (`buildGetAllFilesData`, `buildGetFileData`, `buildListFiles`, `buildGetFilesStats`) that take their dependencies as parameters and return a function.
- `infrastructure/` implements ports — currently `echoServAdapter` (HTTP/axios) and `csvParser`. Adapters depend on the domain (for errors and VOs) but never on the application layer or interfaces.
- `interfaces/http/` is the primary HTTP adapter. It receives `useCases` from the container; it never reaches into infrastructure directly.
- `platform/container.js` is the composition root. Every dependency is overridable, so tests can inject doubles instead of monkey-patching.

## Consequences

Positive:
- Tests at every level: domain (pure), infrastructure (with nock), application (with fakes), interfaces (with supertest).
- Replacing the upstream is a new adapter; no other layer changes.
- Errors are typed at the domain level and mapped to HTTP responses in a single middleware.

Negative:
- More files than a flat layout. Onboarding cost is slightly higher.
- Some indirection (factories returning functions) for very small use cases.

## Alternatives considered

- Traditional MVC (routes + service singletons). Rejected because tests need mocks of imported modules, which becomes brittle.
- A heavier framework (e.g. NestJS). Rejected because the challenge forbids decorators (no TS) and we want explicit wiring.
