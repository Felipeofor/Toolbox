# Architecture Decision Records

This folder collects ADRs in [Michael Nygard's format](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions). Use `0000-template.md` when adding a new one.

## Index

| # | Title | Status |
|---|---|---|
| 0001 | [Hexagonal architecture for the API](0001-hexagonal-architecture.md) | accepted |
| 0002 | [`Promise.allSettled` + batched concurrency](0002-promise-allsettled-and-batched-concurrency.md) | accepted |
| 0003 | [Configuration without env vars, validated with JSON Schema](0003-config-without-env-vars.md) | accepted |
| 0004 | [Explicit DI via composition root](0004-dependency-injection-composition-root.md) | accepted |
| 0005 | [API versioning via URL prefix with legacy alias](0005-api-versioning-strategy.md) | accepted |
| 0006 | [Resilience: cache + retry + circuit breaker](0006-resilience-cache-retry-circuit-breaker.md) | accepted |
| 0007 | [Correlation IDs via `AsyncLocalStorage`](0007-correlation-ids-async-local-storage.md) | accepted |
