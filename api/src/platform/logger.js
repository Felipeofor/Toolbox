'use strict'

const pino = require('pino')

function buildLogger ({ level = 'info' } = {}) {
  return pino({
    level,
    base: undefined,
    timestamp: pino.stdTimeFunctions.isoTime
  })
}

module.exports = { buildLogger }
