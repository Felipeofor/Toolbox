# ADR 0003: Configuration via JSON files, validated with JSON Schema

- **Status:** accepted
- **Date:** 2026-05-13
- **Tags:** config, security

## Context

The challenge consigna forbids depending on environment variables of the OS. We still need configurable knobs (port, upstream URL, token, timeouts, retry/breaker, log level) and a way to validate them at boot to fail fast on mistakes.

## Decision

Use `node-config` to read from layered JSON files:

- `config/default.json` — committed, sane defaults.
- `config/test.json` — committed, applies when `NODE_ENV=test`.
- `config/local.json` — gitignored, lets a dev override the port or log level on their machine without touching defaults or relying on env vars.

After load, validate the resulting object against a JSON Schema (Ajv, `additionalProperties: false`). Unknown fields or wrong types throw at boot; the process exits before any request is served.

## Consequences

Positive:
- Reviewer can run `npm start` without any setup beyond `npm install`.
- Misconfiguration is caught at boot, not as a 500 in production.
- Schema doubles as documentation of the supported keys.

Negative:
- Secrets live in `config/default.json`. Acceptable for this challenge (the token is provided in the consigna), but a real deployment should resolve secrets via Vault / KMS — see ADR-0006 for follow-up notes.

## Alternatives considered

- `dotenv` + `process.env`: rejected because the consigna forbids env-var dependencies.
- A hand-written validator: rejected because Ajv with a schema is more declarative and gives multi-error reporting.
