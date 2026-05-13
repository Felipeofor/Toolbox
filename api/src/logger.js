'use strict'

const config = require('config')
const pino = require('pino')

const level = config.has('log.level') ? config.get('log.level') : 'info'

const logger = pino({
  level,
  base: undefined,
  timestamp: pino.stdTimeFunctions.isoTime
})

module.exports = logger
