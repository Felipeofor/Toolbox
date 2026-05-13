# ADR 0005: API versioning via URL prefix, with legacy alias

- **Status:** accepted
- **Date:** 2026-05-13
- **Tags:** api, public-contract

## Context

The consigna defines `GET /files/data` as the canonical endpoint. Once we ship to consumers, any breaking change to that path is a public-contract break, so the API should have a simple evolution path from the start.

## Decision

Mount the same router under two prefixes:

- `/files/*` — legacy, kept to honor the original challenge contract verbatim.
- `/v1/files/*` — versioned alias, advertised in OpenAPI as the preferred path for new consumers.

Both paths are served by the same Express router and return identical responses. Future breaking changes will live in `/v2/...`; `/v1/...` will be supported for a deprecation window agreed with consumers.

## Consequences

Positive:
- No breakage for the reviewer, who can still hit `/files/data` exactly as the consigna documents.
- New consumers get a stable contract under `/v1/...`.
- Adding `/v2/...` later does not invalidate existing integrations.

Negative:
- Two paths to test (covered with a single test that asserts identical responses).

## Alternatives considered

- Versioning via `Accept: application/vnd.toolbox.v1+json`: more "RESTful" but harder to test from a browser and most consumers don't set custom Accept headers.
- No versioning at all: rejected; the cost of adding it now is trivial compared to the cost of breaking consumers later.
