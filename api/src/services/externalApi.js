'use strict'

const axios = require('axios')
const config = require('config')

const logger = require('../logger')

class ExternalApiError extends Error {
  constructor (message, { status, cause } = {}) {
    super(message)
    this.name = 'ExternalApiError'
    this.status = status
    if (cause) this.cause = cause
  }
}

function buildClient () {
  const baseURL = config.get('externalApi.baseUrl')
  const token = config.get('externalApi.token')
  const timeout = config.get('externalApi.timeoutMs')

  return axios.create({
    baseURL,
    timeout,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'text/csv, application/json'
    },
    transitional: { clarifyTimeoutError: true }
  })
}

let client

function getClient () {
  if (!client) client = buildClient()
  return client
}

// Exposed for tests to reset the cached client between runs.
function _resetClient () {
  client = null
}

async function listFiles () {
  try {
    const res = await getClient().get('/v1/secret/files')
    if (!res.data || !Array.isArray(res.data.files)) {
      throw new ExternalApiError('list response missing files array', { status: 502 })
    }
    return res.data.files
  } catch (err) {
    if (err instanceof ExternalApiError) throw err
    const status = err.response ? err.response.status : (err.code === 'ETIMEDOUT' ? 504 : 502)
    logger.warn({ err: err.message, status }, 'listFiles failed')
    throw new ExternalApiError('listFiles failed', { status, cause: err })
  }
}

async function downloadFile (name) {
  if (!name || typeof name !== 'string') {
    throw new ExternalApiError('downloadFile requires a file name', { status: 400 })
  }
  try {
    const res = await getClient().get(`/v1/secret/file/${encodeURIComponent(name)}`, {
      responseType: 'text',
      transformResponse: [(data) => data]
    })
    return typeof res.data === 'string' ? res.data : String(res.data || '')
  } catch (err) {
    const status = err.response ? err.response.status : (err.code === 'ETIMEDOUT' ? 504 : 502)
    logger.warn({ file: name, err: err.message, status }, 'downloadFile failed')
    throw new ExternalApiError(`downloadFile failed: ${name}`, { status, cause: err })
  }
}

module.exports = {
  listFiles,
  downloadFile,
  ExternalApiError,
  _resetClient
}
