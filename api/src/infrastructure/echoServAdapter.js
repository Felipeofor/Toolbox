'use strict'

const axios = require('axios')
const axiosRetry = require('axios-retry')
const CircuitBreaker = require('opossum')

const { UpstreamError } = require('../domain/errors')
const requestContext = require('../platform/requestContext')
const { buildTtlCache } = require('./ttlCache')

const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504])

function buildEchoServAdapter ({ config, logger }) {
  const { baseUrl, token, timeoutMs } = config.externalApi
  const retryCfg = config.externalApi.retry || { retries: 3, baseDelayMs: 200 }
  const breakerCfg = config.externalApi.circuitBreaker || {
    timeoutMs: 12000,
    errorThresholdPercentage: 50,
    resetTimeoutMs: 15000
  }

  const client = axios.create({
    baseURL: baseUrl,
    timeout: timeoutMs,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'text/csv, application/json'
    },
    transitional: { clarifyTimeoutError: true }
  })

  axiosRetry(client, {
    retries: retryCfg.retries,
    retryDelay: (retryCount) => retryCount * retryCfg.baseDelayMs,
    retryCondition: (err) => {
      const status = err.response && err.response.status
      if (status) return RETRYABLE_STATUS.has(status)
      // network / timeout / DNS
      return true
    },
    onRetry: (retryCount, error, requestConfig) => {
      logger.warn({
        op: requestConfig.url,
        attempt: retryCount,
        err: error.message
      }, 'retrying upstream call')
    }
  })

  // Propagate correlation header if a request context is active.
  client.interceptors.request.use((cfg) => {
    const reqId = requestContext.getRequestId()
    if (reqId) {
      cfg.headers = cfg.headers || {}
      cfg.headers['X-Request-Id'] = reqId
    }
    return cfg
  })

  function mapError (err, context) {
    const status = err.response
      ? err.response.status
      : (err.code === 'ETIMEDOUT' ? 504 : 502)
    logger.warn({ ...context, err: err.message, status }, 'upstream error')
    return new UpstreamError(`${context.op} failed`, { status, cause: err })
  }

  async function rawListFiles () {
    try {
      const res = await client.get('/v1/secret/files')
      if (!res.data || !Array.isArray(res.data.files)) {
        throw new UpstreamError('upstream returned an invalid listing shape', { status: 502 })
      }
      return res.data.files
    } catch (err) {
      if (err instanceof UpstreamError) throw err
      throw mapError(err, { op: 'listFiles' })
    }
  }

  async function rawDownloadFile (name) {
    try {
      const res = await client.get(`/v1/secret/file/${encodeURIComponent(name)}`, {
        responseType: 'text',
        transformResponse: [(data) => data]
      })
      return typeof res.data === 'string' ? res.data : String(res.data || '')
    } catch (err) {
      throw mapError(err, { op: 'downloadFile', file: name })
    }
  }

  const breakerOpts = {
    timeout: breakerCfg.timeoutMs,
    errorThresholdPercentage: breakerCfg.errorThresholdPercentage,
    resetTimeout: breakerCfg.resetTimeoutMs,
    name: 'echoServ'
  }

  const listBreaker = new CircuitBreaker(rawListFiles, breakerOpts)
  const downloadBreaker = new CircuitBreaker(rawDownloadFile, breakerOpts)

  listBreaker.on('open', () => logger.warn('circuit breaker OPEN: listFiles'))
  listBreaker.on('halfOpen', () => logger.info('circuit breaker HALF-OPEN: listFiles'))
  listBreaker.on('close', () => logger.info('circuit breaker CLOSED: listFiles'))

  downloadBreaker.on('open', () => logger.warn('circuit breaker OPEN: downloadFile'))
  downloadBreaker.on('halfOpen', () => logger.info('circuit breaker HALF-OPEN: downloadFile'))
  downloadBreaker.on('close', () => logger.info('circuit breaker CLOSED: downloadFile'))

  const cache = buildTtlCache({ ttlMs: config.externalApi.cacheTtlMs || 0 })

  async function listFiles () {
    if (config.externalApi.cacheTtlMs > 0) {
      return cache.memoize('list', () => listBreaker.fire().catch(reThrowBreaker))
    }
    return listBreaker.fire().catch(reThrowBreaker)
  }

  async function downloadFile (name) {
    return downloadBreaker.fire(name).catch(reThrowBreaker)
  }

  function reThrowBreaker (err) {
    if (err instanceof UpstreamError) throw err
    if (err && err.code === 'EOPENBREAKER') {
      throw new UpstreamError('circuit breaker open', { status: 503, cause: err })
    }
    if (err && err.code === 'ETIMEDOUT') {
      throw new UpstreamError('upstream timed out', { status: 504, cause: err })
    }
    throw new UpstreamError(err.message || 'upstream failed', { status: 502, cause: err })
  }

  function shutdown () {
    listBreaker.shutdown()
    downloadBreaker.shutdown()
    cache.clear()
  }

  return { listFiles, downloadFile, shutdown, _cache: cache }
}

module.exports = { buildEchoServAdapter }
