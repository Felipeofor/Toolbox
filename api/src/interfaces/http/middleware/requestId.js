'use strict'

const { v4: uuidv4 } = require('uuid')

const requestContext = require('../../../platform/requestContext')

const HEADER = 'x-request-id'

function buildRequestIdMiddleware () {
  return function requestId (req, res, next) {
    const incoming = req.headers[HEADER]
    const id = typeof incoming === 'string' && incoming.length > 0 && incoming.length <= 128
      ? incoming
      : uuidv4()
    req.id = id
    res.setHeader('X-Request-Id', id)
    requestContext.run({ requestId: id }, next)
  }
}

module.exports = { buildRequestIdMiddleware, HEADER }
