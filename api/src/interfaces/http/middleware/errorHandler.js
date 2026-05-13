'use strict'

const { AppError } = require('../../../domain/errors')

function jsonHeader (res) {
  res.type('application/json; charset=utf-8')
}

function buildErrorHandler ({ logger }) {
  return function errorHandler (err, req, res, _next) {
    jsonHeader(res)
    if (err instanceof AppError) {
      return res.status(err.status).json({ error: err.code, message: err.message })
    }
    logger.error({ err: err.message, stack: err.stack }, 'unhandled error')
    return res.status(500).json({ error: 'internal_error' })
  }
}

function notFoundHandler (_req, res) {
  jsonHeader(res)
  return res.status(404).json({ error: 'not_found' })
}

module.exports = { buildErrorHandler, notFoundHandler }
