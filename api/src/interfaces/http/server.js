'use strict'

const path = require('path')
const fs = require('fs')

const express = require('express')
const pinoHttp = require('pino-http')
const swaggerUi = require('swagger-ui-express')
const yaml = require('js-yaml')

const { buildSecurityMiddleware } = require('./middleware/security')
const { buildErrorHandler, notFoundHandler } = require('./middleware/errorHandler')
const { buildFilesRouter } = require('./filesRouter')
const { buildHealthRouter } = require('./healthRouter')

function loadOpenApiDocument () {
  const file = path.join(__dirname, 'openapi', 'openapi.yaml')
  return yaml.load(fs.readFileSync(file, 'utf8'))
}

function buildHttpServer ({ config, logger, metrics, fileSource, useCases }) {
  const app = express()

  app.disable('x-powered-by')

  // Trust proxy if needed (rate limit + X-Forwarded-For). Conservative default.
  app.set('trust proxy', 1)

  buildSecurityMiddleware({ config }).forEach((mw) => app.use(mw))
  app.use(pinoHttp({ logger }))
  app.use(metrics.middleware)

  // Readiness checks the upstream is reachable.
  const readinessProbe = async () => {
    try {
      await fileSource.listFiles()
      return true
    } catch (_err) {
      return false
    }
  }

  app.use(buildHealthRouter({ readinessProbe }))
  app.use('/files', buildFilesRouter({ useCases }))

  app.get('/metrics', async (_req, res) => {
    res.set('Content-Type', metrics.registry.contentType)
    res.send(await metrics.registry.metrics())
  })

  const openApiDoc = loadOpenApiDocument()
  app.get('/openapi.json', (_req, res) => res.json(openApiDoc))
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDoc))

  app.use(notFoundHandler)
  app.use(buildErrorHandler({ logger }))

  return app
}

module.exports = { buildHttpServer }
