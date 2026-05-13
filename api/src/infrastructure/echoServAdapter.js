'use strict'

const axios = require('axios')

const { UpstreamError } = require('../domain/errors')

/**
 * Port: FileSourcePort
 *   listFiles(): Promise<string[]>
 *   downloadFile(name: string): Promise<string>  // raw CSV content
 *
 * This adapter implements the port against echo-serv.tbxnet.com.
 */
function buildEchoServAdapter ({ config, logger }) {
  const baseURL = config.externalApi.baseUrl
  const token = config.externalApi.token
  const timeout = config.externalApi.timeoutMs

  const client = axios.create({
    baseURL,
    timeout,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'text/csv, application/json'
    },
    transitional: { clarifyTimeoutError: true }
  })

  function mapError (err, context) {
    const status = err.response
      ? err.response.status
      : (err.code === 'ETIMEDOUT' ? 504 : 502)
    logger.warn({ ...context, err: err.message, status }, 'upstream error')
    return new UpstreamError(`${context.op} failed`, { status, cause: err })
  }

  async function listFiles () {
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

  async function downloadFile (name) {
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

  return { listFiles, downloadFile }
}

module.exports = { buildEchoServAdapter }
