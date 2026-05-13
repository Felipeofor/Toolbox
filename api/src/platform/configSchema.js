'use strict'

module.exports = {
  type: 'object',
  required: ['server', 'externalApi', 'log'],
  additionalProperties: false,
  properties: {
    server: {
      type: 'object',
      required: ['port', 'corsOrigin', 'rateLimit'],
      additionalProperties: false,
      properties: {
        port: { type: 'integer', minimum: 0, maximum: 65535 },
        corsOrigin: { type: 'string', minLength: 1 },
        rateLimit: {
          type: 'object',
          required: ['windowMs', 'max'],
          additionalProperties: false,
          properties: {
            windowMs: { type: 'integer', minimum: 100 },
            max: { type: 'integer', minimum: 1 }
          }
        },
        shutdownTimeoutMs: { type: 'integer', minimum: 0 }
      }
    },
    externalApi: {
      type: 'object',
      required: ['baseUrl', 'token', 'timeoutMs', 'downloadConcurrency'],
      additionalProperties: false,
      properties: {
        baseUrl: { type: 'string', pattern: '^https?://' },
        token: { type: 'string', minLength: 1 },
        timeoutMs: { type: 'integer', minimum: 100 },
        downloadConcurrency: { type: 'integer', minimum: 1, maximum: 100 },
        cacheTtlMs: { type: 'integer', minimum: 0 },
        retry: {
          type: 'object',
          additionalProperties: false,
          properties: {
            retries: { type: 'integer', minimum: 0, maximum: 10 },
            baseDelayMs: { type: 'integer', minimum: 0 }
          }
        },
        circuitBreaker: {
          type: 'object',
          additionalProperties: false,
          properties: {
            timeoutMs: { type: 'integer', minimum: 100 },
            errorThresholdPercentage: { type: 'integer', minimum: 1, maximum: 100 },
            resetTimeoutMs: { type: 'integer', minimum: 100 }
          }
        }
      }
    },
    log: {
      type: 'object',
      required: ['level'],
      additionalProperties: false,
      properties: {
        level: { type: 'string', enum: ['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'silent'] }
      }
    }
  }
}
