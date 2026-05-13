# ADR 0006: Upstream resilience: TTL cache + retry with backoff + circuit breaker

- **Status:** accepted
- **Date:** 2026-05-13
- **Tags:** resilience, observability

## Context

The upstream `echo-serv.tbxnet.com` is the only data source for our API. Three failure modes will happen in production:

1. Transient network errors and 5xx responses.
2. Periods of upstream slowness or hard outages.
3. Bursts of requests producing identical listings that we re-fetch.

Without explicit handling, these turn into cascading failures and unnecessary load.

## Decision

Layer three independent mechanisms inside `echoServAdapter`:

1. **TTL cache** (`infrastructure/ttlCache.js`) for `listFiles()` only. The listing changes rarely; download URLs are unique per file and not worth caching. TTL is configurable (`externalApi.cacheTtlMs`, default 30 s, set to 0 in tests).
2. **Retry with backoff** via `axios-retry`. Retries on network errors and on the retryable HTTP statuses (408, 425, 429, 500, 502, 503, 504). Backoff is linear (`attempt * baseDelayMs`) to keep behavior predictable; non-retryable 4xx responses fail fast.
3. **Circuit breaker** via `opossum` around both `listFiles()` and `downloadFile()`. Opens when error rate exceeds `errorThresholdPercentage` and stays open for `resetTimeoutMs`. Half-open state is logged. Open-circuit failures surface as `503 upstream` so the caller can implement its own backoff.

All three are off by default in tests (`config/test.json`) so unit tests stay fast and deterministic.

## Consequences

Positive:
- Transient blips become invisible to the client.
- Sustained outages return fast 503s instead of dragging requests through long timeouts.
- Cache hit rate is observable via `prom-client` if we wire counters later (not done now to keep the diff small).

Negative:
- Three more dependencies. Each is small (`axios-retry`, `opossum`, no transitive heavy graph).
- Tests of the adapter must explicitly opt into / out of these behaviors (handled in the test config).

## Alternatives considered

- DIY retry/breaker: rejected; the libraries have been battle-tested and are tiny.
- Redis-backed cache: overkill for this single-process service.
- Skipping resilience because the consigna doesn't require it: rejected; this is exactly the kind of plumbing a Team Lead is expected to add.
