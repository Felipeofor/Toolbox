'use strict'

const nodeConfig = require('config')
const Ajv = require('ajv')

const schema = require('./configSchema')

const DEFAULTS = {
  server: { shutdownTimeoutMs: 10000 },
  externalApi: {
    cacheTtlMs: 30000,
    retry: { retries: 3, baseDelayMs: 200 },
    circuitBreaker: { timeoutMs: 12000, errorThresholdPercentage: 50, resetTimeoutMs: 15000 }
  }
}

function getOptional (path, fallback) {
  return nodeConfig.has(path) ? nodeConfig.get(path) : fallback
}

function loadConfig () {
  const cfg = {
    server: {
      port: nodeConfig.get('server.port'),
      corsOrigin: nodeConfig.get('server.corsOrigin'),
      rateLimit: getOptional('server.rateLimit', { windowMs: 60000, max: 120 }),
      shutdownTimeoutMs: getOptional('server.shutdownTimeoutMs', DEFAULTS.server.shutdownTimeoutMs)
    },
    externalApi: {
      baseUrl: nodeConfig.get('externalApi.baseUrl'),
      token: nodeConfig.get('externalApi.token'),
      timeoutMs: nodeConfig.get('externalApi.timeoutMs'),
      downloadConcurrency: getOptional('externalApi.downloadConcurrency', 5),
      cacheTtlMs: getOptional('externalApi.cacheTtlMs', DEFAULTS.externalApi.cacheTtlMs),
      retry: getOptional('externalApi.retry', DEFAULTS.externalApi.retry),
      circuitBreaker: getOptional('externalApi.circuitBreaker', DEFAULTS.externalApi.circuitBreaker)
    },
    log: {
      level: getOptional('log.level', 'info')
    }
  }

  const ajv = new Ajv({ allErrors: true, useDefaults: false })
  const validate = ajv.compile(schema)
  if (!validate(cfg)) {
    const messages = (validate.errors || [])
      .map((e) => `${e.instancePath || '(root)'} ${e.message}`)
      .join('; ')
    throw new Error(`Invalid configuration: ${messages}`)
  }

  return cfg
}

module.exports = { loadConfig }
