'use strict'

const express = require('express')
const cors = require('cors')
const config = require('config')
const pinoHttp = require('pino-http')

const logger = require('./logger')
const filesRouter = require('./routes/files')

function buildApp () {
  const app = express()

  app.use(cors({ origin: config.get('server.corsOrigin') }))
  app.use(pinoHttp({ logger }))

  app.get('/health', (req, res) => {
    res.type('application/json; charset=utf-8').json({ status: 'ok' })
  })

  app.use('/files', filesRouter)

  app.use((req, res) => {
    res.status(404).type('application/json; charset=utf-8').json({ error: 'not_found' })
  })

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    logger.error({ err }, 'unhandled error')
    res.status(500).type('application/json; charset=utf-8').json({ error: 'internal_error' })
  })

  return app
}

module.exports = buildApp
