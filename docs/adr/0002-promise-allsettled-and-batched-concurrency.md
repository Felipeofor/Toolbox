# ADR 0002: `Promise.allSettled` and batched concurrency for upstream downloads

- **Status:** accepted
- **Date:** 2026-05-13
- **Tags:** resilience, performance

## Context

`GET /files/data` orchestrates one upstream download per file listed by `GET /v1/secret/files`. The naive approach (`for ... await`) is too slow when the listing has many files; `Promise.all` is faster but a single failure rejects the whole batch.

OTT-style content aggregation (the business Toolbox sits in) consumes many feeds simultaneously, and a single broken feed must not affect the rest.

## Decision

Process downloads in batches of `externalApi.downloadConcurrency` (default 5) using `Promise.allSettled` per batch:

- Each fulfilled result with at least one valid line is included in the response.
- Each rejected result is logged at `warn` level and omitted; the response is still 200.
- The concurrency cap protects the upstream from being hammered when the listing grows.

## Consequences

Positive:
- Partial outages produce partial (but useful) responses, with logs identifying which files failed and why.
- Memory footprint stays bounded regardless of listing size.

Negative:
- Slightly more code than `Promise.all`. The `successRate` summary surfaces what was dropped.

## Alternatives considered

- `Promise.all` without batching: rejected for resilience and concurrency control.
- A streaming response (NDJSON): rejected because the consigna explicitly asks for a JSON array.
