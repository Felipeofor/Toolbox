'use strict'

const helmet = require('helmet')
const cors = require('cors')
const rateLimit = require('express-rate-limit')

function buildSecurityMiddleware ({ config }) {
  const limiter = rateLimit({
    windowMs: config.server.rateLimit.windowMs,
    max: config.server.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'rate_limited' }
  })

  return [
    helmet(),
    cors({ origin: config.server.corsOrigin }),
    limiter
  ]
}

module.exports = { buildSecurityMiddleware }
