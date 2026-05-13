# ADR 0004: Explicit dependency injection via a composition root

- **Status:** accepted
- **Date:** 2026-05-13
- **Tags:** architecture, testing

## Context

Use cases need access to a logger, configuration, an upstream client and a CSV parser. The naive solution is to `require` these from each module, but that creates module-level singletons that are hard to swap in tests and impossible to reconfigure per environment without reloading modules.

## Decision

Every collaborator is built by a factory (`buildXxx({ deps })`). A single composition root, `src/platform/container.js`:

1. Loads the config.
2. Builds the logger and the metrics registry.
3. Builds the upstream adapter and the parser, passing in `config` and `logger`.
4. Builds each use case with the adapter and parser injected.
5. Returns a container object: `{ config, logger, metrics, fileSource, parseCsv, useCases }`.

`buildContainer(overrides = {})` allows tests to substitute any dependency without touching the production wiring.

## Consequences

Positive:
- Tests at the application layer use plain fakes; no `proxyquire` or `jest.mock`.
- Easy to add cross-cutting concerns (tracing, metrics) at the root without touching domain code.
- Clear dependency graph: every collaborator is listed in one place.

Negative:
- Two extra lines per use case (the factory + the destructuring of deps). Negligible.

## Alternatives considered

- A DI container library (Awilix, InversifyJS). Rejected; for ~6 modules a hand-rolled container is simpler and dependency-free.
- Singletons via `require`. Rejected because of test friction (described above).
