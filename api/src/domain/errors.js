'use strict'

class AppError extends Error {
  constructor (message, { status = 500, code = 'app_error', cause } = {}) {
    super(message)
    this.name = this.constructor.name
    this.status = status
    this.code = code
    if (cause) this.cause = cause
  }
}

class ValidationError extends AppError {
  constructor (message, opts = {}) {
    super(message, { status: 400, code: 'validation_error', ...opts })
  }
}

class NotFoundError extends AppError {
  constructor (message, opts = {}) {
    super(message, { status: 404, code: 'not_found', ...opts })
  }
}

class UpstreamError extends AppError {
  constructor (message, opts = {}) {
    const status = opts.status || 502
    super(message, { code: 'upstream_error', ...opts, status })
  }
}

module.exports = { AppError, ValidationError, NotFoundError, UpstreamError }
