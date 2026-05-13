'use strict'

const config = require('config')
const buildApp = require('./app')
const logger = require('./logger')

const port = config.get('server.port')
const app = buildApp()

app.listen(port, () => {
  logger.info({ port }, 'toolbox-api listening')
})
